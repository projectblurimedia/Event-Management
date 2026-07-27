import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { faqHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';
import type { FAQ } from '@/types/api';

export function AdminFaqsPage() {
  const { t } = useTranslation();

  const fields: EntityField<FAQ>[] = [
    { name: 'question', label: t('admin.faqs.question'), type: 'text', required: true },
    { name: 'questionTe', label: t('admin.faqs.questionTe'), type: 'text' },
    { name: 'order', label: t('admin.faqs.displayOrder'), type: 'number' },
    { name: 'isPublished', label: t('admin.faqs.published'), type: 'checkbox' },
    { name: 'answer', label: t('admin.faqs.answer'), type: 'textarea', required: true },
    { name: 'answerTe', label: t('admin.faqs.answerTe'), type: 'textarea' },
  ];

  const columns: EntityColumn<FAQ>[] = [
    { key: 'question', label: t('admin.faqs.colQuestion') },
    { key: 'isPublished', label: t('admin.faqs.colPublished'), render: (f) => (f.isPublished ? t('common.yes') : t('common.no')) },
  ];

  return (
    <AdminEntityManager
      title={t('admin.faqs.title')}
      description={t('admin.faqs.desc')}
      fields={fields}
      columns={columns}
      hooks={faqHooks}
    />
  );
}
