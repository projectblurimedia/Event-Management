import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Clock3, RefreshCw, TrendingUp, XCircle } from 'lucide-react';
import { useDashboardOverview } from '@/lib/api/dashboard';
import { useAuthStore } from '@/store/authStore';
import { AdminAnalyticsSection } from '@/features/admin/AdminAnalyticsSection';
import { useTranslation } from '@/hooks/useTranslation';
import { eventTypeLabelKeys } from '@/lib/i18n/eventTypeLabels';
import { cn } from '@/lib/cn';
import type { TranslationKey } from '@/lib/i18n/translations';

const statCardStyles = {
  neutral: { icon: 'bg-gold/10 text-gold' },
  amber: { icon: 'bg-amber-500/10 text-amber-600' },
  emerald: { icon: 'bg-emerald-500/10 text-emerald-600' },
  rose: { icon: 'bg-rose/10 text-rose' },
  gold: { icon: 'bg-gold/10 text-gold' },
} as const;

export function AdminOverviewPage() {
  const { t, tf, language } = useTranslation();
  const { data, isLoading, isError, refetch } = useDashboardOverview();
  const admin = useAuthStore((s) => s.admin);

  const stats: {
    labelKey: TranslationKey;
    value: number | undefined;
    icon: typeof CalendarClock;
    tone: keyof typeof statCardStyles;
    to: string;
  }[] = [
    { labelKey: 'admin.overview.todayBookings', value: data?.todayBookings, icon: CalendarClock, tone: 'neutral', to: '/admin/bookings?date=today' },
    { labelKey: 'admin.overview.pendingBookings', value: data?.pendingBookings, icon: Clock3, tone: 'amber', to: '/admin/bookings?status=PENDING' },
    { labelKey: 'admin.overview.confirmedBookings', value: data?.confirmedBookings, icon: CheckCircle2, tone: 'emerald', to: '/admin/bookings?status=CONFIRMED' },
    { labelKey: 'admin.overview.cancelledBookings', value: data?.cancelledBookings, icon: XCircle, tone: 'rose', to: '/admin/bookings?status=CANCELLED' },
    { labelKey: 'admin.overview.completedEvents', value: data?.completedEvents, icon: TrendingUp, tone: 'gold', to: '/admin/bookings?status=COMPLETED' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {t('admin.welcomeBack')}
        {admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-text-muted mt-1 text-base">
        {new Date().toLocaleDateString(language === 'te' ? 'te-IN' : 'en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        {' · '}
        {t('admin.overview.subtitle')}
      </p>

      {isError && (
        <div className="border-rose/30 bg-rose/5 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
          <p className="text-rose text-base">{t('admin.overview.couldNotLoad')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="border-gold text-gold inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
          >
            <RefreshCw size={14} /> {t('common.tryAgain')}
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({ labelKey, value, icon: Icon, tone, to }) => (
          <Link
            key={labelKey}
            to={to}
            className="border-border bg-surface hover:border-gold hover:shadow-gold/10 rounded-2xl border p-5 transition-all hover:shadow-lg"
          >
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', statCardStyles[tone].icon)}>
              <Icon size={18} />
            </span>
            <p className="mt-4 text-2xl font-semibold">{isLoading ? '—' : (value ?? 0)}</p>
            <p className="text-text-muted text-sm">{t(labelKey)}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border-border bg-surface rounded-2xl border p-5">
          <h2 className="text-base font-semibold">{t('admin.overview.recentCustomers')}</h2>
          {!data?.recentCustomers.length && (
            <div className="text-text-muted flex h-32 items-center justify-center text-base">{t('admin.overview.noDataYet')}</div>
          )}
          <ul className="divide-border mt-3 divide-y">
            {data?.recentCustomers.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-base">
                <div className="flex items-center gap-2.5">
                  <span className="bg-gold/10 text-gold font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {c.customerName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{c.customerName}</p>
                    <p className="text-text-muted text-sm">{c.phone}</p>
                  </div>
                </div>
                <span className="text-text-muted text-sm">{t(eventTypeLabelKeys[c.eventType])}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-border bg-surface rounded-2xl border p-5">
          <h2 className="text-base font-semibold">{t('admin.overview.popularPackagesFood')}</h2>
          {!data?.popularPackages.length && !data?.popularFoodItems.length && (
            <div className="text-text-muted flex h-32 items-center justify-center text-base">{t('admin.overview.noDataYet')}</div>
          )}
          <ul className="divide-border mt-3 divide-y">
            {data?.popularPackages.map(
              (p, i) =>
                p.package && (
                  <li key={i} className="flex items-center justify-between py-3 text-base">
                    <span>{tf(p.package.name, p.package.nameTe)}</span>
                    <span className="text-gold text-sm font-semibold">
                      {p.bookingCount} {t('admin.overview.bookingsSuffix')}
                    </span>
                  </li>
                ),
            )}
            {data?.popularFoodItems.map(
              (f, i) =>
                f.menuItem && (
                  <li key={i} className="flex items-center justify-between py-3 text-base">
                    <span>{tf(f.menuItem.name, f.menuItem.nameTe)}</span>
                    <span className="text-gold text-sm font-semibold">
                      {f.totalQuantity} {t('admin.overview.orderedSuffix')}
                    </span>
                  </li>
                ),
            )}
          </ul>
        </div>
      </div>

      <AdminAnalyticsSection />
    </div>
  );
}
