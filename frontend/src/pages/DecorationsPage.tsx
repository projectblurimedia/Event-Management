import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { LinkButton } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { Modal } from '@/components/ui/Modal';
import { categoryHooks, categoryTypeHooks, itemHooks, eventTypeHooks } from '@/lib/api/resources';
import { useSettings } from '@/lib/api/settings';
import { useTranslation } from '@/hooks/useTranslation';
import type { EventType, Item } from '@/types/api';

function DecorationModal({
  item,
  eventType,
  open,
  onClose,
}: {
  item: Item;
  eventType: EventType | undefined;
  open: boolean;
  onClose: () => void;
}) {
  const { t, tf } = useTranslation();
  if (!item) return null;

  const bookHref = `/booking?package=custom&decoration=${item.id}${item.eventTypeId ? `&eventType=${item.eventTypeId}` : ''}`;

  return (
    <Modal open={open} onClose={onClose} title={tf(item.name, item.nameTe)} size="lg">
      <div className="flex flex-col gap-4">
        <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="aspect-[4/3] w-full rounded-xl object-cover" />
        {eventType && (
          <span className="text-gold w-fit text-xs font-semibold tracking-wide uppercase">
            {tf(eventType.name, eventType.nameTe)}
          </span>
        )}
        {item.description && <p className="text-text-muted text-sm">{item.description}</p>}
        <LinkButton to={bookHref} variant="primary" className="w-full">
          {t('page.decorations.bookThis')}
        </LinkButton>
      </div>
    </Modal>
  );
}

export function DecorationsPage() {
  const { t, tf } = useTranslation();
  const { data: settings } = useSettings();
  const { data: categories } = categoryHooks.usePublicList();
  const { data: types } = categoryTypeHooks.usePublicList();
  const { data: allItems, isLoading, isError, refetch } = itemHooks.usePublicList();
  const { data: eventTypes } = eventTypeHooks.usePublicList();
  const [activeEventType, setActiveEventType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openItem, setOpenItem] = useState<Item | null>(null);

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

  // Lists every event type, not just ones with decorations uploaded yet —
  // gating this behind "has photos already" is why the filter disappeared
  // entirely while only Wedding had any.
  const filterableEventTypes = useMemo(() => eventTypes ?? [], [eventTypes]);

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
        <div className="mx-auto mb-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('page.decorations.searchPlaceholder')}
              className="border-border bg-surface w-full rounded-full border py-3 pr-4 pl-11 text-sm outline-none focus:border-gold"
            />
          </div>

          {filterableEventTypes.length > 0 && (
            <select
              value={activeEventType ?? ''}
              onChange={(e) => setActiveEventType(e.target.value || null)}
              className="border-border bg-surface focus:border-gold rounded-full border px-4 py-3 text-sm outline-none sm:w-52"
            >
              <option value="">{t('common.all')}</option>
              {filterableEventTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {tf(et.name, et.nameTe)}
                </option>
              ))}
            </select>
          )}
        </div>

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
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOpenItem(item)}
                    className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border text-left transition-transform hover:-translate-y-0.5"
                  >
                    <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="aspect-[4/3] w-full object-cover" iconSize={24} />
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      {et && <span className="text-gold text-xs font-semibold tracking-wide uppercase">{tf(et.name, et.nameTe)}</span>}
                      <h3 className="text-sm font-semibold">{tf(item.name, item.nameTe)}</h3>
                      {item.description && <p className="text-text-muted mt-0.5 text-sm">{item.description}</p>}
                    </div>
                  </button>
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

      {openItem && (
        <DecorationModal
          item={openItem}
          eventType={eventTypes?.find((e) => e.id === openItem.eventTypeId)}
          open={!!openItem}
          onClose={() => setOpenItem(null)}
        />
      )}
    </>
  );
}
