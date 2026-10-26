import { useEffect, useState } from 'react';
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import topstarLogo from '@/assets/topstar-logo.svg';
import topstarLogoDark from '@/assets/topstar-logo-dark.svg';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { navigationGroups } from '@/navigation';
import { useBrandConfig } from '@/lib/brand-config';
import type { AuthSession, NavItem } from '@/types';
import { cn } from '@/lib/utils';

function isItemActive(pathname: string, item: NavItem) {
  if (item.path) return pathname === item.path;
  return item.children?.some((child) => pathname === child.path) ?? false;
}

export function AppSidebar({ session, onLogout }: { session: AuthSession; onLogout: () => void }) {
  const [brandConfig] = useBrandConfig();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const activeParent = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => item.children?.some((child) => child.path === pathname))?.id;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    return activeParent ? { [activeParent]: true } : {};
  });

  useEffect(() => {
    if (activeParent) {
      setOpenGroups((prev) => ({ ...prev, [activeParent]: true }));
    }
  }, [activeParent]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/80 px-3 py-3">
        <div className="flex h-11 items-center gap-3 overflow-hidden rounded-xl px-2">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-500/25 bg-white p-1 shadow-sm">
            <img src={topstarLogo} alt="通士达" className="size-full object-contain" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight text-white">{brandConfig.platformName}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.17em] text-slate-400">{brandConfig.subName}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item);
                  if (!item.children) {
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className={cn(
                            'h-9 rounded-lg px-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white',
                            active && 'bg-brand-600 text-white font-medium shadow-sm hover:bg-brand-600 hover:text-white',
                          )}
                        >
                          <Link to={item.path!} onClick={handleNavigate}>
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                      </SidebarMenuItem>
                    );
                  }

                  const expanded = !!openGroups[item.id];
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={active}
                        onClick={() => toggleGroup(item.id)}
                        className={cn(
                          'h-9 rounded-lg px-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white',
                          active && 'bg-brand-500/20 text-brand-300 font-medium',
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                        <ChevronDown className={cn('ml-auto size-3.5 transition-transform duration-200 group-data-[collapsible=icon]:hidden', expanded && 'rotate-180')} />
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                      <div
                        className={cn(
                          'grid transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden',
                          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none',
                        )}
                      >
                        <div className="overflow-hidden">
                          <SidebarMenuSub className="ml-5 gap-0.5 border-sidebar-border/70 py-0.5">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = pathname === child.path;
                              return (
                                <SidebarMenuSubItem key={child.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={childActive}
                                    className={cn(
                                      'h-8 rounded-md text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/5',
                                      childActive && 'bg-brand-600/30 font-medium text-brand-300',
                                    )}
                                  >
                                    <Link to={child.path!} onClick={handleNavigate}>
                                      <ChildIcon className="size-3.5" />
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                  {child.badge && <Badge className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] text-white">{child.badge}</Badge>}
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </div>
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 p-2">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-slate-300 group-data-[collapsible=icon]:hidden">
          <span className="flex items-center gap-1.5"><span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />全网运行正常</span>
          <span className="font-mono text-emerald-400">99.8%</span>
        </div>
        <SidebarSeparator className="bg-white/10" />
        <div className="flex items-center gap-2 rounded-xl px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500/25 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/30">
            {session.username.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium text-slate-200">{session.username}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400"><ShieldCheck className="size-2.5" />系统管理员</p>
          </div>
          <Button size="icon-xs" variant="ghost" onClick={onLogout} title="退出登录" className="text-slate-400 hover:bg-white/10 hover:text-rose-400 group-data-[collapsible=icon]:hidden">
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
