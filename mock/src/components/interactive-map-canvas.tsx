import { useRef, useState, type ReactNode } from 'react';
import { Compass, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MapPoint {
  id: string;
  label: string;
  x: number; // 0 ~ 100 百分比
  y: number; // 0 ~ 100 百分比
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
  onCanvasClick?: (coords: { x: number; y: number }) => void;
  renderPointContent?: (point: MapPoint, isSelected: boolean) => ReactNode;
  stationName?: string;
  roadName?: string;
  legend?: ReactNode;
  className?: string;
}

export function InteractiveMapCanvas({
  points,
  selectedPointId,
  onPointClick,
  onCanvasClick,
  renderPointContent,
  stationName = '示范路段',
  roadName = '主干道双向六车道',
  legend,
  className,
}: InteractiveMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 变换状态：缩放比例与平移坐标
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentTranslateRef = useRef({ x: 0, y: 0 });

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((prev) => Math.min(3.0, Math.max(0.6, Number((prev * zoomFactor).toFixed(2)))));
  };

  // 鼠标拖拽平移
  const handleMouseDown = (e: React.MouseEvent) => {
    // 仅响应鼠标主键（左键）
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    currentTranslateRef.current = { ...translate };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setTranslate({
      x: currentTranslateRef.current.x + dx,
      y: currentTranslateRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 复位居中
  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3.0, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.6, Number((prev - 0.25).toFixed(2))));
  };

  // 点击画布空白处
  const handleContainerClick = (e: React.MouseEvent) => {
    if (!onCanvasClick || !containerRef.current) return;
    // 如果是拖拽操作结束引起的点击，则忽略
    const target = e.target as HTMLElement;
    if (target.closest('.map-node-point') || target.closest('.map-control-btn')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left - translate.x;
    const rawY = e.clientY - rect.top - translate.y;

    // 转换为相对于以中心缩放前的 0~100 百分比
    const width = rect.width * scale;
    const height = rect.height * scale;
    const percentX = Math.round((rawX / width) * 100);
    const percentY = Math.round((rawY / height) * 100);

    if (percentX >= 5 && percentX <= 95 && percentY >= 5 && percentY <= 95) {
      onCanvasClick({ x: percentX, y: percentY });
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleContainerClick}
      className={cn(
        'relative select-none overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-inner',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
    >
      {/* 科技背景微网格 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      {/* 可拖拽缩放的内容图层 */}
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '50% 50%',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        className="relative size-full min-h-[500px]"
      >
        {/* SVG 路网底图 */}
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <defs>
            <linearGradient id="mainRoadGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
              <stop offset="35%" stopColor="#2563eb" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="bridgeRoad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f2b5c" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0f2b5c" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* 道路干线底层阴影 */}
          <path
            d="M 40 220 Q 300 320 560 260 T 960 300"
            fill="none"
            stroke="#0a192f"
            strokeWidth="56"
            strokeLinecap="round"
          />

          {/* 道路主路面 */}
          <path
            d="M 40 220 Q 300 320 560 260 T 960 300"
            fill="none"
            stroke="url(#mainRoadGlow)"
            strokeWidth="36"
            strokeLinecap="round"
          />

          {/* 道路中间黄色虚线 */}
          <path
            d="M 40 220 Q 300 320 560 260 T 960 300"
            fill="none"
            stroke="#facc15"
            strokeWidth="2.5"
            strokeDasharray="14 14"
            className="opacity-75"
          />

          {/* 立交互通与匝道 */}
          <path
            d="M 380 290 Q 420 440 520 490"
            fill="none"
            stroke="url(#bridgeRoad)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 640 260 Q 720 120 820 90"
            fill="none"
            stroke="url(#bridgeRoad)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 绿化带与水体边界示意虚线 */}
          <path
            d="M 20 150 Q 400 120 980 180"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            className="opacity-40"
          />
        </svg>

        {/* 动态点位渲染 */}
        {points.map((point) => {
          const isSelected = selectedPointId === point.id;
          return (
            <div
              key={point.id}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onPointClick(point);
              }}
              className="map-node-point group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            >
              {renderPointContent ? (
                renderPointContent(point, isSelected)
              ) : (
                <div className="relative flex items-center justify-center">
                  {point.status === 'pending' && (
                    <span className="absolute size-9 rounded-full bg-amber-400/30 animate-ping" />
                  )}
                  {point.status === 'warning' && (
                    <span className="absolute size-9 rounded-full bg-rose-500/40 animate-ping" />
                  )}
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full border-2 transition-transform duration-200 group-hover:scale-125 shadow-lg',
                      isSelected && 'ring-4 ring-brand-400 scale-125',
                      point.status === 'deployed' && 'border-brand-400 bg-brand-600 text-white shadow-brand-500/50',
                      point.status === 'pending' && 'border-amber-300 bg-amber-500 text-slate-950 shadow-amber-500/50 animate-pulse',
                      point.status === 'warning' && 'border-rose-400 bg-rose-600 text-white shadow-rose-500/50',
                      point.status === 'dimmed' && 'border-sky-300 bg-sky-600 text-white',
                      point.status === 'offline' && 'border-slate-500 bg-slate-700 text-slate-300'
                    )}
                  >
                    <span className="font-mono text-[9px] font-bold">{point.id.slice(-2)}</span>
                  </div>

                  <div className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-900/90 px-2 py-0.5 text-[9px] text-slate-200 shadow-md backdrop-blur">
                    {point.label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 左上角路段标识 HUD */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">{stationName}</span>
          <span className="text-[10px] text-slate-400 font-mono">[{roadName}]</span>
        </div>
        <p className="mt-0.5 text-[9px] text-slate-400">
          滚轮缩放画布 · 按住鼠标左键可拖拽平移 · 点击点位交互
        </p>
      </div>

      {/* 右上角地图控制器 */}
      <div className="map-control-btn absolute right-3 top-3 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-slate-900/85 p-1.5 shadow-xl backdrop-blur z-20">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={handleZoomIn}
          title="放大 (或向上滚轮)"
          className="text-slate-200 hover:bg-white/15 hover:text-white"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={handleZoomOut}
          title="缩小 (或向下滚轮)"
          className="text-slate-200 hover:bg-white/15 hover:text-white"
        >
          <Minus className="size-3.5" />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={handleReset}
          title="重置视角 (100% 居中)"
          className="text-slate-200 hover:bg-white/15 hover:text-white"
        >
          <RotateCcw className="size-3.5" />
        </Button>
        <div className="pt-1 border-t border-white/10 text-center font-mono text-[9px] text-brand-300">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* 右下角图例组件插槽 */}
      {legend && (
        <div className="pointer-events-auto absolute bottom-3 right-3 z-20">
          {legend}
        </div>
      )}
    </div>
  );
}
