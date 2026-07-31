import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { useDashboardAnalytics } from '@/lib/api/dashboard';
import { callHref, whatsappHref } from '@/lib/contactActions';
import { useTranslation } from '@/hooks/useTranslation';
import { eventTypeLabelKeys } from '@/lib/i18n/eventTypeLabels';
import { statusLabelKeys } from '@/lib/i18n/statusLabels';
import { cn } from '@/lib/cn';
import type { BookingStatus } from '@/types/api';

type Mode = 'day' | 'month' | 'year';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-rose/10 text-rose',
  COMPLETED: 'bg-gold/10 text-gold',
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function todayValue(mode: Mode) {
  const now = new Date();
  if (mode === 'day') return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (mode === 'month') return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  return String(now.getFullYear());
}

function getRange(mode: Mode, value: string) {
  if (mode === 'day') return { from: `${value}T00:00:00`, to: `${value}T23:59:59` };
  if (mode === 'month') {
    const [y, m] = value.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return { from: `${value}-01T00:00:00`, to: `${value}-${pad(lastDay)}T23:59:59` };
  }
  return { from: `${value}-01-01T00:00:00`, to: `${value}-12-31T23:59:59` };
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function yearOptions() {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= 2000; y--) years.push(y);
  return years;
}

/** Native <select> popups can't be height-limited by CSS — use a small
 * scrollable listbox instead so the year list (2000..current) stays compact. */
function YearDropdown({ value, onChange }: { value: string | number; onChange: (year: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border-border bg-bg flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm outline-none"
      >
        {value}
        <ChevronDown size={14} className="text-text-muted" />
      </button>
      {open && (
        <div className="border-border bg-surface absolute top-full left-0 z-20 mt-1 max-h-48 w-24 overflow-y-auto rounded-lg border shadow-lg">
          {yearOptions().map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                onChange(String(y));
                setOpen(false);
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm',
                String(y) === String(value) ? 'bg-gold/15 text-gold font-semibold' : 'hover:bg-surface-muted',
              )}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminAnalyticsSection() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('day');
  const [value, setValue] = useState(() => todayValue('day'));

  function changeMode(next: Mode) {
    setMode(next);
    setValue(todayValue(next));
  }

  const { from, to } = useMemo(() => getRange(mode, value), [mode, value]);
  const { data, isLoading, isError, refetch } = useDashboardAnalytics(from, to);

  const periodLabel =
    mode === 'day'
      ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : mode === 'month'
        ? new Date(`${value}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : value;

  const modeLabels: Record<Mode, string> = {
    day: t('admin.analytics.day'),
    month: t('admin.analytics.month'),
    year: t('admin.analytics.year'),
  };

  return (
    <div className="border-border bg-surface mt-6 rounded-2xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{t('admin.analytics.title')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-border flex overflow-hidden rounded-lg border">
            {(['day', 'month', 'year'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => changeMode(m)}
                className={cn(
                  'px-3.5 py-2 text-sm font-medium',
                  mode === m ? 'bg-gold text-ink-black' : 'text-text-muted hover:bg-surface-muted',
                )}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>
          {mode === 'day' && (
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border-border bg-bg rounded-lg border px-3 py-2 text-sm outline-none"
            />
          )}
          {mode === 'month' && (
            <>
              <select
                value={Number(value.split('-')[1])}
                onChange={(e) => setValue(`${value.split('-')[0]}-${pad(Number(e.target.value))}`)}
                className="border-border bg-bg rounded-lg border px-3 py-2 text-sm outline-none"
              >
                {monthNames.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <YearDropdown
                value={value.split('-')[0]}
                onChange={(year) => setValue(`${year}-${value.split('-')[1]}`)}
              />
            </>
          )}
          {mode === 'year' && <YearDropdown value={value} onChange={setValue} />}
          <button type="button" onClick={() => changeMode('day')} className="text-gold text-sm font-semibold underline">
            {t('admin.analytics.today')}
          </button>
        </div>
      </div>

      <p className="text-text-muted mt-1.5 text-sm">
        {t('admin.analytics.showingResultsFor')} {periodLabel}
      </p>

      {isLoading && <p className="text-text-muted mt-6 text-base">{t('common.loading')}</p>}
      {isError && (
        <div className="mt-6 text-center">
          <p className="text-rose text-base">{t('admin.analytics.couldNotLoad')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
          >
            <RefreshCw size={14} /> {t('common.tryAgain')}
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="border-border bg-surface-muted rounded-xl border p-4">
              <p className="text-text-muted text-sm">{t('admin.analytics.completedEventsSuffix')}</p>
              <p className="text-gold mt-1 text-2xl font-semibold">{data.byStatus.COMPLETED}</p>
            </div>
            <div className="border-border bg-surface-muted rounded-xl border p-4">
              <p className="text-text-muted text-sm">{t('admin.analytics.confirmedEventsSuffix')}</p>
              <p className="mt-1 text-2xl font-semibold">{data.byStatus.CONFIRMED}</p>
            </div>
            <div className="border-border bg-surface-muted rounded-xl border p-4">
              <p className="text-text-muted text-sm">{t('admin.analytics.totalBookingsInPeriod')}</p>
              <p className="mt-1 text-2xl font-semibold">{data.totalBookings}</p>
              <p className="text-text-muted mt-0.5 text-sm">
                {data.byStatus.PENDING} {t('admin.analytics.pendingSuffix')} · {data.byStatus.CANCELLED}{' '}
                {t('admin.analytics.cancelledSuffix')}
              </p>
            </div>
          </div>

          {/* Mobile / tablet: card list */}
          <div className="mt-5 flex flex-col gap-3 lg:hidden">
            {data.bookings.length === 0 && (
              <div className="border-border bg-surface-muted text-text-muted rounded-xl border p-8 text-center text-base">
                {t('admin.analytics.noBookingsInPeriod')}
              </div>
            )}
            {data.bookings.map((b) => (
              <div key={b.id} className="border-border bg-surface-muted rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{b.customerName}</p>
                    <p className="text-text-muted text-sm">{b.phone}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold', statusStyles[b.status])}>
                    {t(statusLabelKeys[b.status])}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-text-muted">{t('admin.bookings.event')}</p>
                    <p className="font-medium">{t(eventTypeLabelKeys[b.eventType])}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('admin.bookings.date')}</p>
                    <p className="font-medium">{new Date(b.eventDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('admin.bookings.guests')}</p>
                    <p className="font-medium">{b.guestCount}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-dashed pt-3">
                  <a
                    href={callHref(b.phone)}
                    aria-label={`Call ${b.customerName}`}
                    className="border-gold text-gold flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gold hover:text-ink-black"
                  >
                    <Phone size={13} />
                  </a>
                  <a
                    href={whatsappHref(b.phone, `Hi ${b.customerName}, this is regarding your booking ${b.bookingCode}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp ${b.customerName}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white hover:brightness-95"
                  >
                    <MessageCircle size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="border-border mt-5 hidden overflow-x-auto rounded-xl border lg:block">
            <table className="w-full text-left text-base">
              <thead className="bg-surface-muted text-text-muted text-sm uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('admin.bookings.customer')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('admin.bookings.event')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('admin.bookings.date')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('admin.bookings.guests')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('admin.bookings.status')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('admin.analytics.contact')}</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-text-muted px-4 py-8 text-center">
                      {t('admin.analytics.noBookingsInPeriod')}
                    </td>
                  </tr>
                )}
                {data.bookings.map((b) => (
                  <tr key={b.id} className="border-border border-t">
                    <td className="px-4 py-3">
                      {b.customerName}
                      <div className="text-text-muted text-sm">{b.phone}</div>
                    </td>
                    <td className="px-4 py-3">{t(eventTypeLabelKeys[b.eventType])}</td>
                    <td className="px-4 py-3">{new Date(b.eventDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">{b.guestCount}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-1 text-sm font-semibold', statusStyles[b.status])}>
                        {t(statusLabelKeys[b.status])}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={callHref(b.phone)}
                          aria-label={`Call ${b.customerName}`}
                          className="border-gold text-gold flex h-7 w-7 items-center justify-center rounded-full border hover:bg-gold hover:text-ink-black"
                        >
                          <Phone size={12} />
                        </a>
                        <a
                          href={whatsappHref(b.phone, `Hi ${b.customerName}, this is regarding your booking ${b.bookingCode}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${b.customerName}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white hover:brightness-95"
                        >
                          <MessageCircle size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
