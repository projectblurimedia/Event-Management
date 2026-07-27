import { Helmet } from 'react-helmet-async';
import {
  Baby,
  Briefcase,
  Cake,
  Gem,
  Gift,
  Heart,
  Home as HomeIcon,
  PartyPopper,
  Sparkle,
  Users,
} from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { LinkButton } from '@/components/ui/Button';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { EventType } from '@/types/api';

const eventTypes: { type: EventType; labelKey: TranslationKey; icon: typeof Heart; descKey: TranslationKey }[] = [
  { type: 'WEDDING', labelKey: 'eventType.wedding', icon: Heart, descKey: 'eventType.wedding.desc' },
  { type: 'RECEPTION', labelKey: 'eventType.reception', icon: PartyPopper, descKey: 'eventType.reception.desc' },
  { type: 'BIRTHDAY', labelKey: 'eventType.birthday', icon: Cake, descKey: 'eventType.birthday.desc' },
  { type: 'HOUSEWARMING', labelKey: 'eventType.housewarming', icon: HomeIcon, descKey: 'eventType.housewarming.desc' },
  { type: 'ENGAGEMENT', labelKey: 'eventType.engagement', icon: Gem, descKey: 'eventType.engagement.desc' },
  { type: 'CORPORATE', labelKey: 'eventType.corporate', icon: Briefcase, descKey: 'eventType.corporate.desc' },
  { type: 'ANNIVERSARY', labelKey: 'eventType.anniversary', icon: Sparkle, descKey: 'eventType.anniversary.desc' },
  { type: 'NAMING_CEREMONY', labelKey: 'eventType.namingCeremony', icon: Users, descKey: 'eventType.namingCeremony.desc' },
  { type: 'BABY_SHOWER', labelKey: 'eventType.babyShower', icon: Baby, descKey: 'eventType.babyShower.desc' },
  { type: 'OTHER', labelKey: 'eventType.other', icon: Gift, descKey: 'eventType.other.desc' },
];

export function EventTypesPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Event Types | {siteConfig.businessName}</title>
      </Helmet>
      <PageHero
        eyebrow={t('page.eventTypes.eyebrow')}
        title={t('page.eventTypes.title')}
        description={t('page.eventTypes.description')}
      />

      <Container className="py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map(({ type, labelKey, icon: Icon, descKey }) => (
            <div key={type} className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
              <span className="bg-gold/10 text-gold flex h-11 w-11 items-center justify-center rounded-full">
                <Icon size={20} />
              </span>
              <h3 className="text-sm font-semibold">{t(labelKey)}</h3>
              <p className="text-text-muted text-sm">{t(descKey)}</p>
              <LinkButton
                to={`/booking?eventType=${type}`}
                variant="outline"
                size="sm"
                className="mt-auto w-fit"
              >
                {t('eventTypes.planThisEvent')}
              </LinkButton>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
