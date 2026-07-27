import { Link } from 'react-router-dom';
import { CheckCircle2, Download } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { quotationDownloadUrl } from '@/lib/api/bookings';
import { useTranslation } from '@/hooks/useTranslation';

export function ConfirmationStep() {
  const { t } = useTranslation();
  const lastBooking = useBookingCartStore((s) => s.lastBooking);
  const reset = useBookingCartStore((s) => s.reset);

  if (!lastBooking) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-text-muted">{t('wizard.noBookingForSession')}</p>
        <LinkButton to="/booking" variant="primary" onClick={reset}>
          {t('wizard.startNewBooking')}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="bg-gold/10 text-gold flex h-16 w-16 items-center justify-center rounded-full">
        <CheckCircle2 size={32} />
      </span>
      <h2 className="text-2xl font-semibold sm:text-3xl">{t('wizard.bookingSuccessful')}</h2>
      <p className="text-text-muted max-w-md">
        {t('wizard.yourBookingReference')} <span className="text-gold font-semibold">{lastBooking.bookingCode}</span>.{' '}
        {t('wizard.saveBookingId')}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={quotationDownloadUrl(lastBooking.id, lastBooking.phone)}
          className="border-gold text-gold inline-flex h-11 items-center gap-2 rounded-full border px-6 text-sm font-medium hover:bg-gold hover:text-ink-black"
        >
          <Download size={16} /> {t('wizard.downloadPdf')}
        </a>
        <Link
          to="/"
          onClick={reset}
          className="bg-rose text-brand-white hover:bg-rose-deep inline-flex h-11 items-center rounded-full px-6 text-sm font-medium"
        >
          {t('wizard.returnHome')}
        </Link>
      </div>
    </div>
  );
}
