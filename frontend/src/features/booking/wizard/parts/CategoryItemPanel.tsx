import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { categoryTypeHooks, itemHooks } from '@/lib/api/resources';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { Category, DietaryPreference, Item } from '@/types/api';

const dietaryOptions: { value: DietaryPreference; labelKey: TranslationKey }[] = [
  { value: 'VEG', labelKey: 'common.veg' },
  { value: 'NON_VEG', labelKey: 'common.nonVeg' },
  { value: 'BOTH', labelKey: 'common.both' },
];

function ItemDetailModal({
  category,
  item,
  open,
  onClose,
}: {
  category: Category;
  item: Item;
  open: boolean;
  onClose: () => void;
}) {
  const { t, tf } = useTranslation();
  const selection = useBookingCartStore((s) => s.selectedItems.some((i) => i.itemId === item.id));
  const toggleItem = useBookingCartStore((s) => s.toggleItem);

  return (
    <Modal open={open} onClose={onClose} title={tf(item.name, item.nameTe)} size="lg">
      <div className="flex flex-col gap-4">
        {item.images.length > 0 && (
          <div className={cn('grid gap-2', item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
            {item.images.map((src, i) => (
              <ImageOrPlaceholder
                key={src}
                src={src}
                alt={`${tf(item.name, item.nameTe)} ${i + 1}`}
                className="aspect-video w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}
        {category.isFood && item.isVeg !== null && (
          <span
            className={cn(
              'w-fit rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
              item.isVeg ? 'bg-emerald-600/10 text-emerald-600' : 'bg-rose/10 text-rose',
            )}
          >
            {item.isVeg ? t('common.veg') : t('common.nonVeg')}
          </span>
        )}
        {item.description && <p className="text-text-muted text-sm">{item.description}</p>}
        <Button
          type="button"
          variant={selection ? 'outline' : 'primary'}
          onClick={() => {
            toggleItem(category.id, item.id, category.allowMultiple);
            onClose();
          }}
        >
          {selection ? <Check size={15} /> : <Plus size={15} />}
          {selection ? t('wizard.removeThis') : t('wizard.selectThis')}
        </Button>
      </div>
    </Modal>
  );
}

function ItemCard({ category, item }: { category: Category; item: Item }) {
  const { t, tf } = useTranslation();
  const selection = useBookingCartStore((s) => s.selectedItems.find((i) => i.itemId === item.id));
  const toggleItem = useBookingCartStore((s) => s.toggleItem);
  const selected = !!selection;
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setDetailOpen(true);
        }}
        className={cn(
          'border-border bg-surface flex cursor-pointer overflow-hidden rounded-2xl border transition-colors',
          selected && 'border-gold ring-gold ring-1',
        )}
      >
        <div className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-28">
          <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="h-full w-full object-cover" />
          {category.isFood && item.isVeg !== null && (
            <span
              className={cn(
                'absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase',
                item.isVeg ? 'bg-emerald-600/90 text-white' : 'bg-rose/90 text-white',
              )}
            >
              {item.isVeg ? t('common.veg') : t('common.nonVeg')}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 p-3 sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold">{tf(item.name, item.nameTe)}</h4>
              {item.description && <p className="text-text-muted line-clamp-2 text-sm">{item.description}</p>}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(category.id, item.id, category.allowMultiple);
              }}
              aria-label={selected ? `Remove ${item.name}` : `Select ${item.name}`}
              aria-pressed={selected}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selected ? 'bg-gold border-gold text-ink-black' : 'border-border text-text-muted',
              )}
            >
              {selected ? <Check size={12} /> : <Plus size={12} />}
            </button>
          </div>
        </div>
      </div>
      <ItemDetailModal category={category} item={item} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  );
}

/** Decoration is shown as an image-forward 2-column gallery instead of the
 * row layout everything else uses — the picture is the point. */
function DecorationCard({ category, item }: { category: Category; item: Item }) {
  const { tf } = useTranslation();
  const selection = useBookingCartStore((s) => s.selectedItems.find((i) => i.itemId === item.id));
  const toggleItem = useBookingCartStore((s) => s.toggleItem);
  const selected = !!selection;
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setDetailOpen(true);
        }}
        className={cn(
          'border-border bg-surface relative cursor-pointer overflow-hidden rounded-2xl border transition-colors',
          selected && 'border-gold ring-gold ring-2',
        )}
      >
        <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="aspect-[4/3] w-full object-cover" />
        <div className="from-ink-black/80 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3 pt-8 pb-2.5">
          <h4 className="truncate text-sm font-semibold text-white">{tf(item.name, item.nameTe)}</h4>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleItem(category.id, item.id, category.allowMultiple);
          }}
          aria-label={selected ? `Remove ${item.name}` : `Select ${item.name}`}
          aria-pressed={selected}
          className={cn(
            'absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors',
            selected ? 'bg-gold border-gold text-ink-black' : 'border-white/70 bg-black/30 text-white',
          )}
        >
          {selected ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>
      <ItemDetailModal category={category} item={item} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  );
}

export function CategoryItemPanel({ category }: { category: Category }) {
  const { t, tf } = useTranslation();
  const dietaryPreference = useBookingCartStore((s) => s.dietaryPreference);
  const setDietaryPreference = useBookingCartStore((s) => s.setDietaryPreference);
  const clearCategorySelections = useBookingCartStore((s) => s.clearCategorySelections);
  const packageId = useBookingCartStore((s) => s.packageId);
  const isCustom = useBookingCartStore((s) => s.isCustom);
  const eventTypeId = useBookingCartStore((s) => s.customer.eventTypeId);
  const { data: allTypes } = categoryTypeHooks.usePublicList();
  const { data: allItems, isLoading, isError, refetch } = itemHooks.usePublicList();
  const [search, setSearch] = useState('');
  const selectedItems = useBookingCartStore((s) => s.selectedItems);

  const typeIds = useMemo(
    () => new Set((allTypes ?? []).filter((ty) => ty.categoryId === category.id).map((ty) => ty.id)),
    [allTypes, category.id],
  );
  const categoryItems = useMemo(() => {
    if (!allItems) return [];
    const inCategory = allItems.filter((i) => typeIds.has(i.categoryTypeId));
    // Decoration is curated per event ("Wedding" decorations, "Birthday"
    // decorations...) where possible — but if nothing's tagged for the
    // chosen event yet, showing an empty section is worse than showing
    // everything, so fall back to the full gallery instead.
    if (category.isDecoration) {
      const forThisEvent = inCategory.filter((i) => i.eventTypeId === eventTypeId);
      return forThisEvent.length > 0 ? forThisEvent : inCategory;
    }
    // Everything else: items tagged with a packageId (e.g. tiered "Elegant
    // Decoration" under Gold) only show when that exact package is
    // selected; untagged items always show, and Custom Package shows
    // everything with no tier lock.
    return inCategory.filter((i) => !i.packageId || isCustom || i.packageId === packageId);
  }, [allItems, typeIds, category.isDecoration, eventTypeId, isCustom, packageId]);
  const selectedIds = useMemo(
    () => new Set(selectedItems.filter((s) => s.categoryId === category.id).map((s) => s.itemId)),
    [selectedItems, category.id],
  );

  const toggleItem = useBookingCartStore((s) => s.toggleItem);
  // Package-tier-locked items (e.g. "Sound System" under Silver) are
  // inclusions, not choices — pre-select them the moment they're known to
  // apply so the customer sees them already included, no click needed.
  // Reads selection state fresh instead of depending on it, so a customer
  // manually removing one afterward doesn't get immediately re-added.
  useEffect(() => {
    if (isCustom || !packageId) return;
    const currentlySelected = useBookingCartStore.getState().selectedItems;
    for (const item of categoryItems) {
      if (
        item.packageId === packageId &&
        !currentlySelected.some((s) => s.categoryId === category.id && s.itemId === item.id)
      ) {
        toggleItem(category.id, item.id, category.allowMultiple);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryItems, isCustom, packageId, category.id, category.allowMultiple]);

  const filteredItems = useMemo(() => {
    let result = categoryItems;
    // isVeg === null means "not applicable" (drinks, bundled services) —
    // those items should never be hidden by a veg/non-veg choice, only
    // items explicitly marked one way or the other get filtered.
    if (category.isFood && dietaryPreference === 'VEG') result = result.filter((i) => i.isVeg !== false);
    if (category.isFood && dietaryPreference === 'NON_VEG') result = result.filter((i) => i.isVeg !== true);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || (i.nameTe ?? '').toLowerCase().includes(q),
      );
    }
    // Stable sort: already-selected items float to the top so the customer
    // can see their picks at a glance in long lists.
    return [...result].sort((a, b) => Number(selectedIds.has(b.id)) - Number(selectedIds.has(a.id)));
  }, [categoryItems, dietaryPreference, category.isFood, search, selectedIds]);

  if (category.isFood && !dietaryPreference) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-6 text-center">
        <h3 className="text-lg font-semibold">{t('wizard.dietaryQuestion')}</h3>
        <div className="flex gap-3">
          {dietaryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDietaryPreference(opt.value)}
              className="border-border hover:border-gold hover:text-gold rounded-full border px-5 py-2.5 text-sm font-medium"
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {category.description && (
        <p className="text-text-muted mb-5 text-sm">{tf(category.description, category.descriptionTe)}</p>
      )}

      {category.isFood ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-text-muted text-sm">
            {t('wizard.dietary')}:{' '}
            <span className="text-gold font-medium">
              {t(dietaryOptions.find((o) => o.value === dietaryPreference)?.labelKey ?? 'common.veg')}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              clearCategorySelections(category.id);
              setDietaryPreference(null);
            }}
            className="text-gold text-sm underline"
          >
            {t('common.change')}
          </button>
        </div>
      ) : (
        category.allowMultiple && <p className="text-gold mb-4 text-sm font-medium">{t('wizard.allowMultipleHint')}</p>
      )}

      {categoryItems.length > 6 && (
        <div className="relative mb-4">
          <Search size={15} className="text-text-muted absolute top-1/2 left-3.5 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('wizard.searchItems')}
            className="border-border bg-bg focus:border-gold w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm outline-none"
          />
        </div>
      )}

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingLabel={t('common.loading')}
        errorLabel="Couldn't load this section. Please check your connection and try again."
        minHeight="min-h-[15vh]"
        compact
      >
        <div className={category.isDecoration ? 'grid grid-cols-2 gap-4' : 'grid gap-4 lg:grid-cols-2'}>
          {filteredItems.map((item) =>
            category.isDecoration ? (
              <DecorationCard key={item.id} category={category} item={item} />
            ) : (
              <ItemCard key={item.id} category={category} item={item} />
            ),
          )}
          {filteredItems.length === 0 && (
            <p className="text-text-muted col-span-full text-sm">{t('wizard.noOptionsAvailable')}</p>
          )}
        </div>
      </AsyncState>
    </div>
  );
}
