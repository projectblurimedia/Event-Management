import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, Eye, MessageCircle, Phone, RefreshCw, Search } from 'lucide-react';
import { useAdminBookings, downloadBookingsExport } from '@/lib/api/bookings';
import { callHref, whatsappHref } from '@/lib/contactActions';
import { BookingDetailModal } from '@/features/admin/BookingDetailModal';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { statusLabelKeys } from '@/lib/i18n/statusLabels';
import { cn } from '@/lib/cn';
import type { Booking, BookingStatus } from '@/types/api';

const statusOptions: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

function todayRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { from: `${y}-${m}-${d}T00:00:00`, to: `${y}-${m}-${d}T23:59:59` };
}

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-rose/10 text-rose',
  COMPLETED: 'bg-gold/10 text-gold',
};

function ContactButtons({ booking, onView }: { booking: Booking; onView: () => void }) {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <a
        href={callHref(booking.phone)}
        aria-label={`Call ${booking.customerName}`}
        className="border-gold text-gold flex h-9 w-9 items-center justify-center rounded-full border hover:bg-gold hover:text-ink-black"
      >
        <Phone size={15} />
      </a>
      <a
        href={whatsappHref(booking.phone, `Hi ${booking.customerName}, this is regarding your booking ${booking.bookingCode}.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${booking.customerName}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white hover:brightness-95"
      >
        <MessageCircle size={15} />
      </a>
      <button
        type="button"
        onClick={onView}
        aria-label="View details"
        className="border-border text-text-muted flex h-9 w-9 items-center justify-center rounded-full border hover:border-gold hover:text-gold"
      >
        <Eye size={15} />
      </button>
    </div>
  );
}

function isBookingStatus(value: string | null): value is BookingStatus {
  return !!value && (statusOptions as string[]).includes(value);
}

export function AdminBookingsPage() {
  const { t, tf } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  const isToday = searchParams.get('date') === 'today';
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(
    isBookingStatus(initialStatus) ? initialStatus : undefined,
  );
  const [search, setSearch] = useState('');
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const dateRange = isToday ? todayRange() : undefined;
  const { data: bookings, isLoading, isError, refetch } = useAdminBookings({
    status: statusFilter,
    from: dateRange?.from,
    to: dateRange?.to,
  });

  function changeStatusFilter(status: BookingStatus | undefined) {
    setStatusFilter(status);
    // Any manual status click overrides an incoming "today" deep link so the
    // two filters don't silently stack in a way the pill buttons can't show.
    if (searchParams.get('date')) setSearchParams({}, { replace: true });
  }

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.bookingCode.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q),
    );
  }, [bookings, search]);

  async function handleExport(type: 'xlsx' | 'pdf') {
    try {
      await downloadBookingsExport(type, { status: statusFilter, from: dateRange?.from, to: dateRange?.to });
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.bookings.exportFailed')));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('admin.bookings.title')}</h1>
          <p className="text-text-muted mt-1 text-base">{t('admin.bookings.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            className="border-border hover:border-gold flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium"
          >
            <Download size={15} /> {t('admin.bookings.excel')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="border-border hover:border-gold flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium"
          >
            <Download size={15} /> {t('admin.bookings.pdf')}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="text-text-muted absolute top-1/2 left-3.5 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.bookings.searchPlaceholder')}
            className="border-border bg-surface w-full rounded-lg border py-2.5 pr-3 pl-10 text-base outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => changeStatusFilter(undefined)}
          className={cn(
            'rounded-full border px-4 py-2 text-sm font-medium',
            !statusFilter && !isToday ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
          )}
        >
          {t('common.all')}
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatusFilter(s)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium',
              statusFilter === s ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
            )}
          >
            {t(statusLabelKeys[s])}
          </button>
        ))}
        {isToday && (
          <span className="bg-gold/15 text-gold rounded-full px-4 py-2 text-sm font-medium">
            {t('admin.bookings.todayFilter')}
          </span>
        )}
      </div>

      {/* Mobile / tablet: card list */}
      <div className="mt-5 flex flex-col gap-3 lg:hidden">
        {isLoading && <p className="text-text-muted py-10 text-center text-base">{t('common.loading')}</p>}
        {isError && (
          <div className="border-border bg-surface rounded-2xl border p-6 text-center">
            <p className="text-rose text-base">{t('admin.bookings.couldNotLoad')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
            >
              <RefreshCw size={14} /> {t('common.tryAgain')}
            </button>
          </div>
        )}
        {!isLoading && !isError && filteredBookings.length === 0 && (
          <div className="border-border bg-surface text-text-muted rounded-2xl border p-10 text-center text-base">
            {t('admin.bookings.noBookingsFound')}
          </div>
        )}
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            onClick={() => setActiveBookingId(b.id)}
            className="border-border bg-surface cursor-pointer rounded-2xl border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-gold/10 text-gold font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {b.customerName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-base font-semibold">{b.customerName}</p>
                  <p className="text-text-muted text-sm">{b.phone}</p>
                </div>
              </div>
              <span className={cn('shrink-0 rounded-full px-3 py-1 text-sm font-semibold', statusStyles[b.status])}>
                {t(statusLabelKeys[b.status])}
              </span>
            </div>

            <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
              <div>
                <p className="text-text-muted">{t('admin.bookings.bookingId')}</p>
                <p className="font-medium">{b.bookingCode}</p>
              </div>
              <div>
                <p className="text-text-muted">{t('admin.bookings.event')}</p>
                <p className="font-medium">{tf(b.eventType.name, b.eventType.nameTe)}</p>
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

            <div className="border-border mt-4 flex justify-end border-t pt-4">
              <ContactButtons booking={b} onView={() => setActiveBookingId(b.id)} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="border-border bg-surface mt-5 hidden overflow-x-auto rounded-2xl border lg:block">
        <table className="w-full text-left text-base">
          <thead className="bg-surface-muted text-text-muted text-sm uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.bookingId')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.customer')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.event')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.date')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.guests')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.status')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.bookings.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-text-muted px-5 py-10 text-center">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center">
                  <p className="text-rose text-base">{t('admin.bookings.couldNotLoad')}</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
                  >
                    <RefreshCw size={14} /> {t('common.tryAgain')}
                  </button>
                </td>
              </tr>
            )}
            {!isLoading && !isError && filteredBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="text-text-muted px-5 py-10 text-center">
                  {t('admin.bookings.noBookingsFound')}
                </td>
              </tr>
            )}
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                onClick={() => setActiveBookingId(b.id)}
                className="border-border hover:bg-surface-muted cursor-pointer border-t transition-colors"
              >
                <td className="px-5 py-3.5 font-medium">{b.bookingCode}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-gold/10 text-gold font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      {b.customerName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      {b.customerName}
                      <div className="text-text-muted text-sm">{b.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">{tf(b.eventType.name, b.eventType.nameTe)}</td>
                <td className="px-5 py-3.5">{new Date(b.eventDate).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3.5">{b.guestCount}</td>
                <td className="px-5 py-3.5">
                  <span className={cn('rounded-full px-2.5 py-1 text-sm font-semibold', statusStyles[b.status])}>
                    {t(statusLabelKeys[b.status])}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <ContactButtons booking={b} onView={() => setActiveBookingId(b.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookingDetailModal bookingId={activeBookingId} onClose={() => setActiveBookingId(null)} />
    </div>
  );
}
