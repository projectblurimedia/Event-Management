import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { AsyncState } from '@/components/ui/AsyncState';
import { testimonialHooks } from '@/lib/api/resources';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';

export function TestimonialsPage() {
  const { t, tf } = useTranslation();
  const { data: testimonials, isLoading, isError, refetch } = testimonialHooks.usePublicList();

  return (
    <>
      <Helmet>
        <title>Testimonials | {siteConfig.businessName}</title>
      </Helmet>
      <PageHero
        eyebrow={t('page.testimonials.eyebrow')}
        title={t('page.testimonials.title')}
        description={t('page.testimonials.description')}
      />

      <Container className="py-16">
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load testimonials. Please check your connection and try again."
        >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials?.map((item) => (
            <div key={item.id} className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < item.rating ? 'fill-gold text-gold' : 'text-border'}
                  />
                ))}
              </div>
              <p className="text-sm italic">&ldquo;{tf(item.message, item.messageTe)}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.customerName} className="h-9 w-9 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold">{item.customerName}</p>
                  {item.eventType && (
                    <p className="text-text-muted text-sm capitalize">{item.eventType.toLowerCase().replace('_', ' ')}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </AsyncState>
      </Container>
    </>
  );
}
