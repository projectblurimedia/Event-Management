import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { GuestCountPrompt } from '../parts/GuestCountPrompt';
import { CategoryItemPanel } from '../parts/CategoryItemPanel';
import { packageHooks, categoryHooks } from '@/lib/api/resources';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

function FixedPackageFlow({ packageId }: { packageId: string }) {
  const { t, tf } = useTranslation();
  const { data: packages, isLoading, isError, refetch } = packageHooks.usePublicList();
  const pkg = packages?.find((p) => p.id === packageId);
  const configureCategoryIndex = useBookingCartStore((s) => s.configureCategoryIndex);
  const nextConfigureCategory = useBookingCartStore((s) => s.nextConfigureCategory);
  const prevConfigureCategory = useBookingCartStore((s) => s.prevConfigureCategory);
  const selectedItems = useBookingCartStore((s) => s.selectedItems);
  const goToStep = useBookingCartStore((s) => s.goToStep);

  if (isLoading || isError || !pkg) {
    return (
      <AsyncState
        isLoading={isLoading}
        isError={isError || !pkg}
        onRetry={refetch}
        loadingLabel="Loading package…"
        errorLabel="Couldn't load this package. Please check your connection and try again."
        minHeight="min-h-[20vh]"
      >
        <span />
      </AsyncState>
    );
  }

  const bulletins = pkg.categories;
  const total = bulletins.length;
  const current = bulletins[configureCategoryIndex];

  if (!current) {
    goToStep('REVIEW');
    return null;
  }

  const hasSelectionForStep = selectedItems.some((i) => i.categoryId === current.categoryId);
  const isLast = configureCategoryIndex === total - 1;

  function handleNext() {
    if (isLast) {
      goToStep('REVIEW');
    } else {
      nextConfigureCategory();
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <span className="text-gold text-sm font-semibold tracking-widest uppercase">
          {t('wizard.section')} {configureCategoryIndex + 1} {t('wizard.of')} {total}
        </span>
        <h2 className="mt-1 text-xl font-semibold">{tf(current.category.name, current.category.nameTe)}</h2>
      </div>

      <CategoryItemPanel key={current.category.id} category={current.category} />

      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={prevConfigureCategory} disabled={configureCategoryIndex === 0}>
          {t('common.back')}
        </Button>
        <div className="flex items-center gap-4">
          {!hasSelectionForStep && (
            <button type="button" onClick={handleNext} className="text-text-muted text-sm underline">
              {t('wizard.skipSection')}
            </button>
          )}
          <Button variant="primary" onClick={handleNext} disabled={!hasSelectionForStep}>
            {t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CustomPackageFlow() {
  const { t, tf } = useTranslation();
  const { data: categories, isLoading, isError, refetch } = categoryHooks.usePublicList();
  const selectedItems = useBookingCartStore((s) => s.selectedItems);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sortedCategories = useMemo(() => [...(categories ?? [])].sort((a, b) => a.order - b.order), [categories]);

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">{t('wizard.buildOwnPackage')}</h2>
        <p className="text-text-muted mt-1 text-sm">{t('wizard.buildOwnPackageDesc')}</p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingLabel="Loading categories…"
        errorLabel="Couldn't load categories. Please check your connection and try again."
        minHeight="min-h-[15vh]"
        compact
      >
        <div className="flex flex-col gap-3">
          {sortedCategories.map((cat) => {
            const count = selectedItems.filter((i) => i.categoryId === cat.id).length;
            return (
              <div key={cat.id} className="border-border bg-surface rounded-2xl border">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {tf(cat.name, cat.nameTe)}
                    {count > 0 && (
                      <span className="bg-gold text-ink-black rounded-full px-2 py-0.5 text-[11px]">
                        {count} {t('wizard.itemsSelected')}
                      </span>
                    )}
                  </span>
                  {expanded === cat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expanded === cat.id && (
                  <div className={cn('border-border border-t p-5')}>
                    <CategoryItemPanel category={cat} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AsyncState>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" size="lg" onClick={() => goToStep('REVIEW')}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}

export function ConfigurePackageStep() {
  const packageId = useBookingCartStore((s) => s.packageId);
  const isCustom = useBookingCartStore((s) => s.isCustom);
  const guestCount = useBookingCartStore((s) => s.guestCount);

  if (!guestCount) return <GuestCountPrompt />;

  if (isCustom) return <CustomPackageFlow />;
  if (packageId) return <FixedPackageFlow packageId={packageId} />;

  return null;
}
