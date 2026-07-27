import { useMemo, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { menuCategoryHooks, menuItemHooks } from '@/lib/api/resources';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { DietaryPreference, MenuItem } from '@/types/api';

const dietaryOptions: { value: DietaryPreference; labelKey: TranslationKey }[] = [
  { value: 'VEG', labelKey: 'common.veg' },
  { value: 'NON_VEG', labelKey: 'common.nonVeg' },
  { value: 'BOTH', labelKey: 'common.both' },
];

function FoodItemCard({ item }: { item: MenuItem }) {
  const { t, tf } = useTranslation();
  const cartItem = useBookingCartStore((s) => s.menuItems.find((m) => m.menuItemId === item.id));
  const setMenuItemQuantity = useBookingCartStore((s) => s.setMenuItemQuantity);
  const guestCount = useBookingCartStore((s) => s.guestCount) ?? 1;
  const selected = !!cartItem;
  const quantity = cartItem?.quantity ?? guestCount;
  const pricePerPlate = Number(item.price);

  return (
    <div
      className={cn(
        'border-border bg-surface flex overflow-hidden rounded-2xl border transition-colors',
        selected && 'border-gold ring-gold ring-1',
      )}
    >
      <div className="relative w-20 shrink-0 sm:w-28">
        <ImageOrPlaceholder src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        <span
          className={cn(
            'absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase',
            item.isVeg ? 'bg-emerald-600/90 text-white' : 'bg-rose/90 text-white',
          )}
        >
          {item.isVeg ? t('common.veg') : t('common.nonVeg')}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold">{tf(item.name, item.nameTe)}</h4>
            {item.description && <p className="text-text-muted line-clamp-2 text-sm">{item.description}</p>}
          </div>
          <button
            type="button"
            onClick={() => setMenuItemQuantity(item.id, selected ? 0 : guestCount)}
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-text-muted text-sm whitespace-nowrap">
            ₹{pricePerPlate.toLocaleString('en-IN')} <span>{t('wizard.perPlate')}</span>
          </p>

          {selected && (
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="border-border flex shrink-0 items-center overflow-hidden rounded-full border">
                <button
                  type="button"
                  aria-label={t('wizard.decreasePlates')}
                  onClick={() => setMenuItemQuantity(item.id, quantity - 1)}
                  className="text-text-muted flex h-6 w-6 items-center justify-center"
                >
                  <Minus size={11} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setMenuItemQuantity(item.id, Number(e.target.value))}
                  aria-label={`Number of plates for ${item.name}`}
                  className="bg-bg h-6 w-9 border-none text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label={t('wizard.increasePlates')}
                  onClick={() => setMenuItemQuantity(item.id, quantity + 1)}
                  className="text-text-muted flex h-6 w-6 items-center justify-center"
                >
                  <Plus size={11} />
                </button>
              </div>
              <span className="text-gold shrink-0 text-sm font-semibold">
                ₹{(pricePerPlate * quantity).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FoodStepPanel() {
  const { t, tf } = useTranslation();
  const dietaryPreference = useBookingCartStore((s) => s.dietaryPreference);
  const setDietaryPreference = useBookingCartStore((s) => s.setDietaryPreference);
  const menuItems = useBookingCartStore((s) => s.menuItems);
  const { data: categories } = menuCategoryHooks.usePublicList();
  const { data: items, isLoading, isError, refetch } = menuItemHooks.usePublicList();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    let result = items;
    if (dietaryPreference === 'VEG') result = result.filter((i) => i.isVeg);
    if (dietaryPreference === 'NON_VEG') result = result.filter((i) => !i.isVeg);
    if (activeCategory) result = result.filter((i) => i.categoryId === activeCategory);
    return result;
  }, [items, dietaryPreference, activeCategory]);

  const itemsById = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items]);
  const selectedCount = menuItems.length;
  const selectedTotal = menuItems.reduce((sum, m) => {
    const item = itemsById.get(m.menuItemId);
    return sum + (item ? Number(item.price) * m.quantity : 0);
  }, 0);

  if (!dietaryPreference) {
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-muted text-sm">
          {t('wizard.dietary')}:{' '}
          <span className="text-gold font-medium">
            {t(dietaryOptions.find((o) => o.value === dietaryPreference)?.labelKey ?? 'common.veg')}
          </span>
        </p>
        <div className="flex items-center gap-4">
          {selectedCount > 0 && (
            <p className="text-text-muted text-sm">
              <span className="text-gold font-semibold">{selectedCount}</span> {t('wizard.itemsSelected')}{' '}
              · <span className="text-gold font-semibold">₹{selectedTotal.toLocaleString('en-IN')}</span>
            </p>
          )}
          <button type="button" onClick={() => setDietaryPreference(null)} className="text-gold text-sm underline">
            {t('common.change')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium',
            activeCategory === null ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
          )}
        >
          {t('common.all')}
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium',
              activeCategory === cat.id ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
            )}
          >
            {tf(cat.name, cat.nameTe)}
          </button>
        ))}
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingLabel={t('common.loading')}
        errorLabel="Couldn't load the menu. Please check your connection and try again."
        minHeight="min-h-[15vh]"
        compact
      >
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <FoodItemCard key={item.id} item={item} />
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
