import { useEffect, useRef, useState, type ReactNode } from 'react';
import L from 'leaflet';
import AMapLoader from '@amap/amap-jsapi-loader';
import {
  Compass,
  Layers,
  MapPinPlus,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  X,
  Satellite,
  Globe2,
  Box,
  KeyRound,
  Check,
  Map,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// 扩展全局类型支持高德安全配置
declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode?: string;
    };
  }
}

export interface MapPoint {
  id: string;
  label: string;
  lnglat?: [number, number]; // [经度, 纬度] 真实 GPS 坐标
  x?: number; // 0 ~ 100 兼容百分比
  y?: number; // 0 ~ 100 兼容百分比
  status: 'deployed' | 'pending' | 'warning' | 'offline' | 'dimmed';
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  circuit?: string;
  pole?: string;
  power?: number;
  voltage?: number;
  temperature?: number;
  dimming?: number;
}

interface InteractiveMapCanvasProps {
  points: MapPoint[];
  selectedPointId?: string | null;
  onPointClick: (point: MapPoint) => void;
  onCanvasClick?: (coords: { lnglat: [number, number]; x?: number; y?: number }) => void;
  renderPointContent?: (point: MapPoint, isSelected: boolean) => ReactNode;
  stationName?: string;
  roadName?: string;
  centerLnglat?: [number, number];
  zoom?: number;
  legend?: ReactNode;
  enableAddMode?: boolean;
  className?: string;
}

// 默认高德演示 Key
const DEFAULT_AMAP_KEY = '2e44d3d78906be7dd626ad9ee0c38466';
const DEFAULT_AMAP_SECURITY = '928230559f2e30f1d3c9ea5a9d821217';

export function InteractiveMapCanvas({
  points,
  selectedPointId,
  onPointClick,
  onCanvasClick,
  renderPointContent,
  stationName = '高崎空港互通示范站',
  roadName = '枋钟路立交与迎宾高架',
  centerLnglat = [118.1355, 24.5386],
  zoom = 15,
  legend,
  enableAddMode = false,
  className,
}: InteractiveMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletDivRef = useRef<HTMLDivElement>(null);
  const amapDivRef = useRef<HTMLDivElement>(null);

  // 双引擎模式：'leaflet' (免Key真实暗夜底图，默认) | 'amap' (高德官方 WebGL 3D)
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'amap'>('leaflet');

  // Leaflet 实例与图层
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);
  const [leafletLayerType, setLeafletLayerType] = useState<'dark' | 'vector' | 'satellite'>('dark');

  // 高德 AMap 实例与图层
  const aMapRef = useRef<any>(null);
  const aMapInstanceRef = useRef<any>(null);
  const aMapMarkersRef = useRef<any[]>([]);
  const aMapSatelliteLayerRef = useRef<any>(null);
  const [isAmap3D, setIsAmap3D] = useState(true);
  const [isAmapSatellite, setIsAmapSatellite] = useState(false);

  const [currentZoom, setCurrentZoom] = useState(zoom);

  // 插旗建点模式
  const [isAddMode, setIsAddMode] = useState(false);
  const isAddModeRef = useRef(false);
  isAddModeRef.current = isAddMode;

  // Key 配置对话框状态
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [customKey, setCustomKey] = useState(
    () => localStorage.getItem('TOPSTAR_AMAP_KEY') || ''
  );
  const [customSecurity, setCustomSecurity] = useState(
    () => localStorage.getItem('TOPSTAR_AMAP_SECURITY') || ''
  );

  // 1. 初始化并挂载 Leaflet 免 Key 真实底图 (默认引擎)
  useEffect(() => {
    if (!leafletDivRef.current) return;
    if (leafletMapRef.current) return;

    // Leaflet 坐标为 [纬度, 经度]
    const map = L.map(leafletDivRef.current, {
      center: [centerLnglat[1], centerLnglat[0]],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      preferCanvas: true,
    });

    leafletMapRef.current = map;

    // 添加默认 CartoDB Dark Matter 暗黑极客真实道路切片 (免Key全球秒开)
    const darkTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        crossOrigin: true,
      }
    );
    darkTile.addTo(map);
    leafletTileLayerRef.current = darkTile;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // 监听点击插旗建点
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!isAddModeRef.current) return;
      const lng = Number(e.latlng.lng.toFixed(6));
      const lat = Number(e.latlng.lat.toFixed(6));
      onCanvasClick?.({ lnglat: [lng, lat], x: 50, y: 50 });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // 2. 切换 Leaflet 真实底图类型 (免Key暗夜 / 免Key高德路网 / 免Key卫星)
  const switchLeafletLayer = (type: 'dark' | 'vector' | 'satellite') => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (leafletTileLayerRef.current) {
      map.removeLayer(leafletTileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains: string | string[] = 'abcd';
    let maxZoom = 19;

    if (type === 'vector') {
      // 高德免密直链矢量路网
      url = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
      subdomains = '1234';
      maxZoom = 18;
    } else if (type === 'satellite') {
      // 高德免密直链卫星遥感
      url = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
      subdomains = '1234';
      maxZoom = 18;
    }

    const newLayer = L.tileLayer(url, { subdomains, maxZoom, crossOrigin: true });
    newLayer.addTo(map);
    leafletTileLayerRef.current = newLayer;
    setLeafletLayerType(type);
    toast.success(`已切换为：${type === 'dark' ? 'CartoDB 极客暗夜图' : type === 'vector' ? '高德高清路网' : '高德卫星航拍图'}`);
  };

  // 3. 渲染 Leaflet Marker 点位
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // 清空现有 Marker
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    points.forEach((point) => {
      if (!point.lnglat) return;
      const isSelected = point.id === selectedPointId;

      let bgClass = 'bg-brand-500/20 text-brand-300 border-brand-400';
      let ringClass = 'bg-brand-400/40';
      let icon = '📍';

      if (point.status === 'deployed') {
        bgClass = 'bg-emerald-500/30 text-emerald-300 border-emerald-400';
        ringClass = 'bg-emerald-400/50';
        icon = '💡';
      } else if (point.status === 'dimmed') {
        bgClass = 'bg-cyan-500/30 text-cyan-300 border-cyan-400';
        ringClass = 'bg-cyan-400/50';
        icon = '🔅';
      } else if (point.status === 'warning') {
        bgClass = 'bg-amber-500/30 text-amber-300 border-amber-400';
        ringClass = 'bg-amber-400/50';
        icon = '⚠️';
      } else if (point.status === 'offline') {
        bgClass = 'bg-rose-500/30 text-rose-300 border-rose-400';
        ringClass = 'bg-rose-400/50';
        icon = '🔌';
      } else if (point.status === 'pending') {
        bgClass = 'bg-slate-800/80 text-slate-300 border-slate-500 border-dashed';
        ringClass = 'bg-slate-400/20';
        icon = '➕';
      }

      const customHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none group cursor-pointer">
          <div class="absolute -inset-1.5 rounded-full ${ringClass} ${isSelected ? 'animate-ping' : ''}"></div>
          <div class="relative flex items-center justify-center size-7 rounded-full border ${bgClass} shadow-xl backdrop-blur transition-transform duration-200 group-hover:scale-125 ${
            isSelected ? 'ring-2 ring-brand-400 scale-125' : ''
          }">
            <span class="text-xs leading-none">${icon}</span>
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-mono font-medium shadow pointer-events-none transition-all ${
            isSelected
              ? 'bg-brand-500 text-slate-950 font-bold scale-105'
              : 'bg-slate-950/90 text-slate-200 border border-white/20'
          }">
            ${point.label}
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        html: customHtml,
        className: 'topstar-leaflet-marker',
        iconSize: [30, 30],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([point.lnglat[1], point.lnglat[0]], { icon: divIcon });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onPointClick(point);
      });

      marker.addTo(map);
      leafletMarkersRef.current.push(marker);
    });
  }, [points, selectedPointId, onPointClick]);

  // 4. 监听场站切换中心坐标平滑飞入 (Leaflet)
  useEffect(() => {
    if (leafletMapRef.current && centerLnglat) {
      leafletMapRef.current.flyTo([centerLnglat[1], centerLnglat[0]], zoom, { duration: 0.8 });
      setCurrentZoom(zoom);
    }
  }, [centerLnglat, zoom]);

  // 5. 初始化高德 AMap 实例（当且仅当切换至 amap 引擎时）
  useEffect(() => {
    if (mapEngine !== 'amap' || !amapDivRef.current) return;

    let isMounted = true;
    const effectiveKey = customKey || DEFAULT_AMAP_KEY;
    const effectiveSecurity = customSecurity || DEFAULT_AMAP_SECURITY;

    window._AMapSecurityConfig = {
      securityJsCode: effectiveSecurity,
    };

    AMapLoader.load({
      key: effectiveKey,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    })
      .then((AMap) => {
        if (!isMounted || !amapDivRef.current) return;
        aMapRef.current = AMap;

        if (aMapInstanceRef.current) {
          aMapInstanceRef.current.destroy();
          aMapInstanceRef.current = null;
        }

        const map = new AMap.Map(amapDivRef.current, {
          viewMode: '3D',
          pitch: isAmap3D ? 35 : 0,
          zoom: currentZoom,
          center: centerLnglat,
          mapStyle: 'amap://styles/darkblue',
          features: ['bg', 'road', 'building', 'point'],
          showBuildingBlock: true,
        });

        aMapInstanceRef.current = map;

        map.on('zoomchange', () => {
          setCurrentZoom(Math.round(map.getZoom()));
        });

        map.on('click', (e: any) => {
          if (!isAddModeRef.current) return;
          const lng = Number(e.lnglat.getLng().toFixed(6));
          const lat = Number(e.lnglat.getLat().toFixed(6));
          onCanvasClick?.({ lnglat: [lng, lat], x: 50, y: 50 });
        });
      })
      .catch((err) => {
        console.warn('高德在线 SDK 异常，建议切回免 Key 模式:', err);
        toast.error('高德鉴权拦截或无有效 Key，建议切换回【免 Key 暗夜真实底图】');
      });

    return () => {
      isMounted = false;
      if (aMapInstanceRef.current) {
        aMapInstanceRef.current.destroy();
        aMapInstanceRef.current = null;
      }
    };
  }, [mapEngine, customKey, customSecurity]);

  // 6. 阻断滚轮穿透到外层页面：在地图容器内部滚动时，只缩放地图，外层页面绝对不上下滚动
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      // 停止向上冒泡并阻止默认滚动行为
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheelNative, { passive: true });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // 7. 监听插旗建点模式：更新光标
  useEffect(() => {
    if (leafletMapRef.current) {
      const container = leafletMapRef.current.getContainer();
      container.style.cursor = isAddMode ? 'crosshair' : 'grab';
    }
    if (aMapInstanceRef.current) {
      aMapInstanceRef.current.setDefaultCursor(isAddMode ? 'crosshair' : 'grab');
    }
  }, [isAddMode, mapEngine]);

  // 8. Esc 快捷键与点击外部退出建点模式
  useEffect(() => {
    if (!isAddMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddMode(false);
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsAddMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAddMode]);

  // 视角重置
  const handleReset = () => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.setView([centerLnglat[1], centerLnglat[0]], zoom);
      setCurrentZoom(zoom);
    } else if (mapEngine === 'amap' && aMapInstanceRef.current) {
      aMapInstanceRef.current.setZoomAndCenter(zoom, centerLnglat, false, 500);
      aMapInstanceRef.current.setPitch(isAmap3D ? 35 : 0);
      setCurrentZoom(zoom);
    }
  };

  const handleZoomIn = () => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    } else if (aMapInstanceRef.current) {
      aMapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    } else if (aMapInstanceRef.current) {
      aMapInstanceRef.current.zoomOut();
    }
  };

  // 切换引擎
  const handleToggleEngine = (newEngine: 'leaflet' | 'amap') => {
    setMapEngine(newEngine);
    if (newEngine === 'amap' && !customKey) {
      toast.info('已切至高德官方模式。若底图出现黑屏，可点击右上角 ⚙️ 输入你申请的专属 Key');
    } else if (newEngine === 'leaflet') {
      toast.success('已切换为【Leaflet 100% 免 Key 真实暗夜底图】');
    }
  };

  // 保存自定义 Key
  const handleSaveKey = () => {
    localStorage.setItem('TOPSTAR_AMAP_KEY', customKey.trim());
    localStorage.setItem('TOPSTAR_AMAP_SECURITY', customSecurity.trim());
    setIsKeyDialogOpen(false);
    toast.success('高德 Key 保存成功！已自动生效。');
    if (mapEngine !== 'amap') {
      setMapEngine('amap');
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ overscrollBehavior: 'contain' }}
      className={cn(
        'relative h-[560px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#060c18] shadow-2xl select-none',
        className
      )}
    >
      {/* 引擎 1：Leaflet 免 Key 真实暗夜地图 (默认显示) */}
      <div
        ref={leafletDivRef}
        id="topstar-leaflet-container"
        className={cn(
          'absolute inset-0 size-full transition-opacity duration-300',
          mapEngine === 'leaflet' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
        )}
      />

      {/* 引擎 2：高德 WebGL 3D 官方地图 */}
      <div
        ref={amapDivRef}
        id="topstar-amap-container"
        className={cn(
          'absolute inset-0 size-full transition-opacity duration-300',
          mapEngine === 'amap' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
        )}
      />

      {/* 顶部左侧：当前场站真实 GPS 信息条与免Key认证徽章 */}
      <div className="map-hud-info absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 backdrop-blur z-20 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">{stationName}</span>
          <span className="text-[10px] text-slate-400 font-mono">[{roadName}]</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300">
          <span>坐标: {centerLnglat[0]}, {centerLnglat[1]}</span>
          <span className="text-slate-600">|</span>
          <span className={cn('px-1.5 py-0.2 rounded font-semibold', mapEngine === 'leaflet' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300')}>
            {mapEngine === 'leaflet' ? '🌐 免Key真实暗夜底图 (在线)' : '🚀 高德官方 WebGL'}
          </span>
          <span className="text-slate-600">|</span>
          <span>缩放: {currentZoom} 级</span>
        </div>
      </div>

      {/* 顶部建点模式醒目横幅 */}
      {isAddMode && (
        <div className="map-hud-banner pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/25 px-4 py-1.5 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-2">
          <span className="size-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-medium text-amber-200">
            插旗建点模式已激活：点击真实路面获取 GPS 经纬度
          </span>
          <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
            按 Esc 退出
          </span>
        </div>
      )}

      {/* 右上角地图控制面板：双引擎切换、图层切换、缩放 */}
      <div className="map-control-btn absolute right-3 top-3 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-slate-900/85 p-1.5 shadow-xl backdrop-blur z-20">
        {/* 插旗建点按钮 */}
        {(enableAddMode || onCanvasClick) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAddMode(!isAddMode)}
            title={isAddMode ? '退出建点模式 (Esc)' : '激活插旗建点模式'}
            className={cn(
              'h-8 px-2.5 text-xs font-medium transition-all gap-1.5',
              isAddMode
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/30'
                : 'text-slate-200 hover:bg-white/15 hover:text-white'
            )}
          >
            {isAddMode ? (
              <>
                <X className="size-3.5" />
                <span>退出建点</span>
              </>
            ) : (
              <>
                <MapPinPlus className="size-3.5 text-amber-400" />
                <span className="text-[11px]">插旗建点</span>
              </>
            )}
          </Button>
        )}

        {/* 核心双引擎切换：Leaflet 免Key vs 高德官方 */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-black/40 rounded-lg border border-white/5">
          <button
            onClick={() => handleToggleEngine('leaflet')}
            className={cn(
              'py-1 text-[10px] font-medium rounded transition-all text-center',
              mapEngine === 'leaflet'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            )}
          >
            免Key暗夜
          </button>
          <button
            onClick={() => handleToggleEngine('amap')}
            className={cn(
              'py-1 text-[10px] font-medium rounded transition-all text-center',
              mapEngine === 'amap'
                ? 'bg-brand-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            )}
          >
            高德3D
          </button>
        </div>

        {/* 若处于 Leaflet 模式：可切换 暗夜极客 / 高德路网 / 卫星影像 */}
        {mapEngine === 'leaflet' && (
          <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => switchLeafletLayer(leafletLayerType === 'dark' ? 'vector' : leafletLayerType === 'vector' ? 'satellite' : 'dark')}
              className="h-7 px-2 text-[11px] text-slate-300 hover:bg-white/10 gap-1 justify-between"
              title="切换底图风格"
            >
              <span className="text-[10px] text-slate-400">图层:</span>
              <span className="text-brand-300 font-mono text-[10px]">
                {leafletLayerType === 'dark' ? '极客深蓝' : leafletLayerType === 'vector' ? '高德路网' : '卫星影像'}
              </span>
            </Button>
          </div>
        )}

        {/* 若处于高德模式：卫星切换与 3D 倾斜 */}
        {mapEngine === 'amap' && (
          <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!aMapInstanceRef.current || !aMapRef.current) return;
                const map = aMapInstanceRef.current;
                const AMap = aMapRef.current;
                if (!isAmapSatellite) {
                  if (!aMapSatelliteLayerRef.current) aMapSatelliteLayerRef.current = new AMap.TileLayer.Satellite();
                  map.add(aMapSatelliteLayerRef.current);
                } else {
                  if (aMapSatelliteLayerRef.current) map.remove(aMapSatelliteLayerRef.current);
                }
                setIsAmapSatellite(!isAmapSatellite);
              }}
              className="h-7 px-2 text-[11px] text-slate-300 hover:bg-white/10 gap-1"
            >
              <Satellite className="size-3 text-cyan-300" />
              <span>{isAmapSatellite ? '深蓝矢量' : '高德卫星'}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (aMapInstanceRef.current) {
                  aMapInstanceRef.current.setPitch(isAmap3D ? 0 : 35);
                  setIsAmap3D(!isAmap3D);
                }
              }}
              className="h-7 px-2 text-[11px] text-slate-300 hover:bg-white/10 gap-1"
            >
              <Box className="size-3 text-amber-300" />
              <span>{isAmap3D ? '2D 俯视' : '3D 倾角'}</span>
            </Button>
          </div>
        )}

        {/* 缩放、复位与设置按键组 */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={handleZoomIn}
            title="放大视角"
            className="text-slate-200 hover:bg-white/15 hover:text-white"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={handleZoomOut}
            title="缩小视角"
            className="text-slate-200 hover:bg-white/15 hover:text-white"
          >
            <Minus className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={handleReset}
            title="复位至场站中心"
            className="text-slate-200 hover:bg-white/15 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setIsKeyDialogOpen(true)}
            title="配置专属高德 Key"
            className="text-slate-300 hover:bg-white/15 hover:text-amber-300"
          >
            <KeyRound className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 底部图例 */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-1.5 shadow-xl backdrop-blur z-20">
        {legend ?? (
          <>
            <span className="text-[10px] text-slate-400 font-medium">图例:</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] text-slate-300">正常在线</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-[10px] text-slate-300">调光运行</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-[10px] text-slate-300">异常告警</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
              <span className="text-[10px] text-slate-300">设备离线</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-dashed border-slate-400" />
              <span className="text-[10px] text-slate-400">待部署点</span>
            </div>
          </>
        )}
      </div>

      {/* Key 配置弹窗 */}
      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="max-w-md border-white/10 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-white">
              <KeyRound className="size-4 text-brand-400" />
              高德地图 API Key 配置
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              若想体验高德原生 3D WebGL 引擎，请在此填入你在高德开放平台申请的专属 Web 端 Key 与安全密钥。默认模式推荐使用免 Key 暗夜真实底图，开箱即用。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Web 端开发者 Key</label>
              <Input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="例如你申请的 32 位 Web 端 Key"
                className="bg-slate-950 font-mono text-xs border-white/15"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">安全密钥 (securityJsCode)</label>
              <Input
                value={customSecurity}
                onChange={(e) => setCustomSecurity(e.target.value)}
                placeholder="例如你的安全密钥"
                className="bg-slate-950 font-mono text-xs border-white/15"
              />
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-[11px] text-emerald-300 leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> 申请贴士：
              </p>
              <p>1. 服务平台务必选【Web 端 (JS API)】；</p>
              <p>2. 域名白名单请【直接留空】或填入当前域名；</p>
              <p>3. 填入后将永久保存在本地浏览器中。</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomKey('');
                setCustomSecurity('');
                localStorage.removeItem('TOPSTAR_AMAP_KEY');
                localStorage.removeItem('TOPSTAR_AMAP_SECURITY');
                setMapEngine('leaflet');
                setIsKeyDialogOpen(false);
                toast.info('已清除 Key，并切回免 Key 模式');
              }}
              className="text-xs text-slate-400"
            >
              清除 Key 并用免Key模式
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsKeyDialogOpen(false)} className="text-xs">
                取消
              </Button>
              <Button size="sm" onClick={handleSaveKey} className="gap-1.5 text-xs bg-brand-500 hover:bg-brand-600 text-slate-950 font-medium">
                <Check className="size-3.5" /> 保存并应用
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
