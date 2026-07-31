import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MultiImageUploadField } from '@/features/admin/MultiImageUploadField';
import { categoryHooks, categoryTypeHooks, itemHooks, packageHooks } from '@/lib/api/resources';
import { api } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { Item } from '@/types/api';

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-4 py-3 text-base outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';

/** Sentinel for "Custom" in the package filter — shows every category, mirroring the public booking wizard's Custom Package. */
const CUSTOM_FILTER = '__CUSTOM__';

interface ItemFormState {
  categoryId: string;
  categoryTypeId: string;
  name: string;
  nameTe: string;
  description: string;
  images: string[];
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  order: string;
  /** Only show this item when this package is selected; '' means every package. */
  restrictPackageId: string;
}

interface ItemPayload {
  categoryTypeId: string;
  name: string;
  nameTe?: string;
  description?: string;
  images: string[];
  isVeg?: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
  packageId: string | null;
}

function useItemMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['items', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['items', 'public'] });
  };

  const create = useMutation({
    mutationFn: async (data: ItemPayload) => (await api.post<Item>('/admin/items', data)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ItemPayload> }) =>
      (await api.put<Item>(`/admin/items/${id}`, data)).data,
    onSuccess: invalidate,
  });

  return { create, update };
}

const emptyForm: ItemFormState = {
  categoryId: '',
  categoryTypeId: '',
  name: '',
  nameTe: '',
  description: '',
  images: [],
  isVeg: true,
  isAvailable: true,
  isFeatured: false,
  order: '0',
  restrictPackageId: '',
};

interface CatalogItemsManagerProps {
  /** Food category vs everything else — the two admin surfaces this powers ("Menu" and "Services"). */
  foodOnly: boolean;
  title: string;
  subtitle: string;
  itemLabel: string;
  /** Label for the category-picking select + table column — "Category" on Menu, "Service" on Services. */
  categoryLabel: string;
}

type DietaryFilter = 'VEG' | 'NON_VEG' | 'BOTH';

export function CatalogItemsManager({ foodOnly, title, subtitle, itemLabel, categoryLabel }: CatalogItemsManagerProps) {
  const { t, tf } = useTranslation();
  const { data: allCategories } = categoryHooks.useAdminList();
  const { data: types } = categoryTypeHooks.useAdminList();
  const { data: allItems, isLoading, isError, refetch } = itemHooks.useAdminList();
  const { data: packages } = packageHooks.useAdminList();
  const { create: createMutation, update: updateMutation } = useItemMutations();
  const deleteMutation = itemHooks.useAdminDelete();

  const [search, setSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('BOTH');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  // Pure UI aid — narrows the category dropdown to a package's own
  // bulletins, or every category when Custom is picked. Not sent to the API.
  const [packageFilter, setPackageFilter] = useState(CUSTOM_FILTER);

  const categories = useMemo(
    () => allCategories?.filter((c) => c.isFood === foodOnly) ?? [],
    [allCategories, foodOnly],
  );
  const items = useMemo(() => {
    if (!allItems || !types) return allItems;
    const scopedTypeIds = new Set(types.filter((ty) => categories.some((c) => c.id === ty.categoryId)).map((ty) => ty.id));
    return allItems.filter((item) => scopedTypeIds.has(item.categoryTypeId));
  }, [allItems, types, categories]);

  const availableCategories = useMemo(() => {
    if (foodOnly || packageFilter === CUSTOM_FILTER) return categories;
    const pkg = packages?.find((p) => p.id === packageFilter);
    if (!pkg) return [];
    const pkgCategoryIds = new Set(pkg.categories.map((pc) => pc.categoryId));
    return categories.filter((c) => pkgCategoryIds.has(c.id));
  }, [foodOnly, packageFilter, packages, categories]);

  const typesForCategory = useMemo(
    () => types?.filter((t2) => t2.categoryId === form.categoryId) ?? [],
    [types, form.categoryId],
  );

  // When there's only one category to pick from (always true for Menu, and
  // often true for a Services page narrowed by package), skip making the
  // admin choose it — auto-select, cascading into the type too if it's also singular.
  useEffect(() => {
    if (modalOpen && !form.categoryId && availableCategories.length === 1) {
      const cat = availableCategories[0]!;
      const soleType = types?.filter((ty) => ty.categoryId === cat.id) ?? [];
      setForm((f) => ({ ...f, categoryId: cat.id, categoryTypeId: soleType.length === 1 ? soleType[0]!.id : '' }));
    }
  }, [modalOpen, availableCategories, form.categoryId, types]);

  const filteredItems = useMemo(() => {
    if (!items) return items;
    let result = items;
    if (foodOnly && dietaryFilter === 'VEG') result = result.filter((item) => item.isVeg);
    if (foodOnly && dietaryFilter === 'NON_VEG') result = result.filter((item) => !item.isVeg);
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((item) => item.name.toLowerCase().includes(q));
    return result;
  }, [items, search, foodOnly, dietaryFilter]);

  function categoryForItem(item: Item) {
    const type = types?.find((t2) => t2.id === item.categoryTypeId);
    return categories.find((c) => c.id === type?.categoryId);
  }

  function typeForItem(item: Item) {
    return types?.find((t2) => t2.id === item.categoryTypeId);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setPackageFilter(CUSTOM_FILTER);
    setModalOpen(true);
  }

  function openEdit(item: Item) {
    const type = typeForItem(item);
    setEditing(item);
    setPackageFilter(CUSTOM_FILTER);
    setForm({
      categoryId: type?.categoryId ?? '',
      categoryTypeId: item.categoryTypeId,
      name: item.name,
      nameTe: item.nameTe ?? '',
      description: item.description ?? '',
      images: item.images,
      isVeg: item.isVeg ?? true,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      order: String(item.order),
      restrictPackageId: item.packageId ?? '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.categoryTypeId) {
      toast.error(t('admin.items.typeRequired'));
      return;
    }
    const payload = {
      categoryTypeId: form.categoryTypeId,
      name: form.name,
      nameTe: form.nameTe || undefined,
      description: form.description || undefined,
      images: form.images,
      isVeg: foodOnly ? form.isVeg : undefined,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
      order: Number(form.order),
      packageId: form.restrictPackageId || null,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        toast.success(t('admin.items.updated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('admin.items.created'));
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.somethingWentWrong')));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.deleteConfirm'))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('admin.deleted'));
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.couldNotDelete')));
    }
  }

  const modalTitle = editing ? `${t('common.edit')} ${itemLabel}` : `${t('common.create')} ${itemLabel}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-text-muted mt-1 text-base">{subtitle}</p>
        </div>
        <Button onClick={openCreate}>{t('common.addNew')}</Button>
      </div>

      {!!items?.length && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="text-text-muted absolute top-1/2 left-3.5 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.searchPlaceholder')}
              className="border-border bg-surface w-full rounded-lg border py-2.5 pr-3 pl-10 text-base outline-none"
            />
          </div>
          {foodOnly && (
            <div className="flex gap-2">
              {(['VEG', 'NON_VEG', 'BOTH'] as DietaryFilter[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDietaryFilter(d)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium',
                    dietaryFilter === d ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
                  )}
                >
                  {d === 'VEG' ? t('common.veg') : d === 'NON_VEG' ? t('common.nonVeg') : t('common.both')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile / tablet: card list */}
      <div className="mt-5 flex flex-col gap-3 lg:hidden">
        {isLoading && <p className="text-text-muted py-10 text-center text-base">{t('common.loading')}</p>}
        {isError && (
          <div className="border-border bg-surface rounded-2xl border p-6 text-center">
            <p className="text-rose text-base">{t('admin.couldNotLoad')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
            >
              <RefreshCw size={14} /> {t('common.tryAgain')}
            </button>
          </div>
        )}
        {!isLoading && !isError && items?.length === 0 && (
          <div className="border-border bg-surface text-text-muted rounded-2xl border p-10 text-center text-base">
            {t('admin.noItemsYet')}
          </div>
        )}
        {filteredItems?.map((item) => {
          const cat = categoryForItem(item);
          const type = typeForItem(item);
          return (
            <div key={item.id} className="border-border bg-surface rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{tf(item.name, item.nameTe)}</p>
                  <p className="text-text-muted mt-0.5 text-sm">
                    {foodOnly
                      ? type
                        ? tf(type.name, type.nameTe)
                        : '-'
                      : cat
                        ? tf(cat.name, cat.nameTe)
                        : '-'}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                    item.isAvailable ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose/10 text-rose',
                  )}
                >
                  {item.isAvailable ? t('common.yes') : t('common.no')}
                </span>
              </div>
              <div className="border-border mt-4 flex gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="border-gold text-gold flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold"
                >
                  <Pencil size={14} /> {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="border-rose text-rose flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold"
                >
                  <Trash2 size={14} /> {t('common.delete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="border-border bg-surface mt-5 hidden overflow-x-auto rounded-2xl border lg:block">
        <table className="w-full text-left text-base">
          <thead className="bg-surface-muted text-text-muted text-sm uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">{t('admin.items.colName')}</th>
              <th className="px-5 py-3.5 font-medium">{foodOnly ? t('admin.categories.type.name') : categoryLabel}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.items.colAvailable')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-text-muted px-5 py-10 text-center">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {!isLoading && !isError && items?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-text-muted px-5 py-10 text-center">
                  {t('admin.noItemsYet')}
                </td>
              </tr>
            )}
            {filteredItems?.map((item) => {
              const cat = categoryForItem(item);
              const type = typeForItem(item);
              return (
                <tr key={item.id} className="border-border border-t">
                  <td className="px-5 py-3.5">{tf(item.name, item.nameTe)}</td>
                  <td className="px-5 py-3.5">
                    {foodOnly ? (type ? tf(type.name, type.nameTe) : '-') : cat ? tf(cat.name, cat.nameTe) : '-'}
                  </td>
                  <td className="px-5 py-3.5">{item.isAvailable ? t('common.yes') : t('common.no')}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-4">
                      <button type="button" onClick={() => openEdit(item)} className="text-gold text-sm font-semibold">
                        {t('common.edit')}
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-rose text-sm font-semibold">
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {!foodOnly && (
              <div>
                <label className={labelClass}>{t('admin.items.package')}</label>
                <select
                  className={inputClass}
                  value={packageFilter}
                  onChange={(e) => {
                    setPackageFilter(e.target.value);
                    setForm((f) => ({ ...f, categoryId: '', categoryTypeId: '' }));
                  }}
                >
                  <option value={CUSTOM_FILTER}>{t('admin.items.customAllCategories')}</option>
                  {packages?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {tf(p.name, p.nameTe)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {availableCategories.length > 1 && (
              <div>
                <label className={labelClass}>{categoryLabel}</label>
                <select
                  className={inputClass}
                  value={form.categoryId}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    const soleType = types?.filter((ty) => ty.categoryId === categoryId) ?? [];
                    setForm((f) => ({
                      ...f,
                      categoryId,
                      categoryTypeId: soleType.length === 1 ? soleType[0]!.id : '',
                    }));
                  }}
                >
                  <option value="">{t('admin.selectPlaceholder')}</option>
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {tf(c.name, c.nameTe)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {foodOnly && typesForCategory.length > 1 && (
              <div>
                <label className={labelClass}>{t('admin.categories.type.name')}</label>
                <select
                  className={inputClass}
                  value={form.categoryTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryTypeId: e.target.value }))}
                >
                  <option value="">{t('admin.selectPlaceholder')}</option>
                  {typesForCategory.map((ty) => (
                    <option key={ty.id} value={ty.id}>
                      {tf(ty.name, ty.nameTe)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {foodOnly && form.categoryId && typesForCategory.length === 0 && (
              <p className="text-text-muted -mt-2 text-xs sm:col-span-2">{t('admin.items.noTypesYet')}</p>
            )}
            <div>
              <label className={labelClass}>{t('admin.items.name')}</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('admin.items.description')}</label>
            <textarea
              rows={2}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <label className={labelClass}>{t('admin.items.images')}</label>
            <MultiImageUploadField value={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
          </div>

          {!foodOnly && (
            <div>
              <label className={labelClass}>{t('admin.items.restrictPackage')}</label>
              <select
                className={inputClass}
                value={form.restrictPackageId}
                onChange={(e) => setForm((f) => ({ ...f, restrictPackageId: e.target.value }))}
              >
                <option value="">{t('admin.items.restrictPackageAll')}</option>
                {packages?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {tf(p.name, p.nameTe)}
                  </option>
                ))}
              </select>
              <p className="text-text-muted mt-1.5 text-xs">{t('admin.items.restrictPackageHint')}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-6">
            {foodOnly && (
              <div>
                <label className={labelClass}>{t('admin.menu.vegNonVeg')}</label>
                <select
                  className={inputClass}
                  value={form.isVeg ? 'true' : 'false'}
                  onChange={(e) => setForm((f) => ({ ...f, isVeg: e.target.value === 'true' }))}
                >
                  <option value="true">{t('common.veg')}</option>
                  <option value="false">{t('common.nonVeg')}</option>
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-base">
              <input
                type="checkbox"
                className="accent-gold h-5 w-5"
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              />
              {t('admin.menu.available')}
            </label>
            <label className="flex items-center gap-2 text-base">
              <input
                type="checkbox"
                className="accent-gold h-5 w-5"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              />
              {t('admin.menu.featured')}
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? t('admin.saving')
              : editing
                ? t('common.saveChanges')
                : t('common.create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
