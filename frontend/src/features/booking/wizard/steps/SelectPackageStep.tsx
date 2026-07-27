import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { packageHooks } from '@/lib/api/resources';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { Button } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function SelectPackageStep() {
  const { t, tf } = useTranslation();
  const { data: packages, isLoading, isError, refetch } = packageHooks.usePublicList();
  const [searchParams] = useSearchParams();
  const packageId = useBookingCartStore((s) => s.packageId);
  const isCustom = useBookingCartStore((s) => s.isCustom);
  const selectPackage = useBookingCartStore((s) => s.selectPackage);
  const goToStep = useBookingCartStore((s) => s.goToStep);

  useEffect(() => {
    const tierParam = searchParams.get('package');
    if (tierParam && packages && !packageId && !isCustom) {
      const match = packages.find((p) => p.tier === tierParam.toUpperCase());
      if (match) selectPackage(match.id, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages]);

  const hasSelection = !!packageId || isCustom;

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold">{t('wizard.selectPackageTitle')}</h2>
        <p className="text-text-muted mt-2 text-sm">{t('wizard.selectPackageSubtitle')}</p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingLabel="Loading packages…"
        errorLabel="Couldn't load packages. Please check your connection and try again."
        minHeight="min-h-[20vh]"
      >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packages?.map((pkg) => {
          const selected = packageId === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => selectPackage(pkg.id, false)}
              className={cn(
                'border-border bg-surface flex flex-col overflow-hidden rounded-2xl border text-left transition-all',
                selected && 'border-gold ring-gold ring-2',
              )}
            >
              <ImageOrPlaceholder src={pkg.imageUrl} alt={pkg.name} className="h-36 w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{tf(pkg.name, pkg.nameTe)}</h3>
                  {selected && (
                    <span className="bg-gold text-ink-black flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-text-muted mt-1 text-sm">{tf(pkg.description, pkg.descriptionTe)}</p>
                <p className="text-gold mt-3 text-lg font-semibold">
                  ₹{Number(pkg.pricePerGuest).toLocaleString('en-IN')}
                  <span className="text-text-muted text-sm font-normal"> {t('wizard.perGuestShort')}</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  {pkg.items.slice(0, 4).map((item) => (
                    <li key={item.id} className="text-text-muted flex items-start gap-1.5 text-sm">
                      <Check size={12} className="text-gold mt-0.5 shrink-0" />
                      {tf(item.label, item.labelTe)}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => selectPackage(null, true)}
          className={cn(
            'border-border bg-surface flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-5 text-center transition-all',
            isCustom && 'border-gold ring-gold ring-2 border-solid',
          )}
        >
          <span className="bg-rose/10 text-rose flex h-11 w-11 items-center justify-center rounded-full">
            <Sparkles size={20} />
          </span>
          <h3 className="font-semibold">{t('wizard.customPackageTitle')}</h3>
          <p className="text-text-muted text-sm">{t('wizard.customPackageDesc')}</p>
          {isCustom && (
            <span className="bg-gold text-ink-black flex h-5 w-5 items-center justify-center rounded-full">
              <Check size={12} />
            </span>
          )}
        </button>
      </div>

      <div className="mt-10 flex justify-end">
        <Button variant="primary" size="lg" disabled={!hasSelection} onClick={() => goToStep('CONFIGURE')}>
          {t('common.next')}
        </Button>
      </div>
      </AsyncState>
    </div>
  );
}
