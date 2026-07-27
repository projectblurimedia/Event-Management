import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n/translations';

const quickLinks: { to: string; labelKey: TranslationKey }[] = [
  { to: '/services', labelKey: 'nav.services' },
  { to: '/packages', labelKey: 'nav.packages' },
  { to: '/menu', labelKey: 'nav.menu' },
  { to: '/gallery', labelKey: 'nav.gallery' },
];

const eventTypeLinks: { to: string; labelKey: TranslationKey }[] = [
  { to: '/event-types', labelKey: 'occasions.weddings' },
  { to: '/event-types', labelKey: 'occasions.birthdays' },
  { to: '/event-types', labelKey: 'occasions.housewarmings' },
  { to: '/event-types', labelKey: 'occasions.corporateEvents' },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-ink-black text-cream border-gold/20 border-t">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo className="text-cream" />
          <p className="text-cream/60 text-sm leading-relaxed">
            Premium wedding planning, catering &amp; event management for every celebration —
            weddings, birthdays, housewarmings, engagements and corporate events.
          </p>
        </div>

        <div>
          <h3 className="text-gold mb-4 text-sm font-semibold tracking-[0.2em] uppercase">
            {t('footer.quickLinks')}
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.labelKey}>
                <Link to={link.to} className="text-cream/70 hover:text-gold text-sm transition-colors">
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-gold mb-4 text-sm font-semibold tracking-[0.2em] uppercase">
            {t('footer.occasions')}
          </h3>
          <ul className="space-y-2.5">
            {eventTypeLinks.map((link, i) => (
              <li key={i}>
                <Link to={link.to} className="text-cream/70 hover:text-gold text-sm transition-colors">
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-gold mb-4 text-sm font-semibold tracking-[0.2em] uppercase">
            {t('footer.contact')}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={`tel:+91${siteConfig.phone}`}
                className="text-cream/70 hover:text-gold flex items-center gap-2.5 transition-colors"
              >
                <Phone size={16} className="text-gold shrink-0" /> {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-cream/70 hover:text-gold flex items-center gap-2.5 transition-colors"
              >
                <Mail size={16} className="text-gold shrink-0" /> {siteConfig.email}
              </a>
            </li>
            <li className="text-cream/70 flex items-start gap-2.5">
              <MapPin size={16} className="text-gold mt-0.5 shrink-0" /> {siteConfig.address}
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-gold/10 border-t py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs sm:flex-row">
          <p className="text-cream/50">
            &copy; {new Date().getFullYear()} {siteConfig.businessName}. {t('footer.rightsReserved')}
          </p>
          <Link to="/booking/status" className="text-cream/50 hover:text-gold transition-colors">
            {t('nav.checkStatus')}
          </Link>
        </Container>
      </div>
    </footer>
  );
}
