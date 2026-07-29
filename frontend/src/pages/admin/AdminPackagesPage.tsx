import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, Pencil, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadField } from '@/features/admin/ImageUploadField';
import { CategoryPicker } from '@/features/admin/CategoryPicker';
import { packageHooks, categoryHooks } from '@/lib/api/resources';
import { api } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { Category, Package } from '@/types/api';

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-4 py-3 text-base outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';
const sectionLabelClass = 'text-sm font-semibold tracking-wide uppercase text-gold';

interface PackagePayload {
  name: string;
  nameTe?: string;
  imageUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  categoryIds: string[];
}

function usePackageMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['packages'] });

  const create = useMutation({
    mutationFn: async (data: PackagePayload) => (await api.post<Package>('/admin/packages', data)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PackagePayload> }) =>
      (await api.put<Package>(`/admin/packages/${id}`, data)).data,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/packages/${id}`);
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function AdminPackagesPage() {
  const { t, tf } = useTranslation();
  const { data: packages, isLoading, isError, refetch } = packageHooks.useAdminList();
  const { data: categories } = categoryHooks.useAdminList();
  const { create, update, remove } = usePackageMutations();

  const [search, setSearch] = useState('');
  const filteredPackages = useMemo(() => {
    if (!packages) return packages;
    const q = search.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter((pkg) => pkg.name.toLowerCase().includes(q) || (pkg.nameTe ?? '').toLowerCase().includes(q));
  }, [packages, search]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState({ name: '', nameTe: '', imageUrl: '', isFeatured: false, isActive: true, order: '0' });
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightIndex === null) return;
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const timer = setTimeout(() => setHighlightIndex(null), 1400);
    return () => clearTimeout(timer);
  }, [highlightIndex]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', nameTe: '', imageUrl: '', isFeatured: false, isActive: true, order: '0' });
    setSelectedCategories([]);
    setModalOpen(true);
  }

  function openEdit(pkg: Package) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      nameTe: pkg.nameTe ?? '',
      imageUrl: pkg.imageUrl ?? '',
      isFeatured: pkg.isFeatured,
      isActive: pkg.isActive,
      order: String(pkg.order),
    });
    setSelectedCategories(pkg.categories.map((pc) => pc.category));
    setModalOpen(true);
  }

  function addCategory(category: Category) {
    setSelectedCategories((prev) => {
      const next = [...prev, category];
      setHighlightIndex(next.length - 1);
      return next;
    });
  }

  function moveCategory(index: number, direction: -1 | 1) {
    setSelectedCategories((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeCategory(index: number) {
    setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: PackagePayload = {
      name: form.name,
      nameTe: form.nameTe || undefined,
      imageUrl: form.imageUrl || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      order: Number(form.order) || 0,
      categoryIds: selectedCategories.map((c) => c.id),
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: payload });
        toast.success(t('admin.packages.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('admin.packages.created'));
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.somethingWentWrong')));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.packages.deleteConfirm'))) return;
    try {
      await remove.mutateAsync(id);
      toast.success(t('admin.deleted'));
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.packages.couldNotDelete')));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('admin.packages.title')}</h1>
          <p className="text-text-muted mt-1 text-base">{t('admin.packages.subtitle')}</p>
        </div>
        <Button onClick={openCreate}>{t('common.addNew')}</Button>
      </div>

      {!!packages?.length && (
        <div className="relative mt-5 w-full sm:w-80">
          <Search size={15} className="text-text-muted absolute top-1/2 left-3.5 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.searchPlaceholder')}
            className="border-border bg-surface w-full rounded-lg border py-2.5 pr-3 pl-10 text-base outline-none"
          />
        </div>
      )}

      {/* Mobile / tablet: card list */}
      <div className="mt-5 flex flex-col gap-3 lg:hidden">
        {isLoading && <p className="text-text-muted py-10 text-center text-base">{t('common.loading')}</p>}
        {isError && (
          <div className="border-border bg-surface rounded-2xl border p-6 text-center">
            <p className="text-rose text-base">{t('admin.packages.couldNotLoad')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
            >
              <RefreshCw size={14} /> {t('common.tryAgain')}
            </button>
          </div>
        )}
        {!isLoading && !isError && !!packages?.length && filteredPackages?.length === 0 && (
          <div className="border-border bg-surface text-text-muted rounded-2xl border p-10 text-center text-base">
            {t('admin.noSearchResults')}
          </div>
        )}
        {filteredPackages?.map((pkg) => (
          <div key={pkg.id} className="border-border bg-surface rounded-2xl border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                {pkg.isFeatured && (
                  <span className="bg-gold/10 text-gold rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
                    {t('packages.mostPopular')}
                  </span>
                )}
                <p className="mt-1.5 text-base font-semibold">{tf(pkg.name, pkg.nameTe)}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${pkg.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-muted text-text-muted'}`}
              >
                {pkg.isActive ? t('admin.active') : t('admin.inactive')}
              </span>
            </div>
            <div className="border-border mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-text-muted">{t('admin.packages.categoriesCol')}</span>
              <span className="font-medium">{pkg.categories.length}</span>
            </div>
            <div className="border-border mt-4 flex gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => openEdit(pkg)}
                className="border-gold text-gold flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold"
              >
                <Pencil size={14} /> {t('common.edit')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pkg.id)}
                className="border-rose text-rose flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold"
              >
                <Trash2 size={14} /> {t('common.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="border-border bg-surface mt-5 hidden overflow-x-auto rounded-2xl border lg:block">
        <table className="w-full text-left text-base">
          <thead className="bg-surface-muted text-text-muted text-sm uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">{t('admin.packages.name')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.packages.categoriesCol')}</th>
              <th className="px-5 py-3.5 font-medium">{t('packages.mostPopular')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.active')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-text-muted px-5 py-10 text-center">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {!isLoading && !isError && !!packages?.length && filteredPackages?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-text-muted px-5 py-10 text-center">
                  {t('admin.noSearchResults')}
                </td>
              </tr>
            )}
            {filteredPackages?.map((pkg) => (
              <tr key={pkg.id} className="border-border border-t">
                <td className="px-5 py-3.5">{tf(pkg.name, pkg.nameTe)}</td>
                <td className="text-text-muted px-5 py-3.5 text-sm">{pkg.categories.length}</td>
                <td className="px-5 py-3.5">{pkg.isFeatured ? t('common.yes') : t('common.no')}</td>
                <td className="px-5 py-3.5">{pkg.isActive ? t('common.yes') : t('common.no')}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => openEdit(pkg)} className="text-gold text-sm font-semibold">
                      {t('common.edit')}
                    </button>
                    <button type="button" onClick={() => handleDelete(pkg.id)} className="text-rose text-sm font-semibold">
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('admin.packages.editTitle') : t('admin.packages.addTitle')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h3 className={sectionLabelClass}>{t('admin.packages.detailsSection')}</h3>
            <div>
              <label className={labelClass}>{t('admin.packages.name')}</label>
              <input
                className={inputClass}
                placeholder={t('admin.packages.namePlaceholder')}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>{t('admin.packages.image')}</label>
              <ImageUploadField value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
            </div>
            <label className="flex items-center gap-2 text-base">
              <input
                type="checkbox"
                className="accent-gold h-5 w-5"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              />
              {t('admin.packages.featuredHint')}
            </label>
            <label className="flex items-center gap-2 text-base">
              <input
                type="checkbox"
                className="accent-gold h-5 w-5"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              {t('admin.packages.activeHint')}
            </label>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3 border-t pt-6">
            <div>
              <h3 className={sectionLabelClass}>{t('admin.packages.categoriesSection')}</h3>
              <p className="text-text-muted mt-1 text-sm">{t('admin.packages.categoriesHint')}</p>
            </div>

            <CategoryPicker
              categories={categories ?? []}
              excludeIds={selectedCategories.map((c) => c.id)}
              onSelect={addCategory}
            />

            <div className="border-border flex flex-col gap-2 rounded-xl border p-3">
              {selectedCategories.length === 0 && (
                <p className="text-text-muted px-2 py-4 text-center text-sm">{t('admin.packages.noCategoriesAdded')}</p>
              )}
              {selectedCategories.map((c, index) => (
                <div
                  key={c.id}
                  className={cn(
                    'bg-surface-muted flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm transition-colors duration-500',
                    highlightIndex === index && 'bg-gold/20 ring-gold ring-1',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-gold/10 text-gold flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium">{tf(c.name, c.nameTe)}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveCategory(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="text-text-muted hover:text-gold hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(index, 1)}
                      disabled={index === selectedCategories.length - 1}
                      aria-label="Move down"
                      className="text-text-muted hover:text-gold hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      aria-label="Remove"
                      className="text-rose hover:bg-rose/10 flex h-8 w-8 items-center justify-center rounded-full"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
              <div ref={listEndRef} />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? t('admin.saving') : editing ? t('common.saveChanges') : t('common.create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
