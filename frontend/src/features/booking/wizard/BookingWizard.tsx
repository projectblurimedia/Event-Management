import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useBookingCartStore, type WizardStep } from '@/store/bookingCartStore';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';

const VALID_STEPS: WizardStep[] = ['PACKAGE', 'CONFIGURE', 'REVIEW', 'DETAILS', 'CONFIRMATION'];

export function BookingWizard() {
  const step = useBookingCartStore((s) => s.step);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const reset = useBookingCartStore((s) => s.reset);
  const setCustomerField = useBookingCartStore((s) => s.setCustomerField);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cancelOpen, setCancelOpen] = useState(false);
  const { t } = useTranslation();
  // Prevents the two sync effects below from bouncing off each other.
  const syncingFromUrl = useRef(false);

  // Arriving from the public Event Types page ("Plan This Event") carries the
  // chosen event as ?eventType=. That's a fresh-intent signal — start a clean
  // wizard (discarding any stale package/items left in localStorage from a
  // previous unfinished booking) with just the event pre-filled, rather than
  // silently resuming whatever package happened to be selected before.
  useEffect(() => {
    const eventTypeParam = new URLSearchParams(window.location.search).get('eventType');
    if (!eventTypeParam) return;
    reset();
    setCustomerField('eventTypeId', eventTypeParam);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('eventType');
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wizard steps swap content in place rather than changing route, so by
  // default the browser Back button would just exit /booking entirely
  // instead of stepping back through the wizard. Mirror each step change
  // into the URL as a real history entry so Back behaves as expected.
  useEffect(() => {
    if (syncingFromUrl.current) {
      syncingFromUrl.current = false;
      return;
    }
    if (searchParams.get('step') === step) return;
    const next = new URLSearchParams(searchParams);
    next.set('step', step);
    setSearchParams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Fires on browser Back/Forward — the URL changes without goToStep() ever
  // being called, so sync the store to match what the user navigated to.
  useEffect(() => {
    const urlStep = searchParams.get('step') as WizardStep | null;
    if (!urlStep || !VALID_STEPS.includes(urlStep) || urlStep === step) return;
    syncingFromUrl.current = true;
    goToStep(urlStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Wizard steps swap content in place (no route change), so the browser
  // keeps whatever scroll position the user was at — which can land near
  // the bottom of a shorter new step. Scroll back to the top on every step
  // change so each screen starts where it loads. Deliberately excludes
  // expandedCategoryId — opening/closing an accordion section within the
  // same step shouldn't yank the page back to the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
