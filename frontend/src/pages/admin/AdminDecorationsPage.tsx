import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadField } from '@/features/admin/ImageUploadField';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { categoryHooks, categoryTypeHooks, itemHooks, eventTypeHooks } from '@/lib/api/resources';
import { useIsUploadingMedia } from '@/lib/api/uploads';
import { api } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { Item } from '@/types/api';

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-4 py-3 text-base outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';

interface DecorationFormState {
  name: string;
  eventTypeId: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  order: string;
}

interface DecorationPayload {
  categoryTypeId: string;
  name: string;
  description?: string;
  images: string[];
  isAvailable: boolean;
  order: number;
  eventTypeId: string | null;
}

const emptyForm: DecorationFormState = {
  name: '',
  eventTypeId: '',
  description: '',
  imageUrl: '',
  isAvailable: true,
  order: '0',
};

function useDecorationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['items', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['items', 'public'] });
  };
  const create = useMutation({
    mutationFn: async (data: DecorationPayload) => (await api.post<Item>('/admin/items', data)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DecorationPayload> }) =>
      (await api.put<Item>(`/admin/items/${id}`, data)).data,
    onSuccess: invalidate,
  });
  return { create, update };
}

export function AdminDecorationsPage() {
  const { t, tf } = useTranslation();
  const { data: categories } = categoryHooks.useAdminList();
  const { data: types } = categoryTypeHooks.useAdminList();
  const { data: allItems, isLoading, isError, refetch } = itemHooks.useAdminList();
  const { data: eventTypes } = eventTypeHooks.useAdminList();
  const { create: createMutation, update: updateMutation } = useDecorationMutations();
  const deleteMutation = itemHooks.useAdminDelete();
  const isUploadingMedia = useIsUploadingMedia();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<DecorationFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);

  const decorationCategory = categories?.find((c) => c.isDecoration);
  const decorationTypeId = types?.find((ty) => ty.categoryId === decorationCategory?.id)?.id;

  const decorations = useMemo(
    // eventTypeId is required going forward — this also quietly hides any
    // legacy pre-event-type rows still kept around for booking history.
    () => allItems?.filter((item) => item.categoryTypeId === decorationTypeId && item.eventTypeId) ?? [],
    [allItems, decorationTypeId],
  );

  const filteredDecorations = useMemo(() => {
    let result = decorations;
    if (eventTypeFilter) result = result.filter((item) => item.eventTypeId === eventTypeFilter);
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((item) => item.name.toLowerCase().includes(q));
    return result;
  }, [decorations, eventTypeFilter, search]);

  function eventTypeName(item: Item) {
    const et = eventTypes?.find((e) => e.id === item.eventTypeId);
    return et ? tf(et.name, et.nameTe) : t('admin.decorations.noEventType');
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setForm({
      name: item.name,
      eventTypeId: item.eventTypeId ?? '',
      description: item.description ?? '',
      imageUrl: item.images[0] ?? '',
      isAvailable: item.isAvailable,
      order: String(item.order),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!decorationTypeId) return;
    if (!form.name.trim()) {
      toast.error(`${t('admin.decorations.name')} ${t('admin.isRequiredSuffix')}`);
      return;
    }
    if (!form.eventTypeId) {
      toast.error(`${t('admin.decorations.eventType')} ${t('admin.isRequiredSuffix')}`);
      return;
    }

    const payload: DecorationPayload = {
      categoryTypeId: decorationTypeId,
      name: form.name,
      description: form.description || undefined,
      images: form.imageUrl ? [form.imageUrl] : [],
      isAvailable: form.isAvailable,
      order: Number(form.order),
      eventTypeId: form.eventTypeId,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        toast.success(t('admin.updated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('admin.created'));
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('admin.decorations.title')}</h1>
          <p className="text-text-muted mt-1 text-base">{t('admin.decorations.desc')}</p>
        </div>
        <Button onClick={openCreate} disabled={!decorationTypeId}>
          {t('common.addNew')}
        </Button>
      </div>

      {!!decorations.length && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="text-text-muted absolute top-1/2 left-3.5 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.searchPlaceholder')}
              className="border-border bg-surface w-full rounded-lg border py-2.5 pr-3 pl-10 text-base outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEventTypeFilter(null)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium',
                eventTypeFilter === null ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
              )}
            >
              {t('common.all')}
            </button>
            {eventTypes?.map((et) => (
              <button
                key={et.id}
                type="button"
                onClick={() => setEventTypeFilter(et.id)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium',
                  eventTypeFilter === et.id ? 'bg-gold text-ink-black border-gold' : 'border-border text-text-muted',
                )}
              >
                {tf(et.name, et.nameTe)}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && <p className="text-text-muted py-10 text-center text-base">{t('common.loading')}</p>}
      {isError && (
        <div className="border-border bg-surface mt-5 rounded-2xl border p-6 text-center">
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
      {!isLoading && !isError && decorations.length === 0 && (
        <div className="border-border bg-surface text-text-muted mt-5 rounded-2xl border p-10 text-center text-base">
          {t('admin.noItemsYet')}
        </div>
      )}
      {!isLoading && !isError && !!decorations.length && filteredDecorations.length === 0 && (
        <div className="border-border bg-surface text-text-muted mt-5 rounded-2xl border p-10 text-center text-base">
          {t('admin.noSearchResults')}
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDecorations.map((item) => (
          <div key={item.id} className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border">
            <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-1 flex-col gap-1 p-4">
              <span className="text-gold text-xs font-semibold tracking-wide uppercase">{eventTypeName(item)}</span>
              <h3 className="text-sm font-semibold">{tf(item.name, item.nameTe)}</h3>
              {item.description && <p className="text-text-muted mt-0.5 line-clamp-2 text-sm">{item.description}</p>}
              <span
                className={`mt-1 w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${item.isAvailable ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose/10 text-rose'}`}
              >
                {item.isAvailable ? t('common.yes') : t('common.no')}
              </span>
              <div className="mt-3 flex gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="border-gold text-gold flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-semibold"
                >
                  <Pencil size={13} /> {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="border-rose text-rose flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-semibold"
                >
                  <Trash2 size={13} /> {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `${t('common.edit')} ${t('admin.decorations.title')}` : `${t('common.create')} ${t('admin.decorations.title')}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t('admin.decorations.name')}</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.decorations.eventType')}</label>
              <select
                className={inputClass}
                value={form.eventTypeId}
                onChange={(e) => setForm((f) => ({ ...f, eventTypeId: e.target.value }))}
              >
                <option value="">{t('admin.selectPlaceholder')}</option>
                {eventTypes?.map((et) => (
                  <option key={et.id} value={et.id}>
                    {tf(et.name, et.nameTe)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('admin.decorations.image')}</label>
            <ImageUploadField value={form.imageUrl} onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))} />
          </div>

          <div>
            <label className={labelClass}>{t('admin.decorations.description')}</label>
            <textarea
              rows={3}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className={labelClass}>{t('admin.categories.displayOrder')}</label>
              <input
                type="number"
                className={`${inputClass} w-28`}
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-base">
              <input
                type="checkbox"
                className="accent-gold h-5 w-5"
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              />
              {t('admin.menu.available')}
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={createMutation.isPending || updateMutation.isPending || isUploadingMedia}
          >
            {isUploadingMedia
              ? t('admin.uploading')
              : createMutation.isPending || updateMutation.isPending
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
