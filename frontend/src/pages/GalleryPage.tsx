import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { AsyncState } from '@/components/ui/AsyncState';
import { galleryHooks } from '@/lib/api/resources';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { GalleryCategory } from '@/types/api';

const filters: { labelKey: TranslationKey; value: GalleryCategory | null }[] = [
  { labelKey: 'gallery.filterAll', value: null },
  { labelKey: 'gallery.filterFood', value: 'FOOD' },
  { labelKey: 'gallery.filterDecoration', value: 'DECORATION' },
  { labelKey: 'gallery.filterEvents', value: 'EVENT' },
];

export function GalleryPage() {
  const { t, tf } = useTranslation();
  const { data: images, isLoading, isError, refetch } = galleryHooks.usePublicList();
  const [filter, setFilter] = useState<GalleryCategory | null>(null);

  const filtered = filter ? images?.filter((img) => img.category === filter) : images;

  return (
    <>
      <Helmet>
        <title>Gallery | {siteConfig.businessName}</title>
      </Helmet>
      <PageHero
        eyebrow={t('page.gallery.eyebrow')}
        title={t('page.gallery.title')}
        description={t('page.gallery.description')}
      />

      <Container className="py-16">
        <div className="flex justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.labelKey}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide uppercase',
                filter === f.value ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
              )}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load the gallery. Please check your connection and try again."
        >
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filtered?.map((img) => (
              <div key={img.id} className="border-border bg-surface mb-4 break-inside-avoid overflow-hidden rounded-xl border">
                <img src={img.imageUrl} alt={tf(img.caption ?? '', img.captionTe)} loading="lazy" className="w-full object-cover" />
                {img.caption && <p className="text-text-muted p-3 text-sm">{tf(img.caption, img.captionTe)}</p>}
              </div>
            ))}
          </div>
        </AsyncState>
      </Container>
    </>
  );
}
