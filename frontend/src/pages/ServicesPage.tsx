import { Helmet } from 'react-helmet-async';
import { Package as PackageIcon, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { categoryHooks, categoryTypeHooks, itemHooks } from '@/lib/api/resources';
import { useSettings } from '@/lib/api/settings';
import { useTranslation } from '@/hooks/useTranslation';

export function ServicesPage() {
  const { t, tf } = useTranslation();
  const { data: settings } = useSettings();
  const {
    data: allCategories,
    isLoading: loadingCategories,
    isError: categoriesError,
    refetch: refetchCategories,
  } = categoryHooks.usePublicList();
  const { data: allTypes } = categoryTypeHooks.usePublicList();
  const { data: allItems } = itemHooks.usePublicList();

  const categories = allCategories?.filter((c) => !c.isFood);

  return (
    <>
      <Helmet>
        <title>Services{settings?.businessName ? ` | ${settings.businessName}` : ''}</title>
        <meta
          name="description"
          content="Explore every service we offer — decoration, photography, DJ, lighting and more — then build your own booking in our guided wizard."
        />
      </Helmet>
      <PageHero
        eyebrow={t('page.services.eyebrow')}
        title={t('page.services.title')}
        description={t('page.services.description')}
      />

      <Container className="py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="border-border bg-surface flex flex-col items-start gap-3 rounded-2xl border p-8">
            <span className="bg-gold/10 text-gold flex h-11 w-11 items-center justify-center rounded-full">
              <PackageIcon size={20} />
            </span>
            <h3 className="text-lg font-semibold">{t('services.completePackage')}</h3>
            <p className="text-text-muted text-sm">{t('services.completePackageDesc')}</p>
            <LinkButton to="/packages" variant="gold" size="sm">
              {t('services.viewPackages')}
            </LinkButton>
          </div>
          <div className="border-border bg-surface flex flex-col items-start gap-3 rounded-2xl border p-8">
            <span className="bg-rose/10 text-rose flex h-11 w-11 items-center justify-center rounded-full">
              <Sparkles size={20} />
            </span>
            <h3 className="text-lg font-semibold">{t('services.customPackage')}</h3>
            <p className="text-text-muted text-sm">{t('services.customPackageDesc')}</p>
            <LinkButton to="/booking" variant="primary" size="sm">
              {t('services.startBookingBtn')}
            </LinkButton>
          </div>
        </div>

        <AsyncState
          isLoading={loadingCategories}
          isError={categoriesError}
          onRetry={refetchCategories}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load services. Please check your connection and try again."
          minHeight="min-h-[15vh]"
          compact
        >
        {categories?.map((cat) => {
          const catTypeIds = new Set(allTypes?.filter((ty) => ty.categoryId === cat.id).map((ty) => ty.id) ?? []);
          const catItems = allItems?.filter((i) => catTypeIds.has(i.categoryTypeId)) ?? [];
          if (catItems.length === 0) return null;
          return (
            <div className="mt-16" key={cat.id}>
              <SectionHeading eyebrow={t('services.serviceEyebrow')} title={tf(cat.name, cat.nameTe)} align="left" description={tf(cat.description ?? '', cat.descriptionTe) || undefined} />
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => (
                  <div key={item.id} className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border">
                    <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="h-36 w-full object-cover" iconSize={24} />
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-sm font-semibold">{tf(item.name, item.nameTe)}</h3>
                      {item.description && <p className="text-text-muted mt-1 text-sm">{item.description}</p>}
                      <p className="text-gold mt-3 text-sm font-semibold">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                        {cat.pricingMode === 'PER_PERSON' && <span className="text-text-muted text-sm"> {t('common.perGuest')}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </AsyncState>

        <div className="mt-16 flex justify-center">
          <LinkButton to="/booking" variant="primary" size="lg">
            {t('common.startBooking')}
          </LinkButton>
        </div>
      </Container>
    </>
  );
}
