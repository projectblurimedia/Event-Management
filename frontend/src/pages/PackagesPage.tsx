import { Helmet } from 'react-helmet-async';
import { Check, Sparkles } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { packageHooks } from '@/lib/api/resources';
import { useSettings } from '@/lib/api/settings';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function PackagesPage() {
  const { t, tf } = useTranslation();
  const { data: packages, isLoading, isError, refetch } = packageHooks.usePublicList();
  const { data: settings } = useSettings();

  return (
    <>
      <Helmet>
        <title>Packages{settings?.businessName ? ` | ${settings.businessName}` : ''}</title>
        <meta name="description" content="Explore our event packages and what's included in each." />
      </Helmet>
      <PageHero
        eyebrow={t('page.packages.eyebrow')}
        title={t('page.packages.title')}
        description={t('page.packages.description')}
      />

      <Container className="py-16">
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load packages right now. Please check your connection and try again."
        >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {packages?.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'border-border bg-surface flex flex-col overflow-hidden rounded-2xl border',
                pkg.isFeatured && 'border-gold shadow-xl shadow-gold/10 lg:-translate-y-3',
              )}
            >
              <ImageOrPlaceholder src={pkg.imageUrl} alt={pkg.name} className="h-44 w-full object-cover" />
              <div className="flex flex-1 flex-col p-6">
                {pkg.isFeatured && (
                  <span className="bg-gold text-ink-black mb-3 w-fit rounded-full px-3 py-1 text-sm font-semibold tracking-wide uppercase">
                    {t('packages.mostPopular')}
                  </span>
                )}
                <h3 className="text-xl font-semibold">{tf(pkg.name, pkg.nameTe)}</h3>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {pkg.categories.map((pc) => (
                    <li key={pc.id} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-gold mt-0.5 shrink-0" />
                      {tf(pc.category.name, pc.category.nameTe)}
                    </li>
                  ))}
                </ul>
                <LinkButton
                  to={`/booking?package=${pkg.id}`}
                  variant={pkg.isFeatured ? 'gold' : 'outline'}
                  className="mt-6 w-full"
                >
                  {t('packages.chooseThisPackage')}
                </LinkButton>
              </div>
            </div>
          ))}
          <div className="border-border bg-surface flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
            <span className="bg-rose/10 text-rose flex h-11 w-11 items-center justify-center rounded-full">
              <Sparkles size={20} />
            </span>
            <h3 className="text-xl font-semibold">{t('wizard.customPackageTitle')}</h3>
            <p className="text-text-muted text-sm">{t('wizard.customPackageDesc')}</p>
            <LinkButton to="/booking?package=custom" variant="outline" className="mt-2 w-full">
              {t('packages.chooseThisPackage')}
            </LinkButton>
          </div>
        </div>
        </AsyncState>
      </Container>
    </>
  );
}
