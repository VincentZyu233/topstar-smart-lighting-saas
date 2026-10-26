import { useState, type FormEvent } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import loginBackground from './assets/login-bg.webp';
import topstarLogoDark from './assets/topstar-logo-dark.svg';
import topstarLogoLight from './assets/topstar-logo.svg';
import { useBrandConfig } from './lib/brand-config';

type ThemeMode = 'dark' | 'light';

interface LoginPageProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onLogin: (username: string, remember: boolean) => void;
}

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = '123456';

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: typeof Moon }> = [
  { id: 'dark', label: '深色', icon: Moon },
  { id: 'light', label: '浅色', icon: Sun },
];

export default function LoginPage({ themeMode, onThemeChange, onLogin }: LoginPageProps) {
  const [brandConfig] = useBrandConfig();
  const [username, setUsername] = useState(() => localStorage.getItem('topstar_remembered_user') || DEMO_USERNAME);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setError('请输入账号和密码');
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      if (normalizedUsername === DEMO_USERNAME && password === DEMO_PASSWORD) {
        if (remember) {
          localStorage.setItem('topstar_remembered_user', normalizedUsername);
        } else {
          localStorage.removeItem('topstar_remembered_user');
        }
        setIsLoading(false);
        onLogin(normalizedUsername, remember);
        return;
      }

      setError('账号或密码不正确，请检查后重试。');
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 selection:bg-brand-500/20 selection:text-brand-600 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={loginBackground}
          alt=""
          draggable={false}
          decoding="async"
          className="h-full w-full object-cover object-center opacity-70 brightness-105 contrast-110 saturate-130 transition-[opacity,filter] duration-200 dark:opacity-100 dark:brightness-130 dark:saturate-125"
        />
        <div className="absolute inset-0 bg-sky-100/35 dark:bg-[#020817]/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/45 via-blue-50/20 to-blue-200/65 dark:from-zinc-950/5 dark:via-zinc-950/0 dark:to-zinc-950/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.32),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.26),transparent_30%),radial-gradient(circle_at_50%_105%,rgba(37,99,235,0.24),transparent_40%)] opacity-65 dark:opacity-15" />
      </div>
      <div aria-hidden="true" className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-35 dark:opacity-15" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full border border-brand-500/20 bg-brand-500/10 blur-[1px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full border border-cyan-500/20 bg-cyan-500/10" />
      

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-600 shadow-sm shadow-brand-500/10 dark:text-brand-400">
            <Activity className="h-[18px] w-[18px]" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-tight">通士达智慧照明</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">SMART LIGHTING SAAS</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg border border-brand-200/80 bg-white/65 p-0.5 shadow-sm shadow-brand-500/10 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/70">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = themeMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                title={option.label}
                aria-label={option.label}
                aria-pressed={isActive}
                onClick={() => onThemeChange(option.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <section className="relative w-full max-w-[430px] overflow-hidden rounded-2xl border border-brand-300/70 bg-white/86 p-6 shadow-2xl shadow-brand-500/20 ring-1 ring-white/70 backdrop-blur-md sm:p-8 dark:border-brand-500/15 dark:bg-zinc-900/88 dark:shadow-black/40 dark:ring-brand-500/10">
          
          
          

          <div className="relative text-center">
            <div className="flex items-center justify-center gap-3">
              <img src={topstarLogoLight} alt="TOPSTAR 通士达" className="h-10 w-auto shrink-0 dark:hidden" />
              <img src={topstarLogoDark} alt="TOPSTAR 通士达" className="hidden h-10 w-auto shrink-0 dark:block" />
              <div aria-hidden="true" className="h-8 w-px shrink-0 bg-brand-200 dark:bg-brand-500/25" />
              <h1 className="max-w-[220px] text-left text-lg font-semibold leading-tight tracking-tight">{brandConfig.platformName}</h1>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{brandConfig.subName}</p>
          </div>

          <form className="relative mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-brand-800 dark:text-zinc-300">账号</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入账号"
                  className="h-11 w-full rounded-xl border border-brand-200/90 bg-blue-50/65 pl-10 pr-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-brand-400/80 focus:border-brand-500 focus:bg-white/90 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950/80"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-brand-800 dark:text-zinc-300">密码</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                  className="h-11 w-full rounded-xl border border-brand-200/90 bg-blue-50/65 pl-10 pr-11 text-sm text-zinc-900 outline-none transition-all placeholder:text-brand-400/80 focus:border-brand-500 focus:bg-white/90 focus:ring-4 focus:ring-brand-500/15 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  title={showPassword ? '隐藏密码' : '显示密码'}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-brand-700 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 accent-brand-600"
                />
                记住登录状态
              </label>
              <span className="flex items-center gap-1 font-mono text-[10px] text-brand-500 dark:text-zinc-400"><ShieldCheck className="h-3 w-3" />Mock Secure</span>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white shadow-sm transition-all disabled:cursor-wait disabled:opacity-80"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  正在验证身份
                </>
              ) : (
                <>
                  登录控制中枢
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

        </section>
      </main>

      <footer className="absolute inset-x-0 bottom-4 z-10 hidden items-center justify-between px-8 font-mono text-[10px] text-zinc-400 sm:flex dark:text-zinc-600">
        <span>通士达智慧照明 SaaS 平台 · Smart Lighting IoT Platform</span>
        <span>Mock Environment · 2026</span>
      </footer>
    </div>
  );
}
