import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Logo } from './Logo';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
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
  { to: '/gallery', labelKey: 'nav.gallery' },
  { to: '/faq', labelKey: 'nav.faq' },
  { to: '/contact', labelKey: 'nav.contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const { t } = useTranslation();

  return (
    <header className="bg-header-bg text-header-text border-gold/20 sticky top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-18 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium tracking-wide transition-colors hover:text-gold',
                  isActive ? 'text-gold' : 'text-header-text/85',
                )
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher mutedClassName="text-header-text/70" />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('header.toggleTheme')}
            className="text-header-text/80 hover:text-gold flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <LinkButton to="/booking" variant="gold" size="sm">
            {t('nav.bookNow')}
          </LinkButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher compact mutedClassName="text-header-text/70" />
          <button
            type="button"
            className="text-header-text"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-gold/20 bg-header-bg border-t lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-gold/10 text-gold' : 'text-header-text/85',
                  )
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center justify-between px-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="text-header-text/80 flex items-center gap-2 text-sm"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              </button>
              <LinkButton to="/booking" variant="gold" size="sm" onClick={() => setOpen(false)}>
                {t('nav.bookNow')}
              </LinkButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
