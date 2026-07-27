import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { useQuote } from '@/lib/api/bookings';
import { packageHooks, menuItemHooks, serviceCategoryHooks, serviceOptionHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';

const currency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export function ReviewStep() {
  const { t, tf } = useTranslation();
  const packageId = useBookingCartStore((s) => s.packageId);
  const isCustom = useBookingCartStore((s) => s.isCustom);
  const guestCount = useBookingCartStore((s) => s.guestCount) ?? 0;
  const menuItems = useBookingCartStore((s) => s.menuItems);
  const selectedOptions = useBookingCartStore((s) => s.selectedOptions);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const setConfigureCategoryIndex = useBookingCartStore((s) => s.setConfigureCategoryIndex);

  const { data: packages } = packageHooks.usePublicList();
  const { data: allMenuItems } = menuItemHooks.usePublicList();
  const { data: categories } = serviceCategoryHooks.usePublicList();
  const { data: options } = serviceOptionHooks.usePublicList();

  const pkg = packages?.find((p) => p.id === packageId);

  const selection = useMemo(
    () => ({
      guestCount,
      packageId: packageId ?? undefined,
      menuItems,
      serviceOptions: selectedOptions.map((o) => ({ serviceOptionId: o.optionId, quantity: o.quantity })),
    }),
    [guestCount, packageId, menuItems, selectedOptions],
  );
  const { data: pricing, isFetching, isError: quoteError, refetch: refetchQuote } = useQuote(selection, guestCount > 0);

  const groupedOptions = useMemo(() => {
    if (!categories || !options) return [];
    return categories
      .map((cat) => ({
        category: cat,
        items: selectedOptions
          .filter((o) => o.categoryId === cat.id)
          .map((o) => {
            const option = options.find((opt) => opt.id === o.optionId);
            return option ? { ...option, quantity: o.quantity } : null;
          })
          .filter((o): o is NonNullable<typeof o> => !!o),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, options, selectedOptions]);

  function editFood() {
    if (!isCustom && pkg) {
      const idx = pkg.steps.findIndex((s) => s.kind === 'FOOD');
      if (idx >= 0) setConfigureCategoryIndex(idx);
    }
    goToStep('CONFIGURE');
  }

  function editCategory(categoryId: string) {
    if (!isCustom && pkg) {
      const idx = pkg.steps.findIndex((s) => s.serviceCategoryId === categoryId);
      if (idx >= 0) setConfigureCategoryIndex(idx);
    }
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

        {menuItems.length > 0 && (
          <div className="px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-muted text-sm">{t('wizard.foodSelection')}</span>
              <button type="button" onClick={editFood} className="text-gold text-sm underline">
                {t('common.edit')}
              </button>
            </div>
            <ul className="space-y-1">
              {menuItems.map((mi) => {
                const item = allMenuItems?.find((m) => m.id === mi.menuItemId);
                return item ? (
                  <li key={mi.menuItemId} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      {tf(item.name, item.nameTe)} × {mi.quantity}
                    </span>
                    <span className="shrink-0">{currency(Number(item.price) * mi.quantity)}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}

        {groupedOptions.map((group) => (
          <div key={group.category.id} className="px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-muted text-sm">{tf(group.category.name, group.category.nameTe)}</span>
              <button type="button" onClick={() => editCategory(group.category.id)} className="text-gold text-sm underline">
                {t('common.edit')}
              </button>
            </div>
            <ul className="space-y-1">
              {group.items.map((opt) => (
                <li key={opt.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    {tf(opt.name, opt.nameTe)}
                    {opt.quantity > 1 && ` × ${opt.quantity}`}
                  </span>
                  <span className="shrink-0">{currency(Number(opt.price) * opt.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bg-surface-muted flex items-center justify-between rounded-b-2xl px-6 py-5">
          <span className="text-base font-semibold">{t('wizard.estimatedTotal')}</span>
          {quoteError ? (
            <button
              type="button"
              onClick={() => refetchQuote()}
              className="text-rose text-sm font-semibold underline"
            >
              {t('wizard.retryQuote')}
            </button>
          ) : (
            <span className="text-gold text-xl font-semibold">
              {isFetching ? '…' : currency(pricing?.grandTotal ?? 0)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={() => goToStep('CONFIGURE')}>
          {t('common.back')}
        </Button>
        <Button variant="primary" size="lg" onClick={() => goToStep('DETAILS')} disabled={quoteError}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}
