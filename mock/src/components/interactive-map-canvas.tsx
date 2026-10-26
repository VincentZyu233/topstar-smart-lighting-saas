import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  ShieldCheck,
  Zap,
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

// 内置用户专属高德真实 Key 与安全密钥
const DEFAULT_AMAP_KEY = 'e387d8126782615476d79a45173cf25a';
const DEFAULT_AMAP_SECURITY = '57cc931511ac1ab1ecba3fcd9a4aca92';

export function InteractiveMapCanvas({
  points,
  selectedPointId,
  onPointClick,
  onCanvasClick,
  renderPointContent,
  stationName = '高崎空港互通示范站',
  roadName = '枋钟路立交与迎宾高架',
  centerLnglat = [118.142341, 24.529872],
  zoom = 16.5,
  legend,
  enableAddMode = false,
  className,
}: InteractiveMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  const aMapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const satelliteLayerRef = useRef<any>(null);

  // 控制状态：默认启用深蓝科技矢量，以及 3D 倾角
  const [isMapReady, setIsMapReady] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [isSatellite, setIsSatellite] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // 插旗建点模式
  const [isAddMode, setIsAddMode] = useState(false);
  const isAddModeRef = useRef(false);
  isAddModeRef.current = isAddMode;

  // Key 配置对话框状态
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [customKey, setCustomKey] = useState(
    () => localStorage.getItem('TOPSTAR_AMAP_KEY') || DEFAULT_AMAP_KEY
  );
  const [customSecurity, setCustomSecurity] = useState(
    () => localStorage.getItem('TOPSTAR_AMAP_SECURITY') || DEFAULT_AMAP_SECURITY
  );

  // 核心：路灯点位渲染函数（独立离散点位，严格贴合马路，无回路连线干预）
  const renderMarkersAndPolyline = () => {
    const map = mapInstanceRef.current;
    const AMap = aMapRef.current;
    if (!map || !AMap) return;

    // 清空现有 Marker
    markersRef.current.forEach((m) => {
      try {
        m.setMap(null);
        map.remove(m);
      } catch (e) {}
    });
    markersRef.current = [];

    const validPoints = points.filter((p) => p.lnglat && p.lnglat.length === 2);

    // 绘制沿线灯杆 Marker（独立无连线，清爽呈现在沥青车道与路肩）
    validPoints.forEach((point) => {
      const isSelected = point.id === selectedPointId;
      const markerDiv = document.createElement('div');
      markerDiv.className = 'topstar-amap-marker group relative cursor-pointer select-none flex items-center justify-center';
      markerDiv.style.width = '24px';
      markerDiv.style.height = '24px';
      markerDiv.style.position = 'relative';

      let dotClass = 'bg-brand-400 border border-brand-200 shadow-[0_0_8px_rgba(56,189,248,0.85)]';
      let centerDot = 'bg-white';
      let innerText = '';

      if (point.status === 'deployed') {
        dotClass = 'bg-emerald-400 border border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.9)]';
        centerDot = 'bg-emerald-100';
      } else if (point.status === 'dimmed') {
        dotClass = 'bg-cyan-400 border border-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.9)]';
        centerDot = 'bg-cyan-100';
      } else if (point.status === 'warning') {
        dotClass = 'bg-amber-400 border border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.95)]';
        centerDot = 'bg-amber-100';
      } else if (point.status === 'offline') {
        dotClass = 'bg-rose-500 border border-rose-300 shadow-[0_0_6px_rgba(244,63,94,0.7)]';
        centerDot = 'bg-rose-200';
      } else if (point.status === 'pending') {
        dotClass = 'bg-slate-900/90 border-2 border-dashed border-slate-400 text-slate-300 shadow-sm';
        centerDot = 'hidden';
        innerText = '+';
      }

      // 悬浮标签：默认完全隐藏不显示，只有在鼠标 hover 或选中时才浮现
      const tagClass = isSelected
        ? 'opacity-100 visible z-50 bg-brand-500 text-slate-950 font-bold border border-brand-300 scale-105 shadow-xl'
        : 'opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:z-50 bg-slate-950/95 text-slate-100 border border-white/25 shadow-lg';

      markerDiv.innerHTML = `
        <div class="relative flex items-center justify-center size-6">
          <!-- 微型精巧发光灯标 (彻底移除波纹发光动画，小巧静美) -->
          <div class="relative flex items-center justify-center size-3.5 rounded-full ${dotClass} transition-all duration-200 group-hover:scale-130 ${
            isSelected ? 'ring-3 ring-brand-400 scale-135 shadow-[0_0_16px_rgba(56,189,248,1)]' : ''
          }">
            <span class="size-1 rounded-full ${centerDot}"></span>
            ${innerText ? `<span class="text-[9px] font-bold leading-none text-slate-300">${innerText}</span>` : ''}
          </div>

          <!-- 悬浮标签：默认不显示，鼠标悬浮或点击选中时才浮现 -->
          <div class="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-mono font-medium transition-all duration-150 ${tagClass}">
            <span>${point.label}</span>
            ${point.dimming !== undefined ? `<span class="ml-1 opacity-85 text-[9px] font-bold">${point.dimming}%</span>` : ''}
          </div>
        </div>
      `;

      markerDiv.onclick = (e) => {
        e.stopPropagation();
        onPointClick(point);
      };

      const marker = new AMap.Marker({
        position: new AMap.LngLat(point.lnglat![0], point.lnglat![1]),
        content: markerDiv,
        offset: new AMap.Pixel(-12, -12),
        title: point.label,
        zIndex: isSelected ? 120 : 80,
      });

      markerDiv.onmouseenter = () => marker.setzIndex(150);
      markerDiv.onmouseleave = () => marker.setzIndex(isSelected ? 120 : 80);

      map.add(marker);
      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 0) {
      // 更加放大视角：自适应时最高限制提升到 17.5 级（车道级精细呈现）
      map.setFitView(markersRef.current, false, [50, 50, 50, 50], 17.5);
    }
  };

  // 1. 初始化高德地图 WebGL 2.0 实例
  useEffect(() => {
    let isMounted = true;
    if (!mapDivRef.current) return;

    window._AMapSecurityConfig = {
      securityJsCode: customSecurity,
    };

    setIsMapReady(false);

    AMapLoader.load({
      key: customKey,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar'],
    })
      .then((AMap) => {
        if (!isMounted || !mapDivRef.current) return;
        aMapRef.current = AMap;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const map = new AMap.Map(mapDivRef.current, {
          viewMode: '3D',
          pitch: is3D ? 35 : 0,
          zoom: zoom,
          center: centerLnglat,
          mapStyle: 'amap://styles/darkblue', // 官方科技深蓝主题
          features: ['bg', 'road', 'building', 'point'],
          showBuildingBlock: true,
          showLabel: true,
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);

        map.on('zoomchange', () => {
          setCurrentZoom(Math.round(map.getZoom()));
        });

        // 监听地图点击（插旗建点模式）
        map.on('click', (e: any) => {
          if (!isAddModeRef.current) return;
          const lng = Number(e.lnglat.getLng().toFixed(6));
          const lat = Number(e.lnglat.getLat().toFixed(6));
          onCanvasClick?.({ lnglat: [lng, lat], x: 50, y: 50 });
        });
      })
      .catch((err) => {
        console.error('高德地图加载异常:', err);
        toast.error('高德地图加载异常，请检查 Key 或网络连接');
      });

    return () => {
      isMounted = false;
      setIsMapReady(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [customKey, customSecurity]);

  // 2. 阻断滚轮穿透到外层页面：在地图容器内部滚动时，只缩放地图，外层页面绝对不上下滚动
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheelNative, { passive: true });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // 3. 监听 3D 俯仰视角切换
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setPitch(is3D ? 35 : 0);
    }
  }, [is3D]);

  // 4. 监听卫星图层切换
  useEffect(() => {
    if (!mapInstanceRef.current || !aMapRef.current) return;
    const map = mapInstanceRef.current;
    const AMap = aMapRef.current;

    if (isSatellite) {
      if (!satelliteLayerRef.current) {
        satelliteLayerRef.current = new AMap.TileLayer.Satellite();
      }
      map.add(satelliteLayerRef.current);
    } else {
      if (satelliteLayerRef.current) {
        map.remove(satelliteLayerRef.current);
      }
    }
  }, [isSatellite]);

  // 5. 监听插旗建点模式切换：更新光标
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setDefaultCursor(isAddMode ? 'crosshair' : 'grab');
    }
  }, [isAddMode]);

  // 6. 渲染真实道路上的路灯 Marker 与 回路连线 Polyline，并自适应视野
  useEffect(() => {
    if (isMapReady) {
      renderMarkersAndPolyline();
    }
  }, [points, selectedPointId, isMapReady, onPointClick]);

  // 7. 监听场站中心切换平滑飞入
  useEffect(() => {
    if (mapInstanceRef.current && centerLnglat) {
      if (markersRef.current.length > 0) {
        mapInstanceRef.current.setFitView(markersRef.current, false, [50, 50, 50, 50], 17.5);
      } else {
        mapInstanceRef.current.setZoomAndCenter(zoom || 16.5, centerLnglat, false, 800);
      }
      setCurrentZoom(zoom || 16.5);
    }
  }, [centerLnglat, zoom]);

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

  // 视角重置 (自适应全部点位并放大至车道级)
  const handleReset = () => {
    if (mapInstanceRef.current) {
      renderMarkersAndPolyline();
      if (markersRef.current.length > 0) {
        mapInstanceRef.current.setFitView(markersRef.current, false, [50, 50, 50, 50], 17.5);
      } else if (centerLnglat) {
        mapInstanceRef.current.setZoomAndCenter(16.5, centerLnglat);
      }
      mapInstanceRef.current.setPitch(is3D ? 35 : 0);
      toast.success('已自动居中校准路段全部点位视野');
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // 保存自定义 Key
  const handleSaveKey = () => {
    localStorage.setItem('TOPSTAR_AMAP_KEY', customKey.trim());
    localStorage.setItem('TOPSTAR_AMAP_SECURITY', customSecurity.trim());
    setIsKeyDialogOpen(false);
    toast.success('高德 Key 保存成功，正在重新加载！');
    window.location.reload();
  };

  const handleResetDefaultKey = () => {
    setCustomKey(DEFAULT_AMAP_KEY);
    setCustomSecurity(DEFAULT_AMAP_SECURITY);
    localStorage.removeItem('TOPSTAR_AMAP_KEY');
    localStorage.removeItem('TOPSTAR_AMAP_SECURITY');
    toast.info('已恢复内置官方专属 Key');
    window.location.reload();
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
      {/* 高德 WebGL 地图容器 */}
      <div
        ref={mapDivRef}
        id="topstar-amap-container"
        className="absolute inset-0 size-full z-10"
      />

      {/* 顶部左侧：当前场站真实 GPS 信息条与运行状态 */}
      <div className="map-hud-info absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 backdrop-blur z-20 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">{stationName}</span>
          <span className="text-[10px] text-slate-400 font-mono">[{roadName}]</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300">
          <span>路段点位: {points.length} 处</span>
          <span className="text-slate-600">|</span>
          <span className="px-1.5 py-0.2 rounded font-semibold bg-brand-500/20 text-brand-300">
            {isSatellite ? '高德高清遥感航拍' : '高德 3D 科技矢量'}
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
            插旗建点模式已激活：点击路面护栏或桥面任意位置确定坐标
          </span>
          <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
            按 Esc 退出
          </span>
        </div>
      )}

      {/* 右上角高德地图控制面板 */}
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

        {/* 矢量 / 卫星切换按钮：文案清晰显示当前状态 */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const next = !isSatellite;
            setIsSatellite(next);
            toast.info(`已切换至：${next ? '高德高清遥感卫星图' : '高德科技深蓝矢量图'}`);
          }}
          title={isSatellite ? '当前为卫星影像，点击切回深蓝矢量' : '当前为深蓝矢量，点击切至卫星影像'}
          className={cn(
            'h-7 px-2 text-[11px] font-medium transition-all gap-1.5 justify-start',
            isSatellite ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50' : 'text-slate-200 hover:bg-white/15'
          )}
        >
          {isSatellite ? <Satellite className="size-3 text-cyan-300" /> : <Globe2 className="size-3 text-brand-300" />}
          <span>{isSatellite ? '当前: 🛰️ 遥感卫星' : '当前: 🌐 科技矢量'}</span>
        </Button>

        {/* 3D 倾角 / 2D 平面切换按钮：文案清晰显示当前状态 */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const next = !is3D;
            setIs3D(next);
            toast.info(`视角已切至：${next ? '35° 3D 科技倾角' : '0° 2D 平面俯视'}`);
          }}
          title={is3D ? '当前为 3D 倾角，点击切为 2D 俯视' : '当前为 2D 俯视，点击切为 3D 倾角'}
          className="h-7 px-2 text-[11px] text-slate-200 hover:bg-white/15 gap-1.5 justify-start"
        >
          <Box className={cn('size-3', is3D ? 'text-amber-400' : 'text-slate-400')} />
          <span>{is3D ? '当前: 🧊 3D 倾角' : '当前: 🗺️ 2D 俯视'}</span>
        </Button>

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
            title="自动聚焦全段所有路灯点位 (FitView)"
            className="text-slate-200 hover:bg-white/15 hover:text-emerald-300"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setIsKeyDialogOpen(true)}
            title="查看或配置高德地图 API Key"
            className="text-slate-300 hover:bg-white/15 hover:text-amber-300"
          >
            <KeyRound className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 底部图例与线路指示 */}
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
              高德地图官方 API Key 配置
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              当前系统已内置专属商业 Key 与安全密钥，支持直接加载高德 WebGL 3D 渲染与遥感卫星实景。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Web 端开发者 Key</label>
              <Input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="例如 e387d8126782615476d79a45173cf25a"
                className="bg-slate-950 font-mono text-xs border-white/15"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">安全密钥 (securityJsCode)</label>
              <Input
                value={customSecurity}
                onChange={(e) => setCustomSecurity(e.target.value)}
                placeholder="例如 57cc931511ac1ab1ecba3fcd9a4aca92"
                className="bg-slate-950 font-mono text-xs border-white/15"
              />
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-[11px] text-emerald-300 leading-relaxed">
              <p className="font-semibold flex items-center gap-1 mb-0.5">
                <ShieldCheck className="size-3.5" /> 专属密钥状态：已激活内置
              </p>
              <p>应用名称：路灯 | 来源白名单：已适配全域无阻断调用。</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetDefaultKey}
              className="text-xs text-slate-400 hover:text-white"
            >
              恢复内置专属 Key
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
