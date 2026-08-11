import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { EventTypePrompt } from '../parts/EventTypePrompt';
import { GuestCountPrompt } from '../parts/GuestCountPrompt';
import { CategoryItemPanel } from '../parts/CategoryItemPanel';
import { packageHooks, categoryHooks, categoryTypeHooks, itemHooks } from '@/lib/api/resources';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/api';

/** Expandable, one-section-at-a-time list of categories — used for both a
 * fixed package's bulletins and the freeform Custom Package flow, so the
 * layout (and mobile experience) is identical either way. */
function CategoryAccordion({ categories }: { categories: Category[] }) {
  const { t, tf } = useTranslation();
  const selectedItems = useBookingCartStore((s) => s.selectedItems);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const expandedCategoryId = useBookingCartStore((s) => s.expandedCategoryId);
  const setExpandedCategoryId = useBookingCartStore((s) => s.setExpandedCategoryId);

  return (
    <div>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const count = selectedItems.filter((i) => i.categoryId === cat.id).length;
          const isExpanded = expandedCategoryId === cat.id;
          return (
            <div key={cat.id} className="border-border bg-surface rounded-2xl border">
              <button
                type="button"
                onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
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
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isExpanded && (
                <div className="border-border border-t p-5">
                  <CategoryItemPanel category={cat} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" size="lg" onClick={() => goToStep('REVIEW')}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}

function FixedPackageFlow({ packageId }: { packageId: string }) {
  const { tf } = useTranslation();
  const { data: packages, isLoading, isError, refetch } = packageHooks.usePublicList();
  const pkg = packages?.find((p) => p.id === packageId);
  const sortedCategories = useMemo(
    () => (pkg ? [...pkg.categories].sort((a, b) => a.order - b.order).map((pc) => pc.category) : []),
    [pkg],
  );
  // Only Food and Decoration involve an actual choice — everything else
  // this package includes (Sound & Lighting, Event Manager, ...) is a
  // fixed one-per-tier inclusion with nothing to pick, so it doesn't get
  // its own accordion row; it's added to the cart automatically below.
  const selectableCategories = useMemo(
    () => sortedCategories.filter((c) => c.isFood || c.isDecoration),
    [sortedCategories],
  );
  const bundledCategories = useMemo(
    () => sortedCategories.filter((c) => !c.isFood && !c.isDecoration),
    [sortedCategories],
  );

  const { data: allTypes } = categoryTypeHooks.usePublicList();
  const { data: allItems } = itemHooks.usePublicList();
  const toggleItem = useBookingCartStore((s) => s.toggleItem);
  const setExpandedCategoryId = useBookingCartStore((s) => s.setExpandedCategoryId);

  // Food has by far the most to browse — open it by default instead of
  // making the customer expand it themselves on landing.
  useEffect(() => {
    if (selectableCategories.length === 0) return;
    const food = selectableCategories.find((c) => c.isFood);
    if (food && useBookingCartStore.getState().expandedCategoryId === null) setExpandedCategoryId(food.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectableCategories]);

  useEffect(() => {
    if (!allTypes || !allItems || bundledCategories.length === 0) return;
    const currentlySelected = useBookingCartStore.getState().selectedItems;
    for (const cat of bundledCategories) {
      const typeIds = new Set(allTypes.filter((ty) => ty.categoryId === cat.id).map((ty) => ty.id));
      const included = allItems.filter((i) => typeIds.has(i.categoryTypeId) && i.packageId === packageId);
      for (const item of included) {
        if (!currentlySelected.some((s) => s.categoryId === cat.id && s.itemId === item.id)) {
          toggleItem(cat.id, item.id, cat.allowMultiple);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTypes, allItems, bundledCategories, packageId]);

  return (
    <div>
      {pkg && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">{tf(pkg.name, pkg.nameTe)}</h2>
        </div>
      )}
      <AsyncState
        isLoading={isLoading}
        isError={isError || (!isLoading && !pkg)}
        onRetry={refetch}
        loadingLabel="Loading package…"
        errorLabel="Couldn't load this package. Please check your connection and try again."
        minHeight="min-h-[20vh]"
        compact
      >
        <CategoryAccordion categories={selectableCategories} />
      </AsyncState>
    </div>
  );
}

function CustomPackageFlow() {
  const { t } = useTranslation();
  const { data: categories, isLoading, isError, refetch } = categoryHooks.usePublicList();
  const sortedCategories = useMemo(() => [...(categories ?? [])].sort((a, b) => a.order - b.order), [categories]);
  const [searchParams, setSearchParams] = useSearchParams();
  const toggleItem = useBookingCartStore((s) => s.toggleItem);
  const selectedItems = useBookingCartStore((s) => s.selectedItems);
  const setExpandedCategoryId = useBookingCartStore((s) => s.setExpandedCategoryId);

  // Arriving from the public Decorations page's "Book This Decoration"
  // button carries ?decoration=<itemId> — add it to the cart and jump
  // straight to that section so the customer sees it already picked.
  useEffect(() => {
    const decorationId = searchParams.get('decoration');
    if (!decorationId || !categories) return;
    const decorationCategory = categories.find((c) => c.isDecoration);
    if (!decorationCategory) return;
    const alreadySelected = selectedItems.some((i) => i.itemId === decorationId);
    if (!alreadySelected) toggleItem(decorationCategory.id, decorationId, decorationCategory.allowMultiple);
    setExpandedCategoryId(decorationCategory.id);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('decoration');
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

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
        <CategoryAccordion categories={sortedCategories} />
      </AsyncState>
    </div>
  );
}

export function ConfigurePackageStep() {
  const packageId = useBookingCartStore((s) => s.packageId);
  const isCustom = useBookingCartStore((s) => s.isCustom);
  const guestCount = useBookingCartStore((s) => s.guestCount);
  const eventTypeId = useBookingCartStore((s) => s.customer.eventTypeId);

  if (!eventTypeId) return <EventTypePrompt />;
  if (!guestCount) return <GuestCountPrompt />;

  if (isCustom) return <CustomPackageFlow />;
  if (packageId) return <FixedPackageFlow packageId={packageId} />;

  return null;
}
