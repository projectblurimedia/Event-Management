import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { WizardStep } from '@/store/bookingCartStore';

const steps: { key: WizardStep; labelKey: TranslationKey }[] = [
  { key: 'PACKAGE', labelKey: 'wizard.selectPackage' },
  { key: 'CONFIGURE', labelKey: 'wizard.configurePackage' },
  { key: 'REVIEW', labelKey: 'wizard.reviewSelection' },
  { key: 'DETAILS', labelKey: 'wizard.customerDetails' },
  { key: 'CONFIRMATION', labelKey: 'wizard.confirmation' },
];

interface WizardProgressProps {
  current: WizardStep;
  onNavigate: (step: WizardStep) => void;
}

export function WizardProgress({ current, onNavigate }: WizardProgressProps) {
  const { t } = useTranslation();
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <ol className="mx-auto flex w-full max-w-3xl items-start justify-between gap-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = isCompleted;

        return (
          <li key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              {index > 0 && (
                <span
                  aria-hidden
                  className={cn('h-px flex-1', index <= currentIndex ? 'bg-gold' : 'bg-border')}
                />
              )}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onNavigate(step.key)}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  isCurrent && 'border-gold bg-gold text-ink-black',
                  isCompleted && 'border-gold bg-gold/15 text-gold cursor-pointer',
                  !isCurrent && !isCompleted && 'border-border text-text-muted',
                )}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </button>
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn('h-px flex-1', index < currentIndex ? 'bg-gold' : 'bg-border')}
                />
              )}
            </div>
            <span
              className={cn(
                'hidden text-[11px] font-medium sm:block',
                isCurrent ? 'text-gold' : 'text-text-muted',
              )}
            >
              {t(step.labelKey)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
