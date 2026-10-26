import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Cpu,
  FolderKanban,
  Lightbulb,
  MapPin,
  MapPinned,
  Radio,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageHeader, StatCard, StatusBadge } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { devices, projects, stations } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function StationTreePage() {
  const [query, setQuery] = useState('');
  
  // 树形展开状态：记录展开的项目 ID 和场站 ID
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    'PRJ-001': true,
    'PRJ-002': true,
  });
  const [expandedStations, setExpandedStations] = useState<Record<string, boolean>>({
    'ST-001': true,
    'ST-002': true,
  });

  // 组织 项目 -> 场站 -> 设备 数据树
  const treeData = useMemo(() => {
    return projects.map((prj) => {
      const prjStations = stations.filter((st) => st.project === prj.name);
      return {
        ...prj,
        stations: prjStations.map((st) => {
          const stDevices = devices.filter((dev) => dev.station === st.name);
          return {
            ...st,
            devicesList: stDevices,
          };
        }),
      };
    });
  }, []);

  // 搜索过滤与自动展开
  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return treeData;

    return treeData
      .map((prj) => {
        const prjMatch = prj.name.toLowerCase().includes(q) || prj.id.toLowerCase().includes(q) || prj.city.toLowerCase().includes(q);

        const matchingStations = prj.stations
          .map((st) => {
            const stMatch = st.name.toLowerCase().includes(q) || st.id.toLowerCase().includes(q) || st.address.toLowerCase().includes(q);
            const matchingDevices = st.devicesList.filter(
              (dev) => dev.id.toLowerCase().includes(q) || dev.name.toLowerCase().includes(q) || dev.model.toLowerCase().includes(q) || dev.type.toLowerCase().includes(q)
            );

            if (stMatch || matchingDevices.length > 0 || prjMatch) {
              return {
                ...st,
                devicesList: matchingDevices.length > 0 ? matchingDevices : st.devicesList,
              };
            }
            return null;
          })
          .filter(Boolean) as typeof prj.stations;

        if (prjMatch || matchingStations.length > 0) {
          return {
            ...prj,
            stations: matchingStations.length > 0 ? matchingStations : prj.stations,
          };
        }
        return null;
      })
      .filter(Boolean) as typeof treeData;
  }, [treeData, query]);

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStation = (id: string) => {
    setExpandedStations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allPrj: Record<string, boolean> = {};
    const allSt: Record<string, boolean> = {};
    projects.forEach((p) => { allPrj[p.id] = true; });
    stations.forEach((s) => { allSt[s.id] = true; });
    setExpandedProjects(allPrj);
    setExpandedStations(allSt);
  };

  const collapseAll = () => {
    setExpandedProjects({});
    setExpandedStations({});
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="项目管理 / 场站管理"
        title="场站层级拓扑与设备树"
        description="基于「项目 ➔ 场站 ➔ 设备」三级树状拓扑结构，逐级展开管控各路段场站的部署设备与运行状态。"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="h-8 gap-1 text-xs">
              <ChevronsUpDown className="size-3.5" />全部展开
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="h-8 gap-1 text-xs">
              <ChevronsDownUp className="size-3.5" />全部收起
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="管控项目" value={String(projects.length)} unit="个" icon={FolderKanban} tone="blue" />
        <StatCard label="运营场站" value={String(stations.length)} unit="座" icon={MapPinned} tone="cyan" />
        <StatCard label="关联设备总数" value={String(devices.length * 180)} unit="台" icon={Cpu} tone="green" />
      </div>

      <section className="app-surface overflow-hidden rounded-2xl border border-border">
        {/* 顶部过滤条 */}
        <div className="flex flex-col gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索项目、场站名、设备编号或型号..."
              className="h-9 bg-background/50 pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>共 {filteredTree.length} 个项目</span>
            <span>·</span>
            <span>{filteredTree.reduce((acc, p) => acc + p.stations.length, 0)} 座场站</span>
          </div>
        </div>

        {/* 树状表格内容区 */}
        <div className="divide-y divide-border/60">
          {filteredTree.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">未找到匹配的项目或场站</div>
          ) : (
            filteredTree.map((project) => {
              const isPrjExpanded = !!expandedProjects[project.id];
              return (
                <div key={project.id} className="transition-colors">
                  {/* 一级：项目行 */}
                  <div
                    onClick={() => toggleProject(project.id)}
                    className="flex cursor-pointer items-center justify-between gap-3 bg-muted/30 px-4 py-3.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <button className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-background/80 hover:text-foreground">
                        {isPrjExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                      <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-300">
                        <FolderKanban className="size-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{project.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">({project.id})</span>
                          <Badge variant="outline" className="border-brand-500/20 bg-brand-500/10 text-[10px] text-brand-700 dark:text-brand-300">
                            {project.city}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
                      <span className="hidden sm:inline">负责人: {project.manager}</span>
                      <span>{project.stations.length} 座场站</span>
                      <StatusBadge status={project.status} />
                    </div>
                  </div>

                  {/* 二级：场站列表 */}
                  {isPrjExpanded && (
                    <div className="divide-y divide-border/40 pl-6 sm:pl-10">
                      {project.stations.length === 0 ? (
                        <div className="py-4 text-xs text-muted-foreground">该项目暂未划定场站</div>
                      ) : (
                        project.stations.map((station) => {
                          const isStExpanded = !!expandedStations[station.id];
                          return (
                            <div key={station.id} className="transition-colors">
                              {/* 场站行 */}
                              <div
                                onClick={() => toggleStation(station.id)}
                                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-3 hover:bg-muted/30"
                              >
                                <div className="flex items-center gap-2.5">
                                  <button className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">
                                    {isStExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                                  </button>
                                  <span className="flex size-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-300">
                                    <MapPinned className="size-3.5" />
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-foreground">{station.name}</span>
                                      <span className="font-mono text-[10px] text-muted-foreground">[{station.id}]</span>
                                    </div>
                                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <MapPin className="size-2.5" />
                                      {station.address}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                  <div className="hidden items-center gap-2 md:flex">
                                    <span className="text-[10px] text-muted-foreground">在线率:</span>
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                      <div className="h-full bg-emerald-500" style={{ width: `${station.onlineRate}%` }} />
                                    </div>
                                    <span className="font-mono text-[10px]">{station.onlineRate}%</span>
                                  </div>
                                  <span className="font-mono text-[11px] text-muted-foreground">{station.devicesList.length} 台设备</span>
                                  <span className="hidden text-[11px] text-muted-foreground lg:inline">负责人: {station.manager}</span>
                                  <StatusBadge status={station.status} />
                                </div>
                              </div>

                              {/* 三级：场站内的设备列表 */}
                              {isStExpanded && (
                                <div className="border-l-2 border-brand-500/30 pl-5 pr-3 py-2 my-1 space-y-1.5 bg-background/40">
                                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 pb-1 border-b border-border/30">
                                    <span>设备编号 / 型号</span>
                                    <div className="flex items-center gap-6">
                                      <span>回路 / 点位</span>
                                      <span>运行状态</span>
                                    </div>
                                  </div>
                                  {station.devicesList.length === 0 ? (
                                    <div className="py-2 text-[11px] text-muted-foreground">该场站暂无归属设备</div>
                                  ) : (
                                    station.devicesList.map((dev) => (
                                      <div
                                        key={dev.id}
                                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/50"
                                      >
                                        <div className="flex items-center gap-2">
                                          {dev.type === '智能网关' ? (
                                            <Radio className="size-3.5 text-sky-500" />
                                          ) : dev.type === '驱动电源' ? (
                                            <Zap className="size-3.5 text-amber-500" />
                                          ) : (
                                            <Lightbulb className="size-3.5 text-brand-500" />
                                          )}
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono text-[11px] font-medium text-foreground">{dev.id}</span>
                                              <span className="text-[11px] text-muted-foreground">{dev.name}</span>
                                            </div>
                                            <span className="font-mono text-[9px] text-muted-foreground">{dev.model}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                          <span className="font-mono text-[10px] text-muted-foreground">
                                            {dev.circuit} · {dev.pole}
                                          </span>
                                          <StatusBadge status={dev.status} />
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
