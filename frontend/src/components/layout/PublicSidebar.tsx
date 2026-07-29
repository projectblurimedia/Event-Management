import { NavLink } from 'react-router-dom';
import { LockKeyhole, Moon, Sun, X } from 'lucide-react';
import { Logo } from './Logo';
import { LinkButton } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useUiStore } from '@/store/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { TranslationKey } from '@/lib/i18n/translations';

const navLinks: { to: string; labelKey: TranslationKey }[] = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/services', labelKey: 'nav.services' },
  { to: '/packages', labelKey: 'nav.packages' },
  { to: '/menu', labelKey: 'nav.menu' },
  { to: '/event-types', labelKey: 'nav.eventTypes' },
  { to: '/contact', labelKey: 'nav.contact' },
];

interface PublicSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function PublicSidebar({ open, onClose }: PublicSidebarProps) {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        'bg-header-bg text-header-text border-gold/20 fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="border-gold/20 flex items-center justify-between gap-2.5 border-b px-5 py-5">
        <Logo className="text-header-text" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="text-header-text/70 flex h-8 w-8 items-center justify-center lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3.5 py-3 text-sm font-medium tracking-wide transition-colors',
                isActive ? 'bg-gold/15 text-gold' : 'text-header-text/85 hover:bg-white/5 hover:text-header-text',
              )
            }
          >
            {t(link.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-gold/20 flex flex-col gap-3 border-t px-4 py-4">
        <div className="flex items-center justify-between">
          <LanguageSwitcher compact mutedClassName="text-header-text/70" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('header.toggleTheme')}
              className="text-header-text/80 hover:text-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink
              to="/admin"
              onClick={onClose}
              aria-label={t('nav.admin')}
              title={t('nav.admin')}
              className="text-header-text/80 hover:text-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              <LockKeyhole size={18} />
            </NavLink>
          </div>
        </div>
        <LinkButton to="/booking" variant="gold" size="sm" className="w-full" onClick={onClose}>
          {t('nav.bookNow')}
        </LinkButton>
      </div>
    </aside>
  );
}
