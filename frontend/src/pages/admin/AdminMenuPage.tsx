import { CatalogItemsManager } from '@/features/admin/CatalogItemsManager';
import { useTranslation } from '@/hooks/useTranslation';

export function AdminMenuPage() {
  const { t } = useTranslation();
  return (
    <CatalogItemsManager
      foodOnly
      title={t('admin.menu.pageTitle')}
      subtitle={t('admin.menu.pageSubtitle')}
      itemLabel={t('admin.menu.itemLabel')}
      categoryLabel={t('admin.categories.title')}
    />
  );
}
