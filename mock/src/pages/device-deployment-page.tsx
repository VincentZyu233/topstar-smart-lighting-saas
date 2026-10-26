import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Cpu,
  HardDriveUpload,
  Layers,
  Lightbulb,
  MapPin,
  MapPinned,
  Radio,
  Search,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, StatCard, StatusBadge } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projects, stations } from '@/data/mock-data';
import { cn } from '@/lib/utils';

interface DeploymentPoint {
  id: string; // 点位编号: POLE-01
  label: string;
  stationName: string;
  x: number; // 百分比坐标
  y: number;
  circuit: string;
  status: 'deployed' | 'pending';
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  deployedAt?: string;
  operator?: string;
}

interface PendingDevice {
  id: string;
  name: string;
  model: string;
  type: string;
  spec: string;
}

// 模拟初始点位数据
const INITIAL_POINTS: DeploymentPoint[] = [
  { id: 'POLE-01', label: '环岛南路示范段 #01', stationName: '环岛南路示范段', x: 14, y: 35, circuit: 'A 回路-东段', status: 'deployed', deviceId: 'DEV-0101', deviceName: '单灯控制器-01', deviceType: '单灯控制器', deployedAt: '2026-10-24 08:30', operator: '陈明远' },
  { id: 'POLE-02', label: '环岛南路示范段 #02', stationName: '环岛南路示范段', x: 28, y: 32, circuit: 'A 回路-东段', status: 'deployed', deviceId: 'DEV-0102', deviceName: '单灯控制器-02', deviceType: '单灯控制器', deployedAt: '2026-10-24 08:32', operator: '陈明远' },
  { id: 'POLE-03', label: '环岛南路示范段 #03', stationName: '环岛南路示范段', x: 42, y: 40, circuit: 'B 回路-中段', status: 'deployed', deviceId: 'DEV-0103', deviceName: '边缘智能网关', deviceType: '智能网关', deployedAt: '2026-10-24 08:35', operator: '周启航' },
  { id: 'POLE-04', label: '环岛南路示范段 #04', stationName: '环岛南路示范段', x: 56, y: 48, circuit: 'B 回路-中段', status: 'pending' },
  { id: 'POLE-05', label: '环岛南路示范段 #05', stationName: '环岛南路示范段', x: 70, y: 42, circuit: 'C 回路-西段', status: 'pending' },
  { id: 'POLE-06', label: '环岛南路示范段 #06', stationName: '环岛南路示范段', x: 84, y: 55, circuit: 'C 回路-西段', status: 'pending' },

  { id: 'ST2-POLE-01', label: '演武大桥桥面 #01', stationName: '演武大桥桥面', x: 20, y: 40, circuit: 'C 回路-桥面', status: 'deployed', deviceId: 'DEV-0107', deviceName: '桥面高杆灯控制器', deviceType: '单灯控制器', deployedAt: '2026-10-23 17:20', operator: '叶文来' },
  { id: 'ST2-POLE-02', label: '演武大桥桥面 #02', stationName: '演武大桥桥面', x: 40, y: 45, circuit: 'C 回路-桥面', status: 'pending' },
  { id: 'ST2-POLE-03', label: '演武大桥桥面 #03', stationName: '演武大桥桥面', x: 60, y: 42, circuit: 'D 回路-引桥', status: 'pending' },
  { id: 'ST2-POLE-04', label: '演武大桥桥面 #04', stationName: '演武大桥桥面', x: 80, y: 50, circuit: 'D 回路-引桥', status: 'pending' },
];

// 待部署设备池
const INITIAL_PENDING_DEVICES: PendingDevice[] = [
  { id: 'DEV-0205', name: '智能单灯节能控制器', model: 'TS-SLC-Cat1-Pro', type: '单灯控制器', spec: 'Cat.1 / 0-10V 调光' },
  { id: 'DEV-0208', name: '全光谱 LED 智慧路灯', model: 'TS-LED-180W-C', type: '智慧灯具', spec: '180W / IP66 / 光敏自适应' },
  { id: 'DEV-0301', name: '边缘多功能照明网关', model: 'TS-GW-5000', type: '智能网关', spec: 'RS485 / 4G双模 / 边缘策略' },
  { id: 'DEV-0312', name: '多回路智慧配电驱动器', model: 'TS-DRV-400W', type: '驱动电源', spec: '恒流双通道 / 远程遥测' },
  { id: 'DEV-0320', name: '微波空间存在感应模块', model: 'TS-SN-MW02', type: '传感器', spec: '24GHz 毫米波 / 12米探测' },
];

export function DeviceDeploymentPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.name ?? '厦门智慧照明示范项目');
  
  // 联动场站列表
  const projectStations = useMemo(() => {
    return stations.filter((st) => st.project === selectedProject);
  }, [selectedProject]);

  const [selectedStation, setSelectedStation] = useState(projectStations[0]?.name ?? '环岛南路示范段');

  // 当选择的项目变化时，自动联动选中该项目的第一个场站
  const handleProjectChange = (projName: string) => {
    setSelectedProject(projName);
    const related = stations.filter((st) => st.project === projName);
    if (related.length > 0) {
      setSelectedStation(related[0].name);
    } else {
      setSelectedStation('');
    }
  };

  const [points, setPoints] = useState<DeploymentPoint[]>(INITIAL_POINTS);
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>(INITIAL_PENDING_DEVICES);
  const [deviceSearch, setDeviceSearch] = useState('');

  // 当前选中场站下的点位
  const currentStationPoints = useMemo(() => {
    const list = points.filter((p) => p.stationName === selectedStation);
    if (list.length > 0) return list;
    // 如果该场站暂无预设点位，生成虚拟点位方便交互演示
    return [
      { id: `${selectedStation}-P1`, label: `${selectedStation} #01`, stationName: selectedStation, x: 25, y: 35, circuit: 'A 回路', status: 'deployed' as const, deviceId: 'DEV-0105', deviceName: '路灯控制器', deviceType: '单灯控制器', deployedAt: '2026-10-24', operator: '周启航' },
      { id: `${selectedStation}-P2`, label: `${selectedStation} #02`, stationName: selectedStation, x: 50, y: 45, circuit: 'A 回路', status: 'pending' as const },
      { id: `${selectedStation}-P3`, label: `${selectedStation} #03`, stationName: selectedStation, x: 75, y: 40, circuit: 'B 回路', status: 'pending' as const },
    ];
  }, [points, selectedStation]);

  // 部署弹窗状态
  const [deployDialogPoint, setDeployDialogPoint] = useState<DeploymentPoint | null>(null);
  const [dialogDeviceId, setDialogDeviceId] = useState('');
  const [dialogCircuit, setDialogCircuit] = useState('A 回路-主干');
  const [dialogOperator, setDialogOperator] = useState('admin (系统管理员)');

  const handleOpenDeploy = (point: DeploymentPoint) => {
    setDeployDialogPoint(point);
    setDialogCircuit(point.circuit || 'A 回路-主干');
    if (point.status === 'deployed') {
      setDialogDeviceId(point.deviceId || '');
    } else {
      setDialogDeviceId(pendingDevices[0]?.id ?? '');
    }
  };

  const handleConfirmDeploy = () => {
    if (!deployDialogPoint) return;
    if (!dialogDeviceId) {
      toast.error('请选择需要绑定的待部署设备');
      return;
    }

    const selectedDev = pendingDevices.find((d) => d.id === dialogDeviceId);
    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false });

    // 更新点位状态
    setPoints((prev) =>
      prev.map((p) => {
        if (p.id === deployDialogPoint.id) {
          return {
            ...p,
            status: 'deployed',
            deviceId: dialogDeviceId,
            deviceName: selectedDev?.name ?? '智慧照明终端',
            deviceType: selectedDev?.type ?? '单灯控制器',
            circuit: dialogCircuit,
            deployedAt: nowTime,
            operator: dialogOperator,
          };
        }
        return p;
      })
    );

    // 从待部署池中扣减
    setPendingDevices((prev) => prev.filter((d) => d.id !== dialogDeviceId));

    toast.success(`设备 [${dialogDeviceId}] 已成功部署到点位 [${deployDialogPoint.id}]！`);
    setDeployDialogPoint(null);
  };

  const filteredPending = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase();
    if (!q) return pendingDevices;
    return pendingDevices.filter(
      (d) => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.model.toLowerCase().includes(q)
    );
  }, [pendingDevices, deviceSearch]);

  const deployedCount = currentStationPoints.filter((p) => p.status === 'deployed').length;
  const pendingCount = currentStationPoints.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="设备管理 / 设备部署"
        title="设备点位部署工作台"
        description="选择目标项目及场站，在交互式点位地图上点击待部署点位，完成设备绑定、回路划分与现场部署。"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="当前场站已部署" value={String(deployedCount)} unit="处" icon={CheckCircle2} tone="green" />
        <StatCard label="当前场站待部署" value={String(pendingCount)} unit="处" icon={Clock} tone="amber" />
        <StatCard label="待分配设备池" value={String(pendingDevices.length)} unit="台" icon={Cpu} tone="blue" />
      </div>

      {/* 左右分栏核心区域 */}
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* 左侧：选择与待部署设备池 */}
        <div className="space-y-5">
          {/* 左侧上半部：选择项目及场站 */}
          <section className="app-surface rounded-2xl p-4 border border-border">
            <h2 className="flex items-center text-sm font-semibold text-foreground mb-3">
              <span className="mr-2 inline-block h-3.5 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
              1. 选择所属项目与场站
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">所属项目</label>
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="请选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.name} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">运营场站 / 路段</label>
                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="请选择场站" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStations.length === 0 ? (
                      <SelectItem value="none" disabled className="text-xs">该项目下暂无场站</SelectItem>
                    ) : (
                      projectStations.map((st) => (
                        <SelectItem key={st.id} value={st.name} className="text-xs">
                          {st.name} ({st.id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* 左侧下半部：待部署设备池 */}
          <section className="app-surface rounded-2xl p-4 border border-border flex flex-col h-[460px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center text-sm font-semibold text-foreground">
                <span className="mr-2 inline-block h-3.5 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
                2. 待分布/部署设备池
              </h2>
              <Badge variant="outline" className="text-[10px] bg-brand-500/10 text-brand-700 dark:text-brand-300">
                剩余 {pendingDevices.length} 台
              </Badge>
            </div>

            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                placeholder="搜索待部署设备编号/型号..."
                className="h-8 pl-8 text-xs bg-background/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPending.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  暂无待部署设备（或已全部完成部署）
                </div>
              ) : (
                filteredPending.map((dev) => (
                  <div
                    key={dev.id}
                    className="rounded-xl border border-border/80 bg-background/40 p-3 transition-colors hover:border-brand-500/40 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-300">
                        {dev.id}
                      </span>
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-[9px] text-amber-700 dark:text-amber-300">
                        待部署
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-medium text-foreground">{dev.name}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{dev.model}</span>
                      <span>{dev.type}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] text-muted-foreground">
                      <span>{dev.spec}</span>
                      <span className="text-brand-500 flex items-center gap-0.5">
                        <Sparkles className="size-2.5" />在右侧地图点击点位部署
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 右侧：地图点位可视化交互区 */}
        <section className="app-surface rounded-2xl p-5 border border-border flex flex-col min-h-[580px]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <MapPinned className="size-4 text-brand-600" />
                  {selectedStation} · 电子点位地图
                </h2>
                <Badge variant="outline" className="text-[10px] bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  {selectedProject}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                提示：点击地图上的 <span className="text-amber-500 font-semibold">黄色发光待部署点位</span>，即可弹出对话框选择设备并完成部署。
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-brand-500 ring-2 ring-brand-500/20" />已部署 ({deployedCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-400 animate-pulse ring-2 ring-amber-400/40" />待部署 ({pendingCount})
              </span>
            </div>
          </div>

          {/* 交互式点位地图画布 */}
          <div className="relative flex-1 overflow-hidden rounded-xl border border-border/80 bg-slate-950 p-4 shadow-inner min-h-[440px]">
            {/* 地图背景微网格与装饰道路线条 */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
            <svg className="absolute inset-0 size-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* 模拟道路干线 */}
              <path
                d="M 50 150 Q 300 240 550 200 T 950 260"
                fill="none"
                stroke="url(#roadGlow)"
                strokeWidth="28"
                strokeLinecap="round"
                className="opacity-40"
              />
              <path
                d="M 50 150 Q 300 240 550 200 T 950 260"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="opacity-70"
              />
              {/* 次级支线 */}
              <path d="M 400 220 L 480 380" fill="none" stroke="#2563eb" strokeWidth="12" className="opacity-25" />
              <path d="M 650 210 L 720 80" fill="none" stroke="#2563eb" strokeWidth="12" className="opacity-25" />
            </svg>

            {/* 地图上的点位渲染 */}
            {currentStationPoints.map((point) => {
              const isDeployed = point.status === 'deployed';
              return (
                <div
                  key={point.id}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => handleOpenDeploy(point)}
                  title={`点击部署或查看：${point.id} (${point.label})`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                >
                  {/* 点位圆点 */}
                  <div className="relative flex items-center justify-center">
                    {!isDeployed && (
                      <span className="absolute size-9 rounded-full bg-amber-400/25 animate-ping" />
                    )}
                    <div
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full border-2 transition-transform duration-200 group-hover:scale-125 shadow-lg',
                        isDeployed
                          ? 'border-brand-400 bg-brand-600 text-white shadow-brand-500/50'
                          : 'border-amber-300 bg-amber-500 text-slate-950 shadow-amber-500/50 animate-pulse'
                      )}
                    >
                      {isDeployed ? <Lightbulb className="size-4" /> : <HardDriveUpload className="size-4" />}
                    </div>
                  </div>

                  {/* 悬浮/常驻点位标签 */}
                  <div className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-200 shadow-md backdrop-blur transition-opacity">
                    <span className="font-mono font-medium">{point.id}</span>
                    <span className="ml-1 text-slate-400">{isDeployed ? point.deviceId : '待部署'}</span>
                  </div>
                </div>
              );
            })}

            {/* 地图右下角图例 */}
            <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-slate-900/85 p-2.5 text-[10px] text-slate-300 backdrop-blur space-y-1">
              <div className="font-semibold text-white mb-1 flex items-center gap-1">
                <Layers className="size-3 text-brand-400" />图层说明
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-400" />
                <span>已部署灯杆节点</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>空闲/待部署点位 (可点击)</span>
              </div>
              <div className="text-[9px] text-slate-400 pt-1 border-t border-white/10">
                双向六车道路网拓扑
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 弹出的部署对话框 */}
      <Dialog open={!!deployDialogPoint} onOpenChange={(open) => !open && setDeployDialogPoint(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDriveUpload className="size-5 text-brand-600" />
              点位设备部署配置
            </DialogTitle>
            <DialogDescription>
              将待部署设备绑定至指定灯杆点位，并完成回路与责任人分配。
            </DialogDescription>
          </DialogHeader>

          {deployDialogPoint && (
            <div className="space-y-4 py-2">
              {/* 点位基础信息 */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">点位编号:</span>
                  <span className="font-mono font-semibold text-foreground">{deployDialogPoint.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">所属场站:</span>
                  <span className="text-foreground">{deployDialogPoint.stationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">当前状态:</span>
                  <Badge variant="outline" className={cn('text-[10px]', deployDialogPoint.status === 'deployed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                    {deployDialogPoint.status === 'deployed' ? '已部署 (可重新分配)' : '待部署点位'}
                  </Badge>
                </div>
              </div>

              {/* 设备选择 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  绑定设备 (从待部署池中选择)
                </label>
                <Select value={dialogDeviceId} onValueChange={setDialogDeviceId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="请选择待部署设备" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingDevices.length === 0 ? (
                      <SelectItem value="none" disabled className="text-xs">
                        待部署池已空
                      </SelectItem>
                    ) : (
                      pendingDevices.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">
                          {d.id} - {d.name} ({d.model})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 回路选择 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  分配供电回路
                </label>
                <Select value={dialogCircuit} onValueChange={setDialogCircuit}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="请选择回路" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A 回路-东段" className="text-xs">A 回路-东段 (主干道北侧)</SelectItem>
                    <SelectItem value="B 回路-中段" className="text-xs">B 回路-中段 (立交匝道)</SelectItem>
                    <SelectItem value="C 回路-西段" className="text-xs">C 回路-西段 (高架辅道)</SelectItem>
                    <SelectItem value="D 回路-引桥" className="text-xs">D 回路-引桥 (桥面照明)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 操作人 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  现场施工/部署人员
                </label>
                <Input
                  value={dialogOperator}
                  onChange={(e) => setDialogOperator(e.target.value)}
                  placeholder="请输入操作人"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeployDialogPoint(null)}>
              取消
            </Button>
            <Button size="sm" onClick={handleConfirmDeploy} className="bg-brand-600 text-white hover:bg-brand-700 shadow-sm">
              <Send className="mr-1.5 size-3.5" />
              确认部署并同步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
