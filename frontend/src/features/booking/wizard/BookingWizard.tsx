import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { WizardProgress } from './WizardProgress';
import { SelectPackageStep } from './steps/SelectPackageStep';
import { ConfigurePackageStep } from './steps/ConfigurePackageStep';
import { ReviewStep } from './steps/ReviewStep';
import { CustomerDetailsStep } from './steps/CustomerDetailsStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';

export function BookingWizard() {
  const step = useBookingCartStore((s) => s.step);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const configureCategoryIndex = useBookingCartStore((s) => s.configureCategoryIndex);
  const reset = useBookingCartStore((s) => s.reset);
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const { t } = useTranslation();

  // Wizard steps swap content in place (no route change), so the browser
  // keeps whatever scroll position the user was at — which can land near
  // the bottom of a shorter new step. Scroll back to the top on every step
  // or Configure sub-section change so each screen starts where it loads.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, configureCategoryIndex]);

  function confirmCancel() {
    reset();
    setCancelOpen(false);
    navigate('/');
  }

  return (
    <>
      <Helmet>
        <title>Book Your Event | {siteConfig.businessName}</title>
      </Helmet>

      <section className="bg-[image:var(--gradient-luxury)] py-10">
        <Container>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <WizardProgress current={step} onNavigate={goToStep} />
            </div>
            {step !== 'CONFIRMATION' && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                aria-label="Cancel booking"
                className="border-cream/25 text-cream/80 hover:border-rose hover:bg-rose hover:text-brand-white flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full border transition-colors sm:h-auto sm:w-auto sm:rounded-full sm:px-4 sm:py-2 sm:text-xs sm:font-medium"
              >
                <X size={15} />
                <span className="hidden sm:inline">{t('wizard.cancelBooking')}</span>
              </button>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-12">
        {step === 'PACKAGE' && <SelectPackageStep />}
        {step === 'CONFIGURE' && <ConfigurePackageStep />}
        {step === 'REVIEW' && <ReviewStep />}
        {step === 'DETAILS' && <CustomerDetailsStep />}
        {step === 'CONFIRMATION' && <ConfirmationStep />}
      </Container>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this booking?">
        <p className="text-text-muted -mt-2 mb-6 text-sm">
          All your selections — package, food, services and details entered so far — will be lost.
          This can't be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCancelOpen(false)}>
            Keep Editing
          </Button>
          <Button variant="primary" onClick={confirmCancel}>
            Yes, Cancel Booking
          </Button>
        </div>
      </Modal>
    </>
  );
}
