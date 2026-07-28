import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { LinkButton } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { menuCategoryHooks, menuItemHooks } from '@/lib/api/resources';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { MenuItem } from '@/types/api';

function MenuItemCard({ item }: { item: MenuItem }) {
  const { t, tf } = useTranslation();
  return (
    <div className="border-border bg-surface flex gap-4 rounded-xl border p-4">
      <ImageOrPlaceholder
        src={item.imageUrl}
        alt={item.name}
        className="h-20 w-20 shrink-0 rounded-lg object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold">{tf(item.name, item.nameTe)}</h3>
          <span className="text-gold shrink-0 text-sm font-semibold">₹{Number(item.price).toLocaleString('en-IN')}</span>
        </div>
        {item.description && <p className="text-text-muted mt-1 text-sm">{item.description}</p>}
        <span
          className={cn(
            'mt-auto w-fit rounded-full px-2 py-0.5 pt-2 text-[10px] font-semibold tracking-wide uppercase',
            item.isVeg ? 'text-emerald-600' : 'text-rose',
          )}
        >
          {item.isVeg ? t('common.veg') : t('common.nonVeg')}
        </span>
      </div>
    </div>
  );
}

export function MenuPage() {
  const { t, tf } = useTranslation();
  const { data: categories } = menuCategoryHooks.usePublicList();
  const { data: items, isLoading, isError, refetch } = menuItemHooks.usePublicList();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!items) return [];
    let result = items;
    if (activeCategory) result = result.filter((item) => item.categoryId === activeCategory);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || (item.nameTe ?? '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, activeCategory, search]);

  return (
    <>
      <Helmet>
        <title>Menu | {siteConfig.businessName}</title>
        <meta
          name="description"
          content="Browse sweets, snacks, biryani, curries and more — then build your event menu in our guided booking wizard."
        />
      </Helmet>
      <PageHero
        eyebrow={t('page.menu.eyebrow')}
        title={t('page.menu.title')}
        description={t('page.menu.description')}
      />

      <Container className="py-12">
        <div className="relative mx-auto mb-6 w-full max-w-md">
          <Search size={16} className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('page.menu.searchPlaceholder')}
            className="border-border bg-surface w-full rounded-full border py-3 pr-4 pl-11 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide uppercase',
              activeCategory === null ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
            )}
          >
            {t('common.all')}
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide uppercase',
                activeCategory === cat.id
                  ? 'bg-gold text-ink-black border-gold'
                  : 'border-border text-text-muted',
              )}
            >
              {tf(cat.name, cat.nameTe)}
            </button>
          ))}
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load the menu. Please check your connection and try again."
        >
          {filteredItems.length === 0 ? (
            <p className="text-text-muted mt-8 text-center text-sm">{t('page.menu.noSearchResults')}</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
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
