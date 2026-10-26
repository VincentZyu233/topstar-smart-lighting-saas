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

// 默认内置高德演示 Key
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
  const mapDivRef = useRef<HTMLDivElement>(null);

  // 地图引擎状态：'loading' | 'amap' (高德真实 WebGL) | 'fallback' (高精暗夜矢量仿真)
  const [mapEngine, setMapEngine] = useState<'loading' | 'amap' | 'fallback'>('loading');
  const aMapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const satelliteLayerRef = useRef<any>(null);

  // 控制状态
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

  // Fallback 仿真模式下的拖拽与缩放状态
  const [fallbackScale, setFallbackScale] = useState(1);
  const [fallbackTranslate, setFallbackTranslate] = useState({ x: 0, y: 0 });
  const [isDraggingFallback, setIsDraggingFallback] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentTranslateRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);

  // 1. 初始化高德地图 WebGL 2.0 实例
  useEffect(() => {
    let isMounted = true;
    if (!mapDivRef.current) return;

    // 配置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: customSecurity,
    };

    setMapEngine('loading');

    AMapLoader.load({
      key: customKey,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar'],
    })
      .then((AMap) => {
        if (!isMounted || !mapDivRef.current) return;
        aMapRef.current = AMap;

        // 销毁旧实例
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const map = new AMap.Map(mapDivRef.current, {
          viewMode: '3D',
          pitch: is3D ? 35 : 0,
          zoom: currentZoom,
          center: centerLnglat,
          mapStyle: 'amap://styles/darkblue', // 科技暗蓝主题
          features: ['bg', 'road', 'building', 'point'],
          showBuildingBlock: true,
          showLabel: true,
        });

        mapInstanceRef.current = map;
        setMapEngine('amap');

        // 监听缩放级别变化
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
        console.warn('高德在线地图加载受限，自动启用仿真底图模式:', err);
        if (isMounted) {
          setMapEngine('fallback');
        }
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [customKey, customSecurity]);

  // 2. 阻断滚轮穿透到外层页面：当鼠标在地图容器内时，仅缩放地图，页面完全不滚动
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      // 停止向上冒泡并阻止默认滚动行为
      e.stopPropagation();

      if (mapEngine === 'fallback') {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
        setFallbackScale((prev) => Math.min(3.0, Math.max(0.6, Number((prev * zoomFactor).toFixed(2)))));
      }
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, [mapEngine]);

  // 3. 监听中心坐标平滑飞入（换场站联动）
  useEffect(() => {
    if (mapInstanceRef.current && centerLnglat) {
      mapInstanceRef.current.setZoomAndCenter(zoom, centerLnglat, false, 800);
      setCurrentZoom(zoom);
    }
  }, [centerLnglat, zoom]);

  // 4. 监听 3D 俯仰视角切换
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setPitch(is3D ? 35 : 0);
    }
  }, [is3D]);

  // 5. 监听卫星图层切换
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

  // 6. 监听插旗建点模式切换：更新光标
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setDefaultCursor(isAddMode ? 'crosshair' : 'grab');
    }
  }, [isAddMode]);

  // 7. 渲染真实高德 Marker 点位
  useEffect(() => {
    if (!mapInstanceRef.current || !aMapRef.current || mapEngine !== 'amap') return;
    const map = mapInstanceRef.current;
    const AMap = aMapRef.current;

    // 清除既有标记
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    points.forEach((point) => {
      if (!point.lnglat) return;

      const isSelected = point.id === selectedPointId;
      const markerDiv = document.createElement('div');
      markerDiv.className = 'topstar-amap-marker group relative cursor-pointer select-none';

      let bgClass = 'bg-brand-500/20 text-brand-300 border-brand-400';
      let ringClass = 'bg-brand-400/40';
      let icon = '📍';

      if (point.status === 'deployed') {
        bgClass = 'bg-emerald-500/25 text-emerald-300 border-emerald-400';
        ringClass = 'bg-emerald-400/50';
        icon = '💡';
      } else if (point.status === 'dimmed') {
        bgClass = 'bg-cyan-500/25 text-cyan-300 border-cyan-400';
        ringClass = 'bg-cyan-400/50';
        icon = '🔅';
      } else if (point.status === 'warning') {
        bgClass = 'bg-amber-500/25 text-amber-300 border-amber-400';
        ringClass = 'bg-amber-400/50';
        icon = '⚠️';
      } else if (point.status === 'offline') {
        bgClass = 'bg-rose-500/25 text-rose-300 border-rose-400';
        ringClass = 'bg-rose-400/50';
        icon = '🔌';
      } else if (point.status === 'pending') {
        bgClass = 'bg-slate-700/60 text-slate-300 border-slate-500 border-dashed';
        ringClass = 'bg-slate-400/20';
        icon = '➕';
      }

      markerDiv.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-1 rounded-full ${ringClass} ${isSelected ? 'animate-ping' : ''}"></div>
          <div class="relative flex items-center justify-center size-7 rounded-full border ${bgClass} shadow-xl backdrop-blur transition-transform duration-200 group-hover:scale-125 ${
        isSelected ? 'ring-2 ring-brand-400 scale-125' : ''
      }">
            <span class="text-xs leading-none">${icon}</span>
          </div>
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-mono font-medium shadow pointer-events-none transition-all ${
            isSelected
              ? 'bg-brand-500 text-slate-950 font-bold scale-105'
              : 'bg-slate-900/90 text-slate-200 border border-white/20'
          }">
            ${point.label}
          </div>
        </div>
      `;

      markerDiv.onclick = (e) => {
        e.stopPropagation();
        onPointClick(point);
      };

      const marker = new AMap.Marker({
        position: new AMap.LngLat(point.lnglat[0], point.lnglat[1]),
        content: markerDiv,
        offset: new AMap.Pixel(-14, -14),
        title: point.label,
      });

      marker.setMap(map);
      markersRef.current.push(marker);
    });
  }, [points, selectedPointId, mapEngine, onPointClick]);

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
    if (mapInstanceRef.current && centerLnglat) {
      mapInstanceRef.current.setZoomAndCenter(zoom, centerLnglat, false, 500);
      mapInstanceRef.current.setPitch(is3D ? 35 : 0);
      setCurrentZoom(zoom);
    } else {
      setFallbackScale(1);
      setFallbackTranslate({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    } else {
      setFallbackScale((s) => Math.min(3, s + 0.25));
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    } else {
      setFallbackScale((s) => Math.max(0.6, s - 0.25));
    }
  };

  // 保存自定义 Key
  const handleSaveKey = () => {
    localStorage.setItem('TOPSTAR_AMAP_KEY', customKey.trim());
    localStorage.setItem('TOPSTAR_AMAP_SECURITY', customSecurity.trim());
    setIsKeyDialogOpen(false);
    toast.success('高德地图 Key 与安全密钥已保存，正在重新加载地图底图！');
    // 触发重新挂载
    window.location.reload();
  };

  const handleResetDefaultKey = () => {
    setCustomKey(DEFAULT_AMAP_KEY);
    setCustomSecurity(DEFAULT_AMAP_SECURITY);
    localStorage.removeItem('TOPSTAR_AMAP_KEY');
    localStorage.removeItem('TOPSTAR_AMAP_SECURITY');
    toast.info('已恢复默认预置演示 Key');
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
      {/* 真实高德地图容器 */}
      <div
        ref={mapDivRef}
        id="topstar-amap-container"
        className={cn(
          'absolute inset-0 size-full transition-opacity duration-500',
          mapEngine === 'amap' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* 优雅降级/备用仿真矢量底图 (在离线或无可用 Key 时提供 100% 完整的仿真体验) */}
      {mapEngine !== 'amap' && (
        <div
          className="absolute inset-0 size-full overflow-hidden z-10"
          onMouseDown={(e) => {
            if (isAddMode || e.button !== 0) return;
            setIsDraggingFallback(true);
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            currentTranslateRef.current = { ...fallbackTranslate };
            dragDistanceRef.current = 0;
          }}
          onMouseMove={(e) => {
            if (!isDraggingFallback) return;
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
            setFallbackTranslate({
              x: currentTranslateRef.current.x + dx,
              y: currentTranslateRef.current.y + dy,
            });
          }}
          onMouseUp={() => setIsDraggingFallback(false)}
          onClick={(e) => {
            if (!isAddMode || !onCanvasClick) return;
            if (dragDistanceRef.current > 6) return;
            // 仿真模式根据点击计算虚拟经纬度
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const clickX = (e.clientX - rect.left - fallbackTranslate.x) / fallbackScale;
            const clickY = (e.clientY - rect.top - fallbackTranslate.y) / fallbackScale;
            const lng = Number((centerLnglat[0] + (clickX - rect.width / 2) * 0.00015).toFixed(6));
            const lat = Number((centerLnglat[1] - (clickY - rect.height / 2) * 0.00015).toFixed(6));
            onCanvasClick({ lnglat: [lng, lat], x: 50, y: 50 });
          }}
        >
          {/* 仿真底图网格与真实厦门高崎/翔安地标拓扑 */}
          <div
            className="absolute inset-0 size-full transition-transform duration-75"
            style={{
              transform: `translate(${fallbackTranslate.x}px, ${fallbackTranslate.y}px) scale(${fallbackScale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* 网格背景 */}
            <div
              className="absolute -inset-[200%] opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.3) 1px, transparent 0)`,
                backgroundSize: '36px 36px',
              }}
            />

            {/* 仿真跑道与跨海大桥高架路径 */}
            <svg className="absolute inset-0 size-full overflow-visible pointer-events-none" viewBox="0 0 1000 600">
              <defs>
                <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* 厦门湾海域轮廓 */}
              <path d="M 0 350 Q 300 280, 500 400 T 1000 320 L 1000 600 L 0 600 Z" fill="url(#seaGradient)" />

              {/* 高崎国际机场 05/23 号跑道与航站区 */}
              <g opacity="0.6">
                <rect x="120" y="140" width="260" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="12 4" />
                <text x="140" y="130" fill="#94a3b8" fontSize="11" fontFamily="monospace">XMN / 高崎国际机场 RUNWAY 05/23</text>
                <rect x="240" y="180" width="120" height="35" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                <text x="255" y="202" fill="#38bdf8" fontSize="10" fontWeight="bold">T3/T4 航站区</text>
              </g>

              {/* 翔安大桥跨海高架路线 */}
              <path
                d="M 320 220 C 450 250, 600 240, 780 200"
                fill="none"
                stroke="url(#bridgeGradient)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 320 220 C 450 250, 600 240, 780 200"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="8 6"
              />
              <text x="500" y="225" fill="#38bdf8" fontSize="12" fontWeight="bold" letterSpacing="1">
                翔安大桥跨海主线 (第二东通道)
              </text>

              {/* 翔安新机场片区 */}
              <g opacity="0.6">
                <circle cx="820" cy="190" r="45" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="765" y="255" fill="#38bdf8" fontSize="11" fontWeight="bold">翔安新机场航站枢纽 GTC</text>
              </g>
            </svg>

            {/* 仿真点位标记 */}
            {points.map((pt, index) => {
              const isSelected = pt.id === selectedPointId;
              // 模拟分布
              const posX = pt.x ?? 15 + index * 14;
              const posY = pt.y ?? 35 + (index % 2) * 5;

              return (
                <div
                  key={pt.id}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPointClick(pt);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="size-6 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-xs shadow-lg group-hover:scale-125 transition-transform">
                      💡
                    </span>
                    <span className="absolute -bottom-4 whitespace-nowrap text-[9px] font-mono bg-slate-900/90 text-cyan-300 px-1 rounded border border-cyan-500/30">
                      ${pt.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 顶部左侧：当前场站真实 GPS 信息条 */}
      <div className="map-hud-info absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 backdrop-blur z-20 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">{stationName}</span>
          <span className="text-[10px] text-slate-400 font-mono">[{roadName}]</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-300">
          <span>中心坐标: {centerLnglat[0]}, {centerLnglat[1]}</span>
          <span className="text-slate-600">|</span>
          <span className="text-brand-300">
            {mapEngine === 'amap' ? (isSatellite ? '高德高清遥感卫星图' : '高德矢量 3D WebGL') : '高精仿真暗夜走廊'}
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
            插旗建点模式已激活：点击道路任意位置获取 GPS 经纬度建点
          </span>
          <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
            按 Esc 退出
          </span>
        </div>
      )}

      {/* 右上角高德地图综合工具条 */}
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

        {/* 卫星图 / 深蓝矢量切换 */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsSatellite(!isSatellite)}
          title={isSatellite ? '切回科技深蓝矢量地图' : '切换至真实航拍卫星图'}
          className={cn(
            'h-7 px-2 text-[11px] font-medium transition-all gap-1',
            isSatellite ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50' : 'text-slate-300 hover:bg-white/10'
          )}
        >
          {isSatellite ? <Globe2 className="size-3 text-cyan-300" /> : <Satellite className="size-3 text-brand-300" />}
          <span>{isSatellite ? '深蓝矢量' : '卫星影像'}</span>
        </Button>

        {/* 3D 倾斜 / 2D 平面切换 */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIs3D(!is3D)}
          title={is3D ? '切至 2D 平面俯视' : '切至 3D 科技倾角'}
          className="h-7 px-2 text-[11px] text-slate-300 hover:bg-white/10 gap-1"
        >
          <Box className={cn('size-3', is3D ? 'text-amber-400' : 'text-slate-400')} />
          <span>{is3D ? '3D 倾角' : '2D 俯视'}</span>
        </Button>

        {/* 基础控制按键组 */}
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
            title="配置高德地图 API Key"
            className="text-slate-300 hover:bg-white/15 hover:text-amber-300"
          >
            <KeyRound className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 底部图例 */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-1.5 shadow-xl backdrop-blur z-20">
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
              高德地图 Web JS API 2.0 配置
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              系统当前已预置官方演示 Key。若需要切换为你自己在高德开放平台申请的专属 Web 端 Key，可在此填入。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Web 端开发者 Key</label>
              <Input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="例如 2e44d3d78906be7dd626ad9ee0c38466"
                className="bg-slate-950 font-mono text-xs border-white/15"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">安全密钥 (securityJsCode)</label>
              <Input
                value={customSecurity}
                onChange={(e) => setCustomSecurity(e.target.value)}
                placeholder="例如 928230559f2e30f1d3c9ea5a9d821217"
                className="bg-slate-950 font-mono text-xs border-white/15"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 注：高德 JSAPI 2.0 自 2021 年起要求 Key 配合安全密钥成对生效。配置将持久化保存在当前浏览器本地。
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" size="sm" onClick={handleResetDefaultKey} className="text-xs text-slate-400">
              恢复默认演示 Key
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
