import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Cpu,
  Layers,
  Lightbulb,
  Radio,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Thermometer,
  Wifi,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { LineTrendChart } from '@/components/charts';
import { InteractiveMapCanvas, type MapPoint } from '@/components/interactive-map-canvas';
import { MetricBar, PageHeader, SectionCard, StatCard, StatusBadge } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projects, stations } from '@/data/mock-data';
import { cn } from '@/lib/utils';

// 预置厦门示范路段监控点位（高崎空港、翔安大桥、翔安新机场）
const STATION_MONITOR_POINTS: Record<string, MapPoint[]> = {
  '高崎空港互通示范站': [
    { id: 'DEV-0101', label: 'DEV-0101 (高崎迎宾道01#)', lnglat: [118.1315, 24.5392], status: 'deployed', deviceId: 'DEV-0101', deviceName: '智能路灯单灯控制器', deviceType: '单灯控制器', pole: 'POLE-01', circuit: 'A 回路-迎宾段', power: 0.18, voltage: 220.4, temperature: 34.2, dimming: 85 },
    { id: 'DEV-0102', label: 'DEV-0102 (枋钟路立交02#)', lnglat: [118.1342, 24.5388], status: 'deployed', deviceId: 'DEV-0102', deviceName: '智能路灯单灯控制器', deviceType: '单灯控制器', pole: 'POLE-02', circuit: 'A 回路-迎宾段', power: 0.18, voltage: 221.1, temperature: 35.0, dimming: 85 },
    { id: 'DEV-0103', label: 'DEV-0103 (T4航站匝道03#)', lnglat: [118.1378, 24.5381], status: 'dimmed', deviceId: 'DEV-0103', deviceName: '边缘智能照明网关', deviceType: '智能网关', pole: 'POLE-03', circuit: 'B 回路-立交段', power: 0.12, voltage: 219.8, temperature: 38.6, dimming: 60 },
    { id: 'DEV-0104', label: 'DEV-0104 (枋钟中段04#)', lnglat: [118.1412, 24.5375], status: 'warning', deviceId: 'DEV-0104', deviceName: '多回路驱动电源', deviceType: '驱动电源', pole: 'POLE-04', circuit: 'B 回路-立交段', power: 0.35, voltage: 228.6, temperature: 48.9, dimming: 100 },
    { id: 'DEV-0105', label: 'DEV-0105 (环岛干线交汇05#)', lnglat: [118.1450, 24.5370], status: 'deployed', deviceId: 'DEV-0105', deviceName: '全光谱LED智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'C 回路-外围段', power: 0.15, voltage: 220.0, temperature: 33.5, dimming: 70 },
    { id: 'DEV-0106', label: 'DEV-0106 (枋钟下穿06#)', lnglat: [118.1495, 24.5365], status: 'offline', deviceId: 'DEV-0106', deviceName: '智能路灯单灯控制器', deviceType: '单灯控制器', pole: 'POLE-06', circuit: 'C 回路-外围段', power: 0.0, voltage: 0.0, temperature: 22.0, dimming: 0 },
  ],
  '翔安大桥跨海示范段': [
    { id: 'DEV-0111', label: 'DEV-0111 (西桥头01#)', lnglat: [118.1620, 24.5420], status: 'deployed', deviceId: 'DEV-0111', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-11', circuit: 'A 回路-跨海段', power: 0.22, voltage: 222.0, temperature: 33.1, dimming: 95 },
    { id: 'DEV-0112', label: 'DEV-0112 (刘五店航道桥02#)', lnglat: [118.1685, 24.5442], status: 'deployed', deviceId: 'DEV-0112', deviceName: 'LED 高杆灯', deviceType: 'LED 高杆灯', pole: 'POLE-12', circuit: 'A 回路-跨海段', power: 0.20, voltage: 221.4, temperature: 34.5, dimming: 90 },
    { id: 'DEV-0113', label: 'DEV-0113 (大桥中段03#)', lnglat: [118.1735, 24.5458], status: 'dimmed', deviceId: 'DEV-0113', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B 回路-主航道', power: 0.14, voltage: 220.8, temperature: 35.0, dimming: 65 },
    { id: 'DEV-0114', label: 'DEV-0114 (东引桥04#)', lnglat: [118.1788, 24.5472], status: 'deployed', deviceId: 'DEV-0114', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-14', circuit: 'B 回路-主航道', power: 0.18, voltage: 221.2, temperature: 33.8, dimming: 85 },
  ],
  '翔安新机场综合枢纽站': [
    { id: 'DEV-0601', label: 'DEV-0601 (新机场进场01#)', lnglat: [118.3510, 24.5460], status: 'deployed', deviceId: 'DEV-0601', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-21', circuit: 'A 回路-主进场', power: 0.19, voltage: 222.4, temperature: 34.9, dimming: 88 },
    { id: 'DEV-0602', label: 'DEV-0602 (GTC交通中心02#)', lnglat: [118.3552, 24.5445], status: 'deployed', deviceId: 'DEV-0602', deviceName: 'LED 高杆灯', deviceType: 'LED 高杆灯', pole: 'POLE-22', circuit: 'A 回路-主进场', power: 0.17, voltage: 221.7, temperature: 36.1, dimming: 82 },
    { id: 'DEV-0603', label: 'DEV-0603 (航站楼主落客03#)', lnglat: [118.3590, 24.5428], status: 'deployed', deviceId: 'DEV-0603', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-23', circuit: 'B 回路-航站区', power: 0.21, voltage: 223.1, temperature: 33.8, dimming: 90 },
    { id: 'DEV-0604', label: 'DEV-0604 (空港保税环路04#)', lnglat: [118.3630, 24.5412], status: 'dimmed', deviceId: 'DEV-0604', deviceName: '景观氛围灯杆', deviceType: '景观氛围灯杆', pole: 'POLE-24', circuit: 'B 回路-航站区', power: 0.11, voltage: 220.5, temperature: 32.0, dimming: 50 },
  ],
};

const MONITOR_POINTS: MapPoint[] = STATION_MONITOR_POINTS['高崎空港互通示范站'];

export function RealtimeMonitorPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.name ?? '厦门智慧照明示范项目');
  const projectStations = useMemo(() => stations.filter((st) => st.project === selectedProject), [selectedProject]);
  const [selectedStation, setSelectedStation] = useState(projectStations[0]?.name ?? '高崎空港互通示范站');

  const currentStation = useMemo(() => {
    return stations.find((s) => s.name === selectedStation) || projectStations[0] || stations[0];
  }, [selectedStation, projectStations]);

  const [points, setPoints] = useState<MapPoint[]>(MONITOR_POINTS);
  const [selectedPointId, setSelectedPointId] = useState<string>(MONITOR_POINTS[0].id);

  // 选中的灯杆设备
  const activePoint = useMemo(() => {
    return points.find((p) => p.id === selectedPointId) ?? points[0];
  }, [points, selectedPointId]);

  // 当前调光滑块状态
  const [dimmingValue, setDimmingValue] = useState<number>(activePoint.dimming ?? 85);

  const handleStationChange = (stName: string) => {
    setSelectedStation(stName);
    const matched = STATION_MONITOR_POINTS[stName];
    if (matched && matched.length > 0) {
      setPoints(matched);
      setSelectedPointId(matched[0].id);
      setDimmingValue(matched[0].dimming ?? 85);
    } else {
      const st = stations.find((s) => s.name === stName);
      const baseLng = st?.lnglat?.[0] ?? 118.1355;
      const baseLat = st?.lnglat?.[1] ?? 24.5386;
      const fallbackList: MapPoint[] = [
        { id: `DEV-${stName}-01`, label: `${stName} 01#`, lnglat: [baseLng, baseLat], status: 'deployed', dimming: 85, power: 0.18, voltage: 220.0, temperature: 34.0 },
      ];
      setPoints(fallbackList);
      setSelectedPointId(fallbackList[0].id);
      setDimmingValue(85);
    }
  };

  const handleProjectChange = (projName: string) => {
    setSelectedProject(projName);
    const related = stations.filter((st) => st.project === projName);
    const firstStation = related[0]?.name ?? '';
    handleStationChange(firstStation);
  };

  // 监听选中节点切换
  const handleSelectPoint = (point: MapPoint) => {
    setSelectedPointId(point.id);
    setDimmingValue(point.dimming ?? 85);
  };

  // 下发调光指令
  const handleApplyDimming = () => {
    setPoints((prev) =>
      prev.map((p) => (p.id === activePoint.id ? { ...p, dimming: dimmingValue, status: dimmingValue > 0 ? (dimmingValue < 70 ? 'dimmed' : 'deployed') : 'offline' } : p))
    );
    toast.success(`调光指令已下发！设备 [${activePoint.id}] 目标亮度调整为 ${dimmingValue}%`);
  };

  // 刷新遥测
  const handleRefresh = () => {
    toast.success('全网遥测数据已成功同步！');
  };

  // 生成折线图模拟遥测波形
  const telemetryData = useMemo(() => {
    const basePower = (activePoint.power ?? 0.18) * 100;
    return [
      { label: '10:00', value: Math.round(basePower * 0.95) },
      { label: '10:10', value: Math.round(basePower * 0.98) },
      { label: '10:20', value: Math.round(basePower * 1.02) },
      { label: '10:30', value: Math.round(basePower * 1.0) },
      { label: '10:40', value: Math.round(basePower * 0.96) },
      { label: '10:50', value: Math.round(basePower * 1.04) },
      { label: '11:00', value: Math.round(basePower * 1.01) },
    ];
  }, [activePoint]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="监控与控制 / 实时监控"
        title="设备实时监控与电子地图"
        description="基于路网电子地图全景呈现路灯运行工况，支持滚轮缩放、拖拽浏览，点击任意灯杆点位即时调取遥测曲线与调光控制。"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 gap-1.5 text-xs">
              <RefreshCw className="size-3.5" />刷新遥测
            </Button>
          </div>
        }
      />

      {/* 顶部指标卡片 */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="全网在线设备" value="5,411" unit="台" trend={0.12} trendLabel="近 5 分钟" icon={Wifi} tone="green" />
        <StatCard label="实时负载总功率" value="184.6" unit="kW" trendLabel="负载率 57.6%" icon={Zap} tone="blue" />
        <StatCard label="平均运行温度" value="34.6" unit="°C" trend={1.2} trendLabel="较昨日同时段" icon={Thermometer} tone="amber" />
        <StatCard label="告警异常点位" value="1" unit="处" trendLabel="DEV-0104 过温 48.9°C" icon={AlertTriangle} tone="cyan" />
      </div>

      {/* 核心分栏：左侧交互地图 + 右侧单灯遥测与控制 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_390px]">
        {/* 左侧：可缩放拖拽的监控电子地图 */}
        <section className="app-surface rounded-2xl p-4 border border-border flex flex-col min-h-[580px]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-foreground">
                {selectedStation} · 实时运行地图
              </h2>
              <div className="flex items-center gap-1.5 ml-2">
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-7 text-xs w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.name} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStation} onValueChange={handleStationChange}>
                  <SelectTrigger className="h-7 text-xs w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStations.map((st) => (
                      <SelectItem key={st.id} value={st.name} className="text-xs">{st.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              提示：高德 3D 真实地图联动 · 滚轮缩放 · 鼠标拖拽平移 · 点击地图路灯点位即时调取遥测
            </p>
          </div>

          <div className="flex-1 min-h-[480px]">
            <InteractiveMapCanvas
              points={points}
              selectedPointId={selectedPointId}
              stationName={selectedStation}
              roadName={currentStation?.road || '主干道路段'}
              centerLnglat={currentStation?.lnglat || [118.1355, 24.5386]}
              zoom={15}
              onPointClick={handleSelectPoint}
              className="h-full min-h-[480px]"
              renderPointContent={(point, isSelected) => {
                const isWarning = point.status === 'warning';
                const isOffline = point.status === 'offline';
                return (
                  <div className="relative flex items-center justify-center">
                    {/* 告警红色呼吸光环 */}
                    {isWarning && (
                      <span className="absolute size-10 rounded-full bg-rose-500/40 animate-ping" />
                    )}
                    {point.status === 'deployed' && (
                      <span className="absolute size-7 rounded-full bg-emerald-400/20 animate-pulse" />
                    )}

                    <div
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full border-2 transition-all duration-200 group-hover:scale-125 shadow-lg',
                        isSelected ? 'scale-125 ring-4 ring-brand-400' : '',
                        isWarning
                          ? 'border-rose-400 bg-rose-600 text-white shadow-rose-500/60'
                          : isOffline
                          ? 'border-slate-500 bg-slate-700 text-slate-300'
                          : point.status === 'dimmed'
                          ? 'border-amber-300 bg-amber-500 text-slate-950'
                          : 'border-emerald-300 bg-emerald-600 text-white shadow-emerald-500/40'
                      )}
                    >
                      <Lightbulb className="size-4" />
                    </div>

                    {/* 浮动节点文字 */}
                    <div
                      className={cn(
                        'absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-0.5 text-[9px] font-mono shadow-md backdrop-blur',
                        isSelected
                          ? 'border-brand-400 bg-brand-950 text-brand-200 font-bold'
                          : 'border-white/10 bg-slate-900/90 text-slate-200'
                      )}
                    >
                      <span>{point.id}</span>
                      <span className="ml-1 opacity-70">{point.dimming}%</span>
                    </div>
                  </div>
                );
              }}
              legend={
                <div className="rounded-xl border border-white/10 bg-slate-900/85 p-2.5 text-[10px] text-slate-300 backdrop-blur space-y-1 shadow-xl">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1">
                    <Layers className="size-3 text-brand-400" />工况图例
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span>正常照明运行 (100%~70%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400" />
                    <span>策略调光节能 (&lt;70%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>故障告警节点 (超温/通信)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-slate-500" />
                    <span>白天熄灯 / 设备离线</span>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* 右侧：当前选中灯杆的遥测与快捷调光控制 */}
        <section className="app-surface rounded-2xl p-4 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* 节点头部与状态 */}
            <div className="border-b border-border/80 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-foreground">{activePoint.id}</span>
                <StatusBadge
                  status={
                    activePoint.status === 'warning'
                      ? '主要告警'
                      : activePoint.status === 'offline'
                      ? '离线'
                      : '正常运行'
                  }
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{activePoint.label}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <Badge variant="outline" className="text-[9px] bg-muted">{activePoint.deviceType}</Badge>
                <span>回路: {activePoint.circuit}</span>
              </div>
            </div>

            {/* 四项核心遥测指标 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>实时功率</span>
                  <Zap className="size-3 text-brand-600" />
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-foreground">{activePoint.power} kW</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>工作电压</span>
                  <Activity className="size-3 text-sky-600" />
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-foreground">{activePoint.voltage} V</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>工作温度</span>
                  <Thermometer className="size-3 text-amber-500" />
                </div>
                <p
                  className={cn(
                    'mt-1 font-mono text-base font-semibold',
                    (activePoint.temperature ?? 0) > 45 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                  )}
                >
                  {activePoint.temperature} °C
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>当前亮度</span>
                  <BatteryCharging className="size-3 text-emerald-600" />
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-foreground">{activePoint.dimming}%</p>
              </div>
            </div>

            {/* 负载率进度条 */}
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>负载率</span>
                <span className="font-mono">{activePoint.dimming}%</span>
              </div>
              <MetricBar value={activePoint.dimming ?? 0} />
            </div>

            {/* 实时功率波动趋势图 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-foreground">实时功率走势 (近1小时)</span>
                <span className="font-mono text-[9px] text-muted-foreground">瓦特 (W)</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/50 p-2">
                <LineTrendChart points={telemetryData} height={120} />
              </div>
            </div>
          </div>

          {/* 底部快捷调光控制 */}
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sliders className="size-3.5 text-brand-600" />
                单灯亮度调光
              </span>
              <span className="font-mono text-xs font-bold text-brand-600">{dimmingValue}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={dimmingValue}
              onChange={(e) => setDimmingValue(Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex gap-1.5">
              {[0, 30, 60, 85, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDimmingValue(preset)}
                  className={cn(
                    'flex-1 rounded-md py-1 text-[10px] font-mono border transition-colors',
                    dimmingValue === preset
                      ? 'border-brand-500 bg-brand-600 text-white font-medium'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  {preset}%
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleApplyDimming}
              className="w-full bg-brand-600 text-white hover:bg-brand-700 text-xs shadow-sm h-8"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              立即下发调光策略
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
