import { Helmet } from 'react-helmet-async';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { LinkButton } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { eventTypeHooks } from '@/lib/api/resources';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';

export function EventTypesPage() {
  const { t, tf } = useTranslation();
  const { data: eventTypes, isLoading, isError, refetch } = eventTypeHooks.usePublicList();

  return (
    <>
      <Helmet>
        <title>Event Types | {siteConfig.businessName}</title>
      </Helmet>
      <PageHero
        eyebrow={t('page.eventTypes.eyebrow')}
        title={t('page.eventTypes.title')}
        description={t('page.eventTypes.description')}
      />

      <Container className="py-16">
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load event types. Please check your connection and try again."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventTypes?.map((et) => (
              <div key={et.id} className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border">
                <ImageOrPlaceholder
                  src={et.imageUrl}
                  alt={tf(et.name, et.nameTe)}
                  className="h-40 w-full object-cover"
                  iconSize={24}
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-sm font-semibold">{tf(et.name, et.nameTe)}</h3>
                  {et.description && (
                    <p className="text-text-muted text-sm">{tf(et.description, et.descriptionTe)}</p>
                  )}
                  <LinkButton
                    to={`/booking?eventType=${et.id}`}
                    variant="outline"
                    size="sm"
                    className="mt-auto w-fit"
                  >
                    {t('eventTypes.planThisEvent')}
                  </LinkButton>
                </div>
              </div>
            ))}
          </div>
        </AsyncState>
      </Container>
    </>
  );
}
