import { Helmet } from 'react-helmet-async';
import { LinkButton } from '@/components/ui/Button';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Page Not Found | {siteConfig.businessName}</title>
      </Helmet>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-gold font-display text-7xl font-semibold">404</span>
        <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
        <p className="text-text-muted max-w-sm">{t('notFound.description')}</p>
        <LinkButton to="/" variant="primary" className="mt-2">
          {t('notFound.backToHome')}
        </LinkButton>
      </div>
    </>
  );
}
