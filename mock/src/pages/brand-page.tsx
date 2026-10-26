import { useState } from 'react';
import { BadgeCheck, Building2, ChartNoAxesCombined, Edit3, Lightbulb, Mail, MapPin, Phone, Radar, RotateCcw, Save, ShieldCheck, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import topstarLogo from '@/assets/topstar-logo.svg';
import topstarLogoDark from '@/assets/topstar-logo-dark.svg';
import { PageHeader, SectionCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brandCapabilities } from '@/data/mock-data';
import { useBrandConfig, type BrandConfig } from '@/lib/brand-config';

const iconMap = { lightbulb: Lightbulb, radar: Radar, wrench: Wrench, chart: ChartNoAxesCombined } as const;

export function BrandPage() {
  const [brandConfig, saveConfig, resetConfig] = useBrandConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BrandConfig>({ ...brandConfig });

  const handleStartEdit = () => {
    setFormData({ ...brandConfig });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(formData);
    setIsEditing(false);
    toast.success('品牌配置已更新！登录页及侧边栏已联动同步生效');
  };

  const handleReset = () => {
    const defaults = resetConfig();
    setFormData({ ...defaults });
    setIsEditing(false);
    toast.success('已恢复为默认品牌配置');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="品牌信息与配置"
        title={brandConfig.platformName}
        description="以智慧照明为核心，连接设备、空间、数据与运营服务的城市级物联网 SaaS 平台。"
        actions={
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={handleStartEdit} className="h-9 gap-1.5 bg-brand-600 text-white hover:bg-brand-700 shadow-sm">
                <Edit3 className="size-4" />修改品牌信息
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(false)} className="h-9">
                取消编辑
              </Button>
            )}
          </div>
        }
      />

      {isEditing && (
        <form onSubmit={handleSave} className="app-surface rounded-2xl border-2 border-brand-500/40 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="size-2 rounded-full bg-brand-600" />
                修改品牌与平台信息
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">修改后的平台名称、副标题及联系信息将自动联动更新至登录页、侧栏及全站各处。</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-muted-foreground hover:text-rose-500">
              <RotateCcw className="mr-1 size-3" />恢复默认
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">平台名称</label>
              <Input
                value={formData.platformName}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                placeholder="例如：通士达智慧照明SaaS平台"
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">英文/副标题</label>
              <Input
                value={formData.subName}
                onChange={(e) => setFormData({ ...formData, subName: e.target.value })}
                placeholder="例如：Smart Lighting SaaS"
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Logo标识文本</label>
              <Input
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                placeholder="例如：TOPSTAR 通士达"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">所属公司名称</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="例如：通士达科技股份有限公司"
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">服务热线</label>
              <Input
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="例如：400-888-6688"
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">商务邮箱</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="例如：smart-lighting@topstar.com"
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-foreground">总部地址</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="例如：福建省厦门市同安区通士达科技园"
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-border/80 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button type="submit" size="sm" className="bg-brand-600 text-white hover:bg-brand-700 shadow-sm">
              <Save className="mr-1 size-3.5" />保存并应用到全站
            </Button>
          </div>
        </form>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-brand-400/25 bg-brand-700 p-6 text-white shadow-lg md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-cyan-200/20 bg-cyan-300/10" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-2xl bg-white/95 px-5 py-3 shadow-xl"><img src={topstarLogo} alt="TOPSTAR 通士达" className="h-12 w-auto dark:hidden" /><img src={topstarLogoDark} alt="TOPSTAR 通士达" className="hidden h-12 w-auto dark:block" /></div>
            <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">让每一盏城市灯光，都成为可感知、可计算、可运营的数字化节点。</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/85">{brandConfig.platformName} 面向城市道路、园区、桥梁和公共空间，提供设备接入、实时监控、策略调光、告警运维和能耗分析的一体化能力。</p>
            <div className="mt-6 flex flex-wrap gap-2">{['智慧照明', '空间感知', 'SaaS 运营', 'IoT 设备管理', '节能降碳'].map((tag) => <Badge key={tag} className="border-white/20 bg-white/12 text-white hover:bg-white/15">{tag}</Badge>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['5,420', '接入设备'], ['398', '覆盖场站'], ['99.84%', '平台在线率'], ['41.2%', '综合节能率']].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="font-mono text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-blue-100/75">{label}</p></div>)}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {brandCapabilities.map((capability) => {
          const Icon = iconMap[capability.icon as keyof typeof iconMap];
          return (
            <div key={capability.title} className="app-surface rounded-2xl p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/20 dark:bg-brand-950/50 dark:text-brand-300"><Icon className="size-5" /></span>
              <h2 className="mt-4 text-sm font-semibold text-foreground">{capability.title}</h2>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{capability.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="平台价值" description="从单点设备控制升级为城市级照明运营能力">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: BadgeCheck, title: '统一设备接入', text: '兼容 Cat.1、NB-IoT、PLC、LoRaWAN 等协议，统一设备模型与遥测口径。' },
              { icon: ShieldCheck, title: '安全权限体系', text: '按组织、角色、项目和场站配置数据范围，保障运营边界清晰。' },
              { icon: ChartNoAxesCombined, title: '数据驱动节能', text: '持续分析亮度、时段、光照和能耗数据，自动优化照明策略。' },
              { icon: Wrench, title: '闭环运维', text: '告警发现、工单派发、现场处理、恢复确认全流程可追溯。' },
            ].map((item) => {
              const Icon = item.icon;
              return <div key={item.title} className="rounded-xl border border-border/60 bg-background/45 p-4"><Icon className="size-4 text-brand-600 dark:text-brand-300" /><h3 className="mt-3 text-xs font-semibold">{item.title}</h3><p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">{item.text}</p></div>;
            })}
          </div>
        </SectionCard>

        <SectionCard title="联系我们" description="通士达智慧照明事业部">
          <div className="space-y-3 text-xs">
            {[
              { icon: Building2, label: '公司名称', value: brandConfig.companyName },
              { icon: MapPin, label: '总部地址', value: brandConfig.address },
              { icon: Phone, label: '服务热线', value: brandConfig.hotline },
              { icon: Mail, label: '商务邮箱', value: brandConfig.email },
            ].map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="flex items-start gap-3 rounded-xl bg-muted/45 p-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300"><Icon className="size-4" /></span><span><span className="block text-[9px] text-muted-foreground">{item.label}</span><span className="mt-1 block font-medium text-foreground">{item.value}</span></span></div>;
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
