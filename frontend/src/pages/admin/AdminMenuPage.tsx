import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { menuCategoryHooks, menuItemHooks } from '@/lib/api/resources';
import { useTranslation } from '@/hooks/useTranslation';
import type { MenuCategory, MenuItem } from '@/types/api';

export function AdminMenuPage() {
  const { t, tf } = useTranslation();
  const { data: categories } = menuCategoryHooks.useAdminList();

  const categoryFields: EntityField<MenuCategory>[] = [
    { name: 'name', label: t('admin.menu.categoryName'), type: 'text', required: true },
    { name: 'nameTe', label: t('admin.menu.categoryNameTe'), type: 'text' },
    { name: 'slug', label: t('admin.menu.slug'), type: 'text', required: true },
    { name: 'order', label: t('admin.menu.displayOrder'), type: 'number' },
  ];

  const categoryColumns: EntityColumn<MenuCategory>[] = [
    { key: 'name', label: t('admin.menu.colName') },
    { key: 'slug', label: t('admin.menu.colSlug') },
  ];

  const itemFields: EntityField<MenuItem>[] = [
    {
      name: 'categoryId',
      label: t('admin.menu.category'),
      type: 'select',
      required: true,
      options: categories?.map((c) => ({ value: c.id, label: tf(c.name, c.nameTe) })) ?? [],
    },
    { name: 'name', label: t('admin.menu.itemName'), type: 'text', required: true },
    { name: 'nameTe', label: t('admin.menu.itemNameTe'), type: 'text' },
    { name: 'price', label: t('admin.menu.price'), type: 'number', required: true },
    {
      name: 'isVeg',
      label: t('admin.menu.vegNonVeg'),
      type: 'boolean-select',
      trueLabel: t('common.veg'),
      falseLabel: t('common.nonVeg'),
      required: true,
    },
    { name: 'isAvailable', label: t('admin.menu.available'), type: 'checkbox' },
    { name: 'isFeatured', label: t('admin.menu.featured'), type: 'checkbox' },
    { name: 'description', label: t('admin.menu.description'), type: 'textarea' },
    { name: 'imageUrl', label: t('admin.menu.image'), type: 'image' },
  ];

  const itemColumns: EntityColumn<MenuItem>[] = [
    { key: 'name', label: t('admin.menu.colName') },
    {
      key: 'categoryId',
      label: t('admin.menu.colCategory'),
      render: (item) => {
        const cat = categories?.find((c) => c.id === item.categoryId);
        return cat ? tf(cat.name, cat.nameTe) : '-';
      },
    },
    { key: 'price', label: t('admin.menu.colPrice'), render: (item) => `₹${Number(item.price).toLocaleString('en-IN')}` },
    { key: 'isVeg', label: t('admin.menu.vegNonVeg'), render: (item) => (item.isVeg ? t('common.veg') : t('common.nonVeg')) },
    {
      key: 'isAvailable',
      label: t('admin.menu.colAvailable'),
      render: (item) => (item.isAvailable ? t('common.yes') : t('common.no')),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <AdminEntityManager
        title={t('admin.menu.categoriesTitle')}
        description={t('admin.menu.categoriesDesc')}
        fields={categoryFields}
        columns={categoryColumns}
        hooks={menuCategoryHooks}
      />
      <AdminEntityManager
        title={t('admin.menu.itemsTitle')}
        description={t('admin.menu.itemsDesc')}
        fields={itemFields}
        columns={itemColumns}
        hooks={menuItemHooks}
      />
    </div>
  );
}
