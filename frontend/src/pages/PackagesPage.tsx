import { Helmet } from 'react-helmet-async';
import { Sparkles } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { AsyncState } from '@/components/ui/AsyncState';
import { PackageCard } from '@/features/packages/PackageCard';
import { packageHooks } from '@/lib/api/resources';
import { useSettings } from '@/lib/api/settings';
import { useTranslation } from '@/hooks/useTranslation';

export function PackagesPage() {
  const { t } = useTranslation();
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
          {packages?.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} imageClassName="h-44" />)}
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
