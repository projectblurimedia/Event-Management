import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { AsyncState } from '@/components/ui/AsyncState';
import { faqHooks } from '@/lib/api/resources';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function FaqPage() {
  const { t, tf } = useTranslation();
  const { data: faqs, isLoading, isError, refetch } = faqHooks.usePublicList();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>FAQ | {siteConfig.businessName}</title>
      </Helmet>
      <PageHero
        eyebrow={t('page.faq.eyebrow')}
        title={t('page.faq.title')}
        description={t('page.faq.description')}
      />

      <Container className="py-16">
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          loadingLabel={t('common.loading')}
          errorLabel="Couldn't load FAQs. Please check your connection and try again."
        >
        <div className="border-border bg-surface mx-auto max-w-2xl divide-y rounded-2xl border">
          {faqs?.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium">{tf(faq.question, faq.questionTe)}</span>
                  <ChevronDown
                    size={16}
                    className={cn('text-gold shrink-0 transition-transform', isOpen && 'rotate-180')}
                  />
                </button>
                {isOpen && <p className="text-text-muted px-6 pb-4 text-sm">{tf(faq.answer, faq.answerTe)}</p>}
              </div>
            );
          })}
        </div>
        </AsyncState>
      </Container>
    </>
  );
}
