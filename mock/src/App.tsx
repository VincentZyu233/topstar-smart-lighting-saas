import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from '@/LoginPage';
import type { AuthSession, ThemeMode } from '@/types';

const HomePage = lazy(() => import('@/pages/home-page').then((module) => ({ default: module.HomePage })));
const BigScreenPage = lazy(() => import('@/pages/big-screen-page').then((module) => ({ default: module.BigScreenPage })));
const ProjectListPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.ProjectListPage })));
const StationListPage = lazy(() => import('@/pages/station-tree-page').then((module) => ({ default: module.StationTreePage })));
const DeviceTypesPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.DeviceTypesPage })));
const DeviceModelsPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.DeviceModelsPage })));
const DeviceListPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.DeviceListPage })));
const DeviceDeploymentPage = lazy(() => import('@/pages/device-deployment-page').then((module) => ({ default: module.DeviceDeploymentPage })));
const DepartmentsPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.DepartmentsPage })));
const RolesPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.RolesPage })));
const UsersPage = lazy(() => import('@/pages/management-pages').then((module) => ({ default: module.UsersPage })));
const RealtimeMonitorPage = lazy(() => import('@/pages/realtime-monitor-page').then((module) => ({ default: module.RealtimeMonitorPage })));
const StrategyPage = lazy(() => import('@/pages/strategy-page').then((module) => ({ default: module.StrategyPage })));
const AlertsPage = lazy(() => import('@/pages/alerts-page').then((module) => ({ default: module.AlertsPage })));
const ReportsPage = lazy(() => import('@/pages/reports-page').then((module) => ({ default: module.ReportsPage })));
const BrandPage = lazy(() => import('@/pages/brand-page').then((module) => ({ default: module.BrandPage })));
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })));

const AUTH_STORAGE_KEY = 'topstar_auth';
const AUTH_SESSION_KEY = 'topstar_auth_session';
const THEME_STORAGE_KEY = 'topstar_theme';

function readAuthSession(): AuthSession | null {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!rawSession) return null;
  try {
    const session = JSON.parse(rawSession) as AuthSession;
    return session.username ? session : null;
  } catch {
    return null;
  }
}

function persistAuthSession(username: string, remember: boolean) {
  const session: AuthSession = { username, authenticatedAt: Date.now() };
  const serialized = JSON.stringify(session);
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, serialized);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  } else {
    sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

function ProtectedRoute({
  session,
  theme,
  onThemeChange,
  onLogout,
}: {
  session: AuthSession | null;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onLogout: () => void;
}) {
  if (!session) return <Navigate to="/login" replace />;
  return <AppShell session={session} theme={theme} onThemeChange={onThemeChange} onLogout={onLogout} />;
}

function LoginRoute({
  session,
  theme,
  onThemeChange,
  onLogin,
}: {
  session: AuthSession | null;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onLogin: (username: string, remember: boolean) => void;
}) {
  if (session) return <Navigate to="/" replace />;
  return <LoginPage themeMode={theme} onThemeChange={onThemeChange} onLogin={onLogin} />;
}

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  });
  const [session, setSession] = useState<AuthSession | null>(readAuthSession);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  const handleLogin = (username: string, remember: boolean) => {
    persistAuthSession(username, remember);
    setSession({ username, authenticatedAt: Date.now() });
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
  };

  const protectedProps = {
    session,
    theme: themeMode,
    onThemeChange: setThemeMode,
    onLogout: handleLogout,
  };

  return (
    <HashRouter>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">正在加载控制台...</div>}>
        <Routes>
          <Route path="/login" element={<LoginRoute session={session} theme={themeMode} onThemeChange={setThemeMode} onLogin={handleLogin} />} />
          <Route element={<ProtectedRoute {...protectedProps} />}>
            <Route index element={<HomePage />} />
            <Route path="/big-screen" element={<BigScreenPage />} />
            <Route path="/projects" element={<Navigate to="/projects/list" replace />} />
            <Route path="/projects/list" element={<ProjectListPage />} />
            <Route path="/projects/stations" element={<StationListPage />} />
            <Route path="/devices" element={<Navigate to="/devices/types" replace />} />
            <Route path="/devices/types" element={<DeviceTypesPage />} />
            <Route path="/devices/models" element={<DeviceModelsPage />} />
            <Route path="/devices/list" element={<DeviceListPage />} />
            <Route path="/devices/deployments" element={<DeviceDeploymentPage />} />
            <Route path="/monitoring" element={<Navigate to="/monitoring/realtime" replace />} />
            <Route path="/monitoring/realtime" element={<RealtimeMonitorPage />} />
            <Route path="/monitoring/strategies" element={<StrategyPage />} />
            <Route path="/monitoring/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/organization" element={<Navigate to="/organization/departments" replace />} />
            <Route path="/organization/departments" element={<DepartmentsPage />} />
            <Route path="/organization/roles" element={<RolesPage />} />
            <Route path="/organization/users" element={<UsersPage />} />
            <Route path="/brand" element={<BrandPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
        </Routes>
      </Suspense>
      <Toaster theme={themeMode} richColors position="bottom-right" />
    </HashRouter>
  );
}
