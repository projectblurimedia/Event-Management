import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadField } from './ImageUploadField';
import { getErrorMessage } from '@/lib/errorMessage';
import { useIsUploadingMedia } from '@/lib/api/uploads';
import { useTranslation } from '@/hooks/useTranslation';
import type { createResourceHooks } from '@/lib/api/resourceHooks';

type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image' | 'boolean-select';

export interface EntityField<T> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  /** Labels for the true/false options when type is 'boolean-select'. */
  trueLabel?: string;
  falseLabel?: string;
  /** Short helper text shown under the field, for anything non-obvious. */
  hint?: string;
}

/** Only undefined/null/'' count as "not filled in" — `false` is a real answer. */
function isEmptyValue(value: unknown) {
  return value === undefined || value === null || value === '';
}

export interface EntityColumn<T> {
  key: keyof T & string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface AdminEntityManagerProps<T extends { id: string }> {
  title: string;
  description: string;
  fields: EntityField<T>[];
  hooks: ReturnType<typeof createResourceHooks<T>>;
  columns: EntityColumn<T>[];
}

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-4 py-3 text-base outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';

export function AdminEntityManager<T extends { id: string }>({
  title,
  description,
  fields,
  hooks,
  columns,
}: AdminEntityManagerProps<T>) {
  const { t } = useTranslation();
  const { data: items, isLoading, isError, refetch } = hooks.useAdminList();
  const createMutation = hooks.useAdminCreate();
  const updateMutation = hooks.useAdminUpdate();
  const deleteMutation = hooks.useAdminDelete();
  const isUploadingMedia = useIsUploadingMedia();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!items) return items;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      columns
        .map((c) => {
          const rendered = c.render?.(item);
          return typeof rendered === 'string' ? rendered : String(item[c.key] ?? '');
        })
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [items, search, columns]);

  function openCreate() {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      defaults[f.name] = f.type === 'checkbox' ? false : '';
    });
    setFormValues(defaults);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item: T) {
    setFormValues({ ...item });
    setEditing(item);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const missing = fields.find((f) => f.required && isEmptyValue(formValues[f.name]));
    if (missing) {
      toast.error(`${missing.label} ${t('admin.isRequiredSuffix')}`);
      return;
    }

    const payload: Record<string, unknown> = { ...formValues };
    fields.forEach((f) => {
      if (f.type === 'number') payload[f.name] = Number(payload[f.name] ?? 0);
      if (f.type === 'boolean-select') payload[f.name] = payload[f.name] === true || payload[f.name] === 'true';
    });
    // Editing spreads the raw record (openEdit) into form state, so untouched
    // nullable fields (imageUrl, description, nameTe...) carry a literal
    // `null` — but the API's optional() schemas only tolerate a field being
    // absent, not explicitly null. Drop those keys so they're simply omitted.
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null) delete payload[key];
    });

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload as Partial<T> });
        toast.success(`${title} ${t('admin.updated')}`);
      } else {
        await createMutation.mutateAsync(payload as Partial<T>);
        toast.success(`${title} ${t('admin.created')}`);
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

  const [titleColumn, ...restColumns] = columns;
  const checkboxFields = fields.filter((f) => f.type === 'checkbox');
  const otherFields = fields.filter((f) => f.type !== 'checkbox');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-text-muted mt-1 text-base">{description}</p>
        </div>
        <Button onClick={openCreate}>{t('common.addNew')}</Button>
      </div>

      {!!items?.length && (
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
        {!isLoading && !isError && !!items?.length && filteredItems?.length === 0 && (
          <div className="border-border bg-surface text-text-muted rounded-2xl border p-10 text-center text-base">
            {t('admin.noSearchResults')}
          </div>
        )}
        {filteredItems?.map((item) => (
          <div key={item.id} className="border-border bg-surface rounded-2xl border p-5">
            <div className="text-base font-semibold">
              {titleColumn.render ? titleColumn.render(item) : String(item[titleColumn.key] ?? '-')}
            </div>
            {restColumns.length > 0 && (
              <div className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
                {restColumns.map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-muted font-medium">{c.label}</span>
                    <span className="text-right">{c.render ? c.render(item) : String(item[c.key] ?? '-')}</span>
                  </div>
                ))}
              </div>
            )}
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
        ))}
      </div>

      {/* Desktop: table */}
      <div className="border-border bg-surface mt-5 hidden overflow-x-auto rounded-2xl border lg:block">
        <table className="w-full text-left text-base">
          <thead className="bg-surface-muted text-text-muted text-sm uppercase">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-5 py-3.5 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-5 py-3.5 font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="text-text-muted px-5 py-10 text-center">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-10 text-center">
                  <p className="text-rose text-base">{t('admin.couldNotLoad')}</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
                  >
                    <RefreshCw size={14} /> {t('common.tryAgain')}
                  </button>
                </td>
              </tr>
            )}
            {!isLoading && !isError && items?.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-text-muted px-5 py-10 text-center">
                  {t('admin.noItemsYet')}
                </td>
              </tr>
            )}
            {!isLoading && !isError && !!items?.length && filteredItems?.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-text-muted px-5 py-10 text-center">
                  {t('admin.noSearchResults')}
                </td>
              </tr>
            )}
            {filteredItems?.map((item) => (
              <tr key={item.id} className="border-border border-t">
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3.5">
                    {c.render ? c.render(item) : String(item[c.key] ?? '-')}
                  </td>
                ))}
                <td className="px-5 py-3.5">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => openEdit(item)} className="text-gold text-sm font-semibold">
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-rose text-sm font-semibold"
                    >
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
        title={editing ? `${t('common.edit')} ${title}` : `${t('common.create')} ${title}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {otherFields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : undefined}>
                <label htmlFor={`field-${f.name}`} className={labelClass}>
                  {f.label}
                </label>
                {f.type === 'textarea' && (
                  <textarea
                    id={`field-${f.name}`}
                    rows={3}
                    className={inputClass}
                    value={String(formValues[f.name] ?? '')}
                    onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  />
                )}
                {f.type === 'select' && (
                  <select
                    id={`field-${f.name}`}
                    className={inputClass}
                    value={String(formValues[f.name] ?? '')}
                    onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  >
                    <option value="">{t('admin.selectPlaceholder')}</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
                {f.type === 'boolean-select' && (
                  <select
                    id={`field-${f.name}`}
                    className={inputClass}
                    value={formValues[f.name] === undefined || formValues[f.name] === '' ? '' : String(formValues[f.name])}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        [f.name]: e.target.value === '' ? '' : e.target.value === 'true',
                      }))
                    }
                  >
                    <option value="">{t('admin.selectPlaceholder')}</option>
                    <option value="true">{f.trueLabel ?? t('common.yes')}</option>
                    <option value="false">{f.falseLabel ?? t('common.no')}</option>
                  </select>
                )}
                {f.type === 'image' && (
                  <ImageUploadField
                    value={String(formValues[f.name] ?? '')}
                    onChange={(url) => setFormValues((v) => ({ ...v, [f.name]: url }))}
                  />
                )}
                {(f.type === 'text' || f.type === 'number') && (
                  <input
                    id={`field-${f.name}`}
                    type={f.type}
                    className={inputClass}
                    value={String(formValues[f.name] ?? '')}
                    onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  />
                )}
                {f.hint && <p className="text-text-muted mt-1.5 text-xs">{f.hint}</p>}
              </div>
            ))}
          </div>

          {checkboxFields.length > 0 && (
            <div className="border-border bg-surface-muted flex flex-wrap gap-x-6 gap-y-3 rounded-xl border p-4">
              {checkboxFields.map((f) => (
                <label
                  key={f.name}
                  htmlFor={`field-${f.name}`}
                  className="flex min-w-0 max-w-full items-start gap-2.5 text-sm font-medium"
                >
                  <input
                    id={`field-${f.name}`}
                    type="checkbox"
                    className="accent-gold mt-0.5 h-5 w-5 shrink-0"
                    checked={Boolean(formValues[f.name])}
                    onChange={(e) => setFormValues((v) => ({ ...v, [f.name]: e.target.checked }))}
                  />
                  <span>
                    {f.label}
                    {f.hint && <span className="text-text-muted mt-0.5 block text-xs font-normal">{f.hint}</span>}
                  </span>
                </label>
              ))}
            </div>
          )}

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
