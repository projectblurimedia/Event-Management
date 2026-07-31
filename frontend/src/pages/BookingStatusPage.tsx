import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useBookingLookup } from '@/lib/api/bookings';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { statusLabelKeys } from '@/lib/i18n/statusLabels';

const lookupSchema = z.object({
  code: z.string().min(1, 'Enter your Booking ID'),
  phone: z.string().min(6, 'Enter your phone number'),
});
type LookupForm = z.infer<typeof lookupSchema>;

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-600',
  CANCELLED: 'bg-rose/10 text-rose',
  COMPLETED: 'bg-gold/10 text-gold',
};

export function BookingStatusPage() {
  const { t } = useTranslation();
  const lookup = useBookingLookup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupForm>({ resolver: zodResolver(lookupSchema) });

  function onSubmit(values: LookupForm) {
    lookup.mutate(values);
  }

  return (
    <>
      <Helmet>
        <title>Check Booking Status | {siteConfig.businessName}</title>
      </Helmet>
      <PageHero
        eyebrow={t('page.bookingStatus.eyebrow')}
        title={t('page.bookingStatus.title')}
        description={t('page.bookingStatus.description')}
      />

      <Container className="py-16">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-border bg-surface mx-auto flex max-w-md flex-col gap-4 rounded-2xl border p-8"
        >
          <div>
            <label htmlFor="code" className="text-text-muted mb-1.5 block text-sm font-medium">{t('bookingStatus.bookingId')}</label>
            <input
              id="code"
              placeholder="MSWP-2026-1234"
              className="border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
              {...register('code')}
            />
            {errors.code && <p className="text-rose mt-1 text-sm">{errors.code.message}</p>}
          </div>
          <div>
            <label htmlFor="lookup-phone" className="text-text-muted mb-1.5 block text-sm font-medium">{t('bookingStatus.phoneNumber')}</label>
            <input
              id="lookup-phone"
              placeholder="The mobile number used when booking"
              className="border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
              {...register('phone')}
            />
            {errors.phone && <p className="text-rose mt-1 text-sm">{errors.phone.message}</p>}
          </div>
          <Button type="submit" variant="primary" disabled={lookup.isPending}>
            {lookup.isPending ? t('bookingStatus.checking') : t('bookingStatus.checkStatus')}
          </Button>

          {lookup.isError && (
            <p className="text-rose text-center text-sm">
              {getErrorMessage(lookup.error, t('errors.bookingLookupFailed'))}
            </p>
          )}

          {lookup.data && (
            <div className="border-border mt-2 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">{t('bookingStatus.bookingId')}</span>
                <span className="font-semibold">{lookup.data.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{t('bookingStatus.status')}</span>
                <span
                  className={cn('rounded-full px-3 py-1 text-sm font-semibold', statusStyles[lookup.data.status])}
                >
                  {t(statusLabelKeys[lookup.data.status])}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{t('bookingStatus.eventDate')}</span>
                <span>{new Date(lookup.data.eventDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{t('bookingStatus.guests')}</span>
                <span>{lookup.data.guestCount}</span>
              </div>
            </div>
          )}
        </form>
      </Container>
    </>
  );
}
