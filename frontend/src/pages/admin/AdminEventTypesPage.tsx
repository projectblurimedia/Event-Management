import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { eventTypeHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';
import type { EventType } from '@/types/api';

export function AdminEventTypesPage() {
  const { t } = useTranslation();

  const fields: EntityField<EventType>[] = [
    { name: 'name', label: t('admin.eventTypes.name'), type: 'text', required: true },
    { name: 'description', label: t('admin.eventTypes.description'), type: 'textarea' },
    { name: 'imageUrl', label: t('admin.eventTypes.image'), type: 'image' },
    { name: 'isActive', label: t('admin.eventTypes.active'), type: 'checkbox' },
  ];

  const columns: EntityColumn<EventType>[] = [
    { key: 'name', label: t('admin.eventTypes.colName') },
    { key: 'isActive', label: t('admin.eventTypes.colActive'), render: (e) => (e.isActive ? t('common.yes') : t('common.no')) },
  ];

  return (
    <AdminEntityManager
      title={t('admin.eventTypes.title')}
      description={t('admin.eventTypes.desc')}
      fields={fields}
      columns={columns}
      hooks={eventTypeHooks}
    />
  );
}
