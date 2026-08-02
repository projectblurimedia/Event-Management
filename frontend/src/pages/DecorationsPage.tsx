import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { LinkButton } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { categoryHooks, categoryTypeHooks, itemHooks, eventTypeHooks } from '@/lib/api/resources';
import { useSettings } from '@/lib/api/settings';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function DecorationsPage() {
  const { t, tf } = useTranslation();
  const { data: settings } = useSettings();
  const { data: categories } = categoryHooks.usePublicList();
  const { data: types } = categoryTypeHooks.usePublicList();
  const { data: allItems, isLoading, isError, refetch } = itemHooks.usePublicList();
  const { data: eventTypes } = eventTypeHooks.usePublicList();
  const [activeEventType, setActiveEventType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const decorationCategory = categories?.find((c) => c.isDecoration);
  const decorationTypeIds = useMemo(
    () => new Set(types?.filter((ty) => ty.categoryId === decorationCategory?.id).map((ty) => ty.id) ?? []),
    [types, decorationCategory?.id],
  );
  const decorations = useMemo(
    () => allItems?.filter((i) => decorationTypeIds.has(i.categoryTypeId) && i.eventTypeId) ?? [],
    [allItems, decorationTypeIds],
  );

  const filteredDecorations = useMemo(() => {
    let result = decorations;
    if (activeEventType) result = result.filter((i) => i.eventTypeId === activeEventType);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((i) => i.name.toLowerCase().includes(q) || (i.nameTe ?? '').toLowerCase().includes(q));
    }
    return result;
  }, [decorations, activeEventType, search]);

  const usedEventTypeIds = useMemo(() => new Set(decorations.map((i) => i.eventTypeId).filter(Boolean)), [decorations]);
  const filterableEventTypes = useMemo(
    () => eventTypes?.filter((et) => usedEventTypeIds.has(et.id)) ?? [],
    [eventTypes, usedEventTypeIds],
  );

  return (
    <>
      <Helmet>
        <title>Decorations{settings?.businessName ? ` | ${settings.businessName}` : ''}</title>
        <meta
          name="description"
          content="Browse decoration styles by occasion — wedding, birthday, housewarming and more — then build your event in our guided booking wizard."
        />
      </Helmet>
      <PageHero
        eyebrow={t('page.decorations.eyebrow')}
        title={t('page.decorations.title')}
        description={t('page.decorations.description')}
      />

      <Container className="py-12">
        <div className="relative mx-auto mb-6 w-full max-w-md">
          <Search size={16} className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('page.decorations.searchPlaceholder')}
            className="border-border bg-surface w-full rounded-full border py-3 pr-4 pl-11 text-sm outline-none focus:border-gold"
          />
        </div>

        {filterableEventTypes.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveEventType(null)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide uppercase',
                activeEventType === null ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
              )}
            >
              {t('common.all')}
            </button>
            {filterableEventTypes.map((et) => (
              <button
                key={et.id}
                type="button"
                onClick={() => setActiveEventType(et.id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide uppercase',
                  activeEventType === et.id ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
                )}
              >
                {tf(et.name, et.nameTe)}
              </button>
            ))}
          </div>
        )}

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load decorations. Please check your connection and try again."
        >
          {filteredDecorations.length === 0 ? (
            <p className="text-text-muted mt-8 text-center text-sm">{t('page.decorations.noSearchResults')}</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDecorations.map((item) => {
                const et = eventTypes?.find((e) => e.id === item.eventTypeId);
                return (
                  <div key={item.id} className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border">
                    <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="aspect-[4/3] w-full object-cover" iconSize={24} />
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      {et && <span className="text-gold text-xs font-semibold tracking-wide uppercase">{tf(et.name, et.nameTe)}</span>}
                      <h3 className="text-sm font-semibold">{tf(item.name, item.nameTe)}</h3>
                      {item.description && <p className="text-text-muted mt-0.5 text-sm">{item.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AsyncState>

        <div className="mt-12 flex justify-center">
          <LinkButton to="/booking" variant="primary" size="lg">
            {t('common.startBooking')}
          </LinkButton>
        </div>
      </Container>
    </>
  );
}
