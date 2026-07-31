import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Download, MessageCircle, Phone, RefreshCw, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAdminBooking, useUpdateBookingStatus, quotationDownloadUrl } from '@/lib/api/bookings';
import { useSettings } from '@/lib/api/settings';
import { callHref, whatsappHref } from '@/lib/contactActions';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { eventTypeLabelKeys } from '@/lib/i18n/eventTypeLabels';
import { statusLabelKeys } from '@/lib/i18n/statusLabels';
import { cn } from '@/lib/cn';
import type { BookingStatus } from '@/types/api';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-rose/10 text-rose',
  COMPLETED: 'bg-gold/10 text-gold',
};

interface BookingDetailModalProps {
  bookingId: string | null;
  onClose: () => void;
}

export function BookingDetailModal({ bookingId, onClose }: BookingDetailModalProps) {
  const { t, tf } = useTranslation();
  const { data: booking, isLoading, isError, refetch } = useAdminBooking(bookingId ?? undefined);
  const { data: settings } = useSettings();
  const updateStatus = useUpdateBookingStatus();

  const groupedItems = useMemo(() => {
    if (!booking) return [];
    const groups = new Map<string, { name: string; nameTe: string | null }[]>();
    for (const sel of booking.items) {
      const category = sel.item.categoryType?.category;
      const categoryName = category ? tf(category.name, category.nameTe) : '—';
      const list = groups.get(categoryName) ?? [];
      list.push({ name: sel.item.name, nameTe: sel.item.nameTe });
      groups.set(categoryName, list);
    }
    return Array.from(groups.entries());
  }, [booking, tf]);

  function changeStatus(status: BookingStatus) {
    if (!booking) return;
    updateStatus.mutate(
      { id: booking.id, status },
      {
        onSuccess: () => toast.success(`${t(statusLabelKeys[status])} — ${t('admin.bookingDetail.statusUpdated')}`),
        onError: (error) => toast.error(getErrorMessage(error, t('admin.bookingDetail.statusUpdateFailed'))),
      },
    );
  }

  return (
    <Modal open={!!bookingId} onClose={onClose} title={t('admin.bookingDetail.title')} size="lg">
      {isLoading && <p className="text-text-muted py-10 text-center text-sm">{t('admin.bookingDetail.loading')}</p>}

      {isError && (
        <div className="py-10 text-center">
          <p className="text-rose text-sm">{t('admin.bookingDetail.couldNotLoad')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-gold hover:text-ink-black"
          >
            <RefreshCw size={13} /> {t('common.tryAgain')}
          </button>
        </div>
      )}

      {booking && (
        <div className="flex flex-col gap-6">
          {/* Header: code, status, quick actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-text-muted text-xs">{t('admin.bookings.bookingId')}</p>
              <p className="font-semibold">{booking.bookingCode}</p>
            </div>
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusStyles[booking.status])}>
              {t(statusLabelKeys[booking.status])}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={callHref(booking.phone)}
              className="border-gold text-gold flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:bg-gold hover:text-ink-black"
            >
              <Phone size={14} /> {t('admin.bookingDetail.call')} {booking.customerName.split(' ')[0]}
            </a>
            <a
              href={whatsappHref(
                booking.phone,
                `Hi ${booking.customerName}, this is regarding your booking ${booking.bookingCode}${settings?.businessName ? ` with ${settings.businessName}` : ''}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white hover:brightness-95"
            >
              <MessageCircle size={14} /> {t('admin.bookingDetail.whatsapp')}
            </a>
            <a
              href={quotationDownloadUrl(booking.id, booking.phone)}
              className="border-border text-text-muted flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:border-gold hover:text-gold"
            >
              <Download size={14} /> {t('admin.bookingDetail.quotationPdf')}
            </a>
          </div>

          {/* Customer + Event info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border bg-surface-muted rounded-xl border p-4">
              <h3 className="text-text-muted mb-2 text-sm font-semibold tracking-wide uppercase">{t('admin.bookingDetail.customer')}</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.name')}</dt>
                  <dd>{booking.customerName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.phone')}</dt>
                  <dd>{booking.phone}</dd>
                </div>
                {booking.altPhone && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t('admin.bookingDetail.altPhone')}</dt>
                    <dd>{booking.altPhone}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.email')}</dt>
                  <dd className="truncate">{booking.email ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.address')}</dt>
                  <dd className="text-right">{booking.address}</dd>
                </div>
              </dl>
            </div>

            <div className="border-border bg-surface-muted rounded-xl border p-4">
              <h3 className="text-text-muted mb-2 text-sm font-semibold tracking-wide uppercase">{t('admin.bookingDetail.event')}</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.type')}</dt>
                  <dd>{t(eventTypeLabelKeys[booking.eventType])}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.dateTime')}</dt>
                  <dd>
                    {new Date(booking.eventDate).toLocaleDateString('en-IN')} at {booking.eventTime}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.guests')}</dt>
                  <dd>{booking.guestCount}</dd>
                </div>
                {booking.dietaryPreference && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t('admin.bookingDetail.dietary')}</dt>
                    <dd>{booking.dietaryPreference.replace('_', '-')}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t('admin.bookingDetail.package')}</dt>
                  <dd>{booking.package ? tf(booking.package.name, booking.package.nameTe) : t('admin.bookingDetail.customNone')}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Selections grouped by category */}
          {groupedItems.map(([categoryName, items]) => (
            <div key={categoryName}>
              <h3 className="text-text-muted mb-2 text-sm font-semibold tracking-wide uppercase">{categoryName}</h3>
              <ul className="border-border divide-border divide-y rounded-xl border text-sm">
                {items.map((item, i) => (
                  <li key={i} className="px-4 py-2.5">
                    {tf(item.name, item.nameTe)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {booking.specialRequirements && (
            <div>
              <h3 className="text-text-muted mb-2 text-sm font-semibold tracking-wide uppercase">
                {t('admin.bookingDetail.specialRequirements')}
              </h3>
              <p className="border-border bg-surface-muted rounded-xl border p-4 text-sm">
                {booking.specialRequirements}
              </p>
            </div>
          )}

          {/* Approve / Reject / status actions — only for bookings that aren't in a final state yet */}
          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {booking.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => changeStatus('CONFIRMED')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle2 size={14} /> {t('admin.bookingDetail.approve')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeStatus('CANCELLED')}
                  disabled={updateStatus.isPending}
                  className="border-rose text-rose hover:bg-rose hover:text-brand-white"
                >
                  <XCircle size={14} /> {t('admin.bookingDetail.reject')}
                </Button>
                {booking.status === 'CONFIRMED' && (
                  <Button variant="gold" size="sm" onClick={() => changeStatus('COMPLETED')} disabled={updateStatus.isPending}>
                    {t('admin.bookingDetail.markCompleted')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
