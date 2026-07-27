import { Check, Minus, Plus } from 'lucide-react';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { ServiceCategory } from '@/types/api';

interface CategoryOptionPanelProps {
  category: ServiceCategory;
}

export function CategoryOptionPanel({ category }: CategoryOptionPanelProps) {
  const { t, tf } = useTranslation();
  const selectedOptions = useBookingCartStore((s) => s.selectedOptions);
  const toggleOption = useBookingCartStore((s) => s.toggleOption);
  const setOptionQuantity = useBookingCartStore((s) => s.setOptionQuantity);
  const guestCount = useBookingCartStore((s) => s.guestCount) ?? 1;

  const options = category.options ?? [];

  return (
    <div>
      {category.description && (
        <p className="text-text-muted mb-5 text-sm">{tf(category.description, category.descriptionTe)}</p>
      )}
      {category.allowMultiple && (
        <p className="text-gold mb-4 text-sm font-medium">{t('wizard.allowMultipleHint')}</p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {options.map((option) => {
          const selection = selectedOptions.find(
            (o) => o.categoryId === category.id && o.optionId === option.id,
          );
          const selected = !!selection;
          const isPerGuest = option.unit === 'PER_GUEST';
          const quantity = selection?.quantity ?? guestCount;
          const pricePerUnit = Number(option.price);

          return (
            <div
              key={option.id}
              className={cn(
                'border-border bg-surface flex overflow-hidden rounded-2xl border transition-colors',
                selected && 'border-gold ring-gold ring-1',
              )}
            >
              <ImageOrPlaceholder
                src={option.imageUrl}
                alt={option.name}
                className="w-20 shrink-0 object-cover sm:w-28"
              />

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5 p-3 sm:p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold">{tf(option.name, option.nameTe)}</h4>
                    {option.description && (
                      <p className="text-text-muted line-clamp-2 text-sm">{option.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOption(category.id, option.id, category.allowMultiple, isPerGuest ? guestCount : 1)}
                    aria-label={selected ? `Remove ${option.name}` : `Select ${option.name}`}
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
                    ₹{pricePerUnit.toLocaleString('en-IN')}
                    {isPerGuest && <span> {t('common.perGuest')}</span>}
                  </p>

                  {selected && isPerGuest && (
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <div className="border-border flex shrink-0 items-center overflow-hidden rounded-full border">
                        <button
                          type="button"
                          aria-label={t('wizard.decreasePlates')}
                          onClick={() => setOptionQuantity(category.id, option.id, quantity - 1)}
                          className="text-text-muted flex h-6 w-6 items-center justify-center"
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setOptionQuantity(category.id, option.id, Number(e.target.value))}
                          aria-label={`Quantity for ${option.name}`}
                          className="bg-bg h-6 w-9 border-none text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={t('wizard.increasePlates')}
                          onClick={() => setOptionQuantity(category.id, option.id, quantity + 1)}
                          className="text-text-muted flex h-6 w-6 items-center justify-center"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="text-gold shrink-0 text-sm font-semibold">
                        ₹{(pricePerUnit * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {selected && !isPerGuest && (
                    <span className="text-gold shrink-0 text-sm font-semibold">₹{pricePerUnit.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {options.length === 0 && (
          <p className="text-text-muted col-span-full text-sm">{t('wizard.noOptionsAvailable')}</p>
        )}
      </div>
    </div>
  );
}
