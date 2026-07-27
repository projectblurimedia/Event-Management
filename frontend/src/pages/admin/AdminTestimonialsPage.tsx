import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { testimonialHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { Testimonial } from '@/types/api';

const eventTypeKeys: { value: string; labelKey: TranslationKey }[] = [
  { value: 'WEDDING', labelKey: 'eventType.wedding' },
  { value: 'RECEPTION', labelKey: 'eventType.reception' },
  { value: 'BIRTHDAY', labelKey: 'eventType.birthday' },
  { value: 'HOUSEWARMING', labelKey: 'eventType.housewarming' },
  { value: 'ENGAGEMENT', labelKey: 'eventType.engagement' },
  { value: 'CORPORATE', labelKey: 'eventType.corporate' },
  { value: 'ANNIVERSARY', labelKey: 'eventType.anniversary' },
  { value: 'NAMING_CEREMONY', labelKey: 'eventType.namingCeremony' },
  { value: 'BABY_SHOWER', labelKey: 'eventType.babyShower' },
  { value: 'OTHER', labelKey: 'eventType.other' },
];

export function AdminTestimonialsPage() {
  const { t } = useTranslation();

  const eventTypeOptions = eventTypeKeys.map((e) => ({ value: e.value, label: t(e.labelKey) }));

  const fields: EntityField<Testimonial>[] = [
    { name: 'customerName', label: t('admin.testimonials.customerName'), type: 'text', required: true },
    { name: 'eventType', label: t('admin.testimonials.eventType'), type: 'select', options: eventTypeOptions },
    { name: 'rating', label: t('admin.testimonials.rating'), type: 'number', required: true },
    { name: 'order', label: t('admin.testimonials.displayOrder'), type: 'number' },
    { name: 'isPublished', label: t('admin.testimonials.published'), type: 'checkbox' },
    { name: 'message', label: t('admin.testimonials.review'), type: 'textarea', required: true },
    { name: 'messageTe', label: t('admin.testimonials.reviewTe'), type: 'textarea' },
    { name: 'imageUrl', label: t('admin.testimonials.photo'), type: 'image' },
  ];

  const columns: EntityColumn<Testimonial>[] = [
    { key: 'customerName', label: t('admin.testimonials.colCustomer') },
    { key: 'rating', label: t('admin.testimonials.colRating') },
    {
      key: 'isPublished',
      label: t('admin.testimonials.colPublished'),
      render: (item) => (item.isPublished ? t('common.yes') : t('common.no')),
    },
  ];

  return (
    <AdminEntityManager
      title={t('admin.testimonials.title')}
      description={t('admin.testimonials.desc')}
      fields={fields}
      columns={columns}
      hooks={testimonialHooks}
    />
  );
}

