import { Helmet } from 'react-helmet-async';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { AsyncState } from '@/components/ui/AsyncState';
import { PackageCard } from '@/features/packages/PackageCard';
import { CustomPackageCard } from '@/features/packages/CustomPackageCard';
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
          <CustomPackageCard imageClassName="h-44" />
        </div>
        </AsyncState>
      </Container>
    </>
  );
}
