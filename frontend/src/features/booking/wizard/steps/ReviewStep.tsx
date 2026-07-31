import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { packageHooks, categoryHooks, itemHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';

export function ReviewStep() {
  const { t, tf } = useTranslation();
  const packageId = useBookingCartStore((s) => s.packageId);
  const isCustom = useBookingCartStore((s) => s.isCustom);
  const guestCount = useBookingCartStore((s) => s.guestCount) ?? 0;
  const selectedItems = useBookingCartStore((s) => s.selectedItems);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const setExpandedCategoryId = useBookingCartStore((s) => s.setExpandedCategoryId);

  const { data: packages } = packageHooks.usePublicList();
  const { data: categories } = categoryHooks.usePublicList();
  const { data: allItems } = itemHooks.usePublicList();

  const pkg = packages?.find((p) => p.id === packageId);

  const groupedSelections = useMemo(() => {
    if (!categories || !allItems) return [];
    return categories
      .map((cat) => ({
        category: cat,
        items: selectedItems
          .filter((s) => s.categoryId === cat.id)
          .map((s) => allItems.find((i) => i.id === s.itemId))
          .filter((i): i is NonNullable<typeof i> => !!i),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, allItems, selectedItems]);

  function editCategory(categoryId: string) {
    setExpandedCategoryId(categoryId);
    goToStep('CONFIGURE');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">{t('wizard.reviewTitle')}</h2>
        <p className="text-text-muted mt-1 text-sm">{t('wizard.reviewSubtitle')}</p>
      </div>

      <div className="border-border bg-surface flex flex-col divide-y rounded-2xl border">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-text-muted text-sm">{t('wizard.packageLabel')}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {pkg ? tf(pkg.name, pkg.nameTe) : isCustom ? t('wizard.customPackageTitle') : '—'}
            </span>
            <button type="button" onClick={() => goToStep('PACKAGE')} className="text-gold text-sm underline">
              {t('common.edit')}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-text-muted text-sm">{t('wizard.guestCountLabel')}</span>
          <span className="text-sm font-semibold">{guestCount}</span>
        </div>

        {groupedSelections.map((group) => (
          <div key={group.category.id} className="px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-muted text-sm">{tf(group.category.name, group.category.nameTe)}</span>
              <button type="button" onClick={() => editCategory(group.category.id)} className="text-gold text-sm underline">
                {t('common.edit')}
              </button>
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id} className="text-sm">
                  {tf(item.name, item.nameTe)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={() => goToStep('CONFIGURE')}>
          {t('common.back')}
        </Button>
        <Button variant="primary" size="lg" onClick={() => goToStep('DETAILS')}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}
