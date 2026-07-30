import { CatalogItemsManager } from '@/features/admin/CatalogItemsManager';
import { useTranslation } from '@/hooks/useTranslation';

export function AdminServicesPage() {
  const { t } = useTranslation();
  return (
    <CatalogItemsManager
      foodOnly={false}
      title={t('admin.services.pageTitle')}
      subtitle={t('admin.services.pageSubtitle')}
      itemLabel={t('admin.services.itemLabel')}
      categoryLabel={t('admin.services.itemLabel')}
    />
  );
}
