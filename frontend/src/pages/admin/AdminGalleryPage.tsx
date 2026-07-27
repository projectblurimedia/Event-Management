import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { galleryHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';
import type { GalleryImage } from '@/types/api';

export function AdminGalleryPage() {
  const { t, tf } = useTranslation();

  const categoryOptions = [
    { value: 'FOOD', label: t('admin.gallery.categoryFood') },
    { value: 'DECORATION', label: t('admin.gallery.categoryDecoration') },
    { value: 'EVENT', label: t('admin.gallery.categoryEvent') },
  ];

  const fields: EntityField<GalleryImage>[] = [
    { name: 'category', label: t('admin.gallery.category'), type: 'select', options: categoryOptions, required: true },
    { name: 'order', label: t('admin.gallery.displayOrder'), type: 'number' },
    { name: 'caption', label: t('admin.gallery.caption'), type: 'text' },
    { name: 'captionTe', label: t('admin.gallery.captionTe'), type: 'text' },
    { name: 'imageUrl', label: t('admin.gallery.image'), type: 'image', required: true },
  ];

  const columns: EntityColumn<GalleryImage>[] = [
    {
      key: 'imageUrl',
      label: t('admin.gallery.colPreview'),
      render: (g) => <img src={g.imageUrl} alt={tf(g.caption ?? '', g.captionTe)} className="h-10 w-10 rounded object-cover" />,
    },
    { key: 'category', label: t('admin.gallery.colCategory') },
    { key: 'caption', label: t('admin.gallery.colCaption'), render: (g) => tf(g.caption ?? '-', g.captionTe) },
  ];

  return (
    <AdminEntityManager
      title={t('admin.gallery.title')}
      description={t('admin.gallery.desc')}
      fields={fields}
      columns={columns}
      hooks={galleryHooks}
    />
  );
}
