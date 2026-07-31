import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Plus } from 'lucide-react';
import { AdminEntityManager, type EntityColumn, type EntityField } from '@/features/admin/AdminEntityManager';
import { categoryHooks, categoryTypeHooks } from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { Category, CategoryType } from '@/types/api';

const FOOD_TYPE_SUGGESTIONS = ['Sweets', 'Hots', 'Flavoured Rice', 'Biryanis', 'Fried Rice', 'Curries', 'Fries', 'Chutneys & Pickles', 'Beverages'];
const GENERAL_TYPE_SUGGESTIONS = ['Birthday', 'Marriage', 'Sound & Lighting', 'Anchoring', 'Photography'];

function QuickAddTypes({ categories, types }: { categories: Category[]; types: CategoryType[] }) {
  const { t, tf } = useTranslation();
  const createType = categoryTypeHooks.useAdminCreate();
  const [categoryId, setCategoryId] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const suggestions = selectedCategory?.isFood ? FOOD_TYPE_SUGGESTIONS : GENERAL_TYPE_SUGGESTIONS;
  const existingNames = new Set(types.filter((ty) => ty.categoryId === categoryId).map((ty) => ty.name.toLowerCase()));

  async function addSuggestion(name: string) {
    if (!categoryId || existingNames.has(name.toLowerCase())) return;
    setPending(name);
    try {
      await createType.mutateAsync({ categoryId, name });
      toast.success(`${name} ${t('admin.added')}`);
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.somethingWentWrong')));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="border-border bg-surface-muted rounded-2xl border p-5">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-gold">{t('admin.categories.quickAddTypes')}</h3>
      <p className="text-text-muted mt-1 text-sm">{t('admin.categories.quickAddTypesHint')}</p>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border-border bg-bg focus:border-gold mt-3 w-full max-w-xs rounded-lg border px-3.5 py-2.5 text-sm outline-none"
      >
        <option value="">{t('admin.selectPlaceholder')}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {tf(c.name, c.nameTe)}
          </option>
        ))}
      </select>

      {selectedCategory && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((name) => {
            const added = existingNames.has(name.toLowerCase());
            return (
              <button
                key={name}
                type="button"
                onClick={() => addSuggestion(name)}
                disabled={added || pending === name}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-70',
                  added ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600' : 'border-gold/40 text-gold hover:bg-gold hover:text-ink-black',
                )}
              >
                {added ? <Check size={13} /> : <Plus size={13} />} {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminCategoriesPage() {
  const { t, tf } = useTranslation();
  const { data: categories } = categoryHooks.useAdminList();
  const { data: types } = categoryTypeHooks.useAdminList();

  const categoryFields: EntityField<Category>[] = [
    { name: 'name', label: t('admin.categories.name'), type: 'text', required: true },
    {
      name: 'isFood',
      label: t('admin.categories.isFood'),
      type: 'checkbox',
      hint: t('admin.categories.isFoodHint'),
    },
    {
      name: 'allowMultiple',
      label: t('admin.categories.allowMultiple'),
      type: 'checkbox',
      hint: t('admin.categories.allowMultipleHint'),
    },
    { name: 'isActive', label: t('admin.categories.active'), type: 'checkbox' },
    { name: 'description', label: t('admin.categories.description'), type: 'textarea' },
    { name: 'imageUrl', label: t('admin.categories.image'), type: 'image' },
  ];

  const categoryColumns: EntityColumn<Category>[] = [
    { key: 'name', label: t('admin.categories.colName') },
    { key: 'isActive', label: t('admin.categories.colActive'), render: (c) => (c.isActive ? t('common.yes') : t('common.no')) },
  ];

  const typeFields: EntityField<CategoryType>[] = [
    {
      name: 'categoryId',
      label: t('admin.categories.type.category'),
      type: 'select',
      required: true,
      options: categories?.map((c) => ({ value: c.id, label: tf(c.name, c.nameTe) })) ?? [],
    },
    { name: 'name', label: t('admin.categories.type.name'), type: 'text', required: true },
  ];

  const typeColumns: EntityColumn<CategoryType>[] = [
    { key: 'name', label: t('admin.categories.colName') },
    {
      key: 'categoryId',
      label: t('admin.categories.type.category'),
      render: (item) => {
        const cat = categories?.find((c) => c.id === item.categoryId);
        return cat ? tf(cat.name, cat.nameTe) : '-';
      },
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <AdminEntityManager
        title={t('admin.categories.title')}
        description={t('admin.categories.desc')}
        fields={categoryFields}
        columns={categoryColumns}
        hooks={categoryHooks}
      />
      <div className="flex flex-col gap-5">
        {!!categories?.length && <QuickAddTypes categories={categories} types={types ?? []} />}
        <AdminEntityManager
          title={t('admin.categories.typesTitle')}
          description={t('admin.categories.typesDesc')}
          fields={typeFields}
          columns={typeColumns}
          hooks={categoryTypeHooks}
        />
      </div>
    </div>
  );
}
