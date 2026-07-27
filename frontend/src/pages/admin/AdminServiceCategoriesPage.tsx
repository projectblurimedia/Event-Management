import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { serviceCategoryHooks, serviceOptionHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';
import type { ServiceCategory, ServiceOption } from '@/types/api';

export function AdminServiceCategoriesPage() {
  const { t, tf } = useTranslation();
  const { data: categories } = serviceCategoryHooks.useAdminList();

  const categoryFields: EntityField<ServiceCategory>[] = [
    { name: 'name', label: t('admin.serviceCategories.name'), type: 'text', required: true },
    { name: 'nameTe', label: t('admin.serviceCategories.nameTe'), type: 'text' },
    { name: 'slug', label: t('admin.serviceCategories.slug'), type: 'text', required: true },
    { name: 'allowMultiple', label: t('admin.serviceCategories.allowMultiple'), type: 'checkbox' },
    { name: 'order', label: t('admin.serviceCategories.displayOrder'), type: 'number' },
    { name: 'isActive', label: t('admin.serviceCategories.active'), type: 'checkbox' },
    { name: 'description', label: t('admin.serviceCategories.description'), type: 'textarea' },
    { name: 'descriptionTe', label: t('admin.serviceCategories.descriptionTe'), type: 'textarea' },
    { name: 'imageUrl', label: t('admin.serviceCategories.image'), type: 'image' },
  ];

  const categoryColumns: EntityColumn<ServiceCategory>[] = [
    { key: 'name', label: t('admin.serviceCategories.colName') },
    {
      key: 'allowMultiple',
      label: t('admin.serviceCategories.colMultiSelect'),
      render: (c) => (c.allowMultiple ? t('common.yes') : t('common.no')),
    },
    { key: 'isActive', label: t('admin.serviceCategories.colActive'), render: (c) => (c.isActive ? t('common.yes') : t('common.no')) },
  ];

  const unitOptions = [
    { value: 'FLAT', label: t('admin.serviceCategories.flatPrice') },
    { value: 'PER_GUEST', label: t('admin.serviceCategories.perGuest') },
  ];

  const optionFields: EntityField<ServiceOption>[] = [
    {
      name: 'categoryId',
      label: t('admin.serviceCategories.optionCategory'),
      type: 'select',
      required: true,
      options: categories?.map((c) => ({ value: c.id, label: tf(c.name, c.nameTe) })) ?? [],
    },
    { name: 'name', label: t('admin.serviceCategories.optionName'), type: 'text', required: true },
    { name: 'nameTe', label: t('admin.serviceCategories.optionNameTe'), type: 'text' },
    { name: 'price', label: t('admin.serviceCategories.price'), type: 'number', required: true },
    { name: 'unit', label: t('admin.serviceCategories.pricingUnit'), type: 'select', options: unitOptions, required: true },
    { name: 'order', label: t('admin.serviceCategories.displayOrder'), type: 'number' },
    { name: 'isActive', label: t('admin.serviceCategories.active'), type: 'checkbox' },
    { name: 'description', label: t('admin.serviceCategories.description'), type: 'textarea' },
    { name: 'imageUrl', label: t('admin.serviceCategories.image'), type: 'image' },
  ];

  const optionColumns: EntityColumn<ServiceOption>[] = [
    { key: 'name', label: t('admin.serviceCategories.colName') },
    {
      key: 'categoryId',
      label: t('admin.serviceCategories.optionCategory'),
      render: (opt) => {
        const cat = categories?.find((c) => c.id === opt.categoryId);
        return cat ? tf(cat.name, cat.nameTe) : '-';
      },
    },
    {
      key: 'price',
      label: t('admin.serviceCategories.colPrice'),
      render: (opt) => `₹${Number(opt.price).toLocaleString('en-IN')} (${opt.unit})`,
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <AdminEntityManager
        title={t('admin.serviceCategories.title')}
        description={t('admin.serviceCategories.desc')}
        fields={categoryFields}
        columns={categoryColumns}
        hooks={serviceCategoryHooks}
      />
      <AdminEntityManager
        title={t('admin.serviceCategories.optionsTitle')}
        description={t('admin.serviceCategories.optionsDesc')}
        fields={optionFields}
        columns={optionColumns}
        hooks={serviceOptionHooks}
      />
    </div>
  );
}
