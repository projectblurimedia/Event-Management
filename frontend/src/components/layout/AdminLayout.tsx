import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Boxes,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Moon,
  Package,
  Settings,
  Sparkles,
  Sun,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { TranslationKey } from '@/lib/i18n/translations';

const navItems: { to: string; labelKey: TranslationKey; icon: typeof LayoutDashboard; end?: boolean }[] = [
  { to: '/admin', labelKey: 'admin.nav.overview', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', labelKey: 'admin.nav.bookings', icon: CalendarCheck },
  { to: '/admin/enquiries', labelKey: 'admin.nav.enquiries', icon: MessageSquareQuote },
  { to: '/admin/menu', labelKey: 'admin.nav.menuItems', icon: UtensilsCrossed },
  { to: '/admin/packages', labelKey: 'admin.nav.packages', icon: Package },
  { to: '/admin/service-categories', labelKey: 'admin.nav.serviceCategories', icon: Boxes },
  { to: '/admin/gallery', labelKey: 'admin.nav.gallery', icon: Image },
  { to: '/admin/testimonials', labelKey: 'admin.nav.testimonials', icon: Sparkles },
  { to: '/admin/faqs', labelKey: 'admin.nav.faqs', icon: ClipboardList },
  { to: '/admin/settings', labelKey: 'admin.nav.settings', icon: Settings },
];

export function AdminLayout() {
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminInitial = (admin?.name ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="bg-surface-muted min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'bg-ink-black text-cream border-gold/20 fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-gold/20 flex items-center justify-between gap-2.5 border-b px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="border-gold text-gold font-display flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold">
              MS
            </span>
            <span className="text-sm font-semibold tracking-wide">Admin Dashboard</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="text-cream/70 flex h-8 w-8 items-center justify-center lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-medium transition-colors',
                  isActive ? 'bg-gold/15 text-gold' : 'text-cream/70 hover:bg-white/5 hover:text-cream',
                )
              }
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="bg-surface border-border flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-text-muted flex h-9 w-9 items-center justify-center lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('header.toggleTheme')}
              className="text-text-muted hover:text-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="hover:bg-surface-muted flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors"
              >
                <span className="bg-gold/10 text-gold font-display flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                  {adminInitial}
                </span>
                <span className="text-text-muted hidden text-sm sm:inline">{admin?.name ?? 'Admin'}</span>
                <ChevronDown size={14} className={cn('text-text-muted transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="border-border bg-surface absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border shadow-lg"
                >
                  <div className="border-border border-b px-4 py-3">
                    <p className="truncate text-sm font-semibold">{admin?.name ?? 'Admin'}</p>
                    <p className="text-text-muted truncate text-xs">{admin?.email}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="text-rose flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-rose/10"
                  >
                    <LogOut size={15} /> {t('admin.nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
        <footer className="border-border text-text-muted border-t px-4 py-4 text-center text-xs sm:px-6 lg:px-8">
          {siteConfig.businessName} Admin Dashboard · &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
