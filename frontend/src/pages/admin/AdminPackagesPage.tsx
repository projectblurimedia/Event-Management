import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, Pencil, Plus, RefreshCw, Sparkles, Trash2, UtensilsCrossed, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadField } from '@/features/admin/ImageUploadField';
import { packageHooks, serviceCategoryHooks } from '@/lib/api/resources';
import { api } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { Package, PackageStepKind, PackageTier } from '@/types/api';

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-4 py-3 text-base outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';
const sectionLabelClass = 'text-sm font-semibold tracking-wide uppercase text-gold';

interface StepFormRow {
  kind: PackageStepKind;
  serviceCategoryId?: string;
  label: string;
  labelTe?: string | null;
}

interface PackagePayload {
  tier: PackageTier;
  name: string;
  nameTe?: string;
  description: string;
  descriptionTe?: string;
  pricePerGuest: number;
  imageUrl?: string;
  isActive: boolean;
  items: { label: string; labelTe?: string }[];
  steps: { kind: PackageStepKind; serviceCategoryId?: string }[];
}

/** Encodes "English | Telugu" per line so the admin can edit both in one textarea. */
function parseItemsText(text: string): { label: string; labelTe?: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, labelTe] = line.split('|').map((part) => part.trim());
      return labelTe ? { label, labelTe } : { label };
    });
}

function formatItemsText(items: { label: string; labelTe?: string | null }[]): string {
  return items.map((item) => (item.labelTe ? `${item.label} | ${item.labelTe}` : item.label)).join('\n');
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
  const { data: categories } = serviceCategoryHooks.useAdminList();
  const { create, update, remove } = usePackageMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState({
    tier: 'SILVER' as PackageTier,
    name: '',
    nameTe: '',
    description: '',
    descriptionTe: '',
    pricePerGuest: '',
    imageUrl: '',
    isActive: true,
    itemsText: '',
  });
  const [steps, setSteps] = useState<StepFormRow[]>([]);
  const [categoryToAdd, setCategoryToAdd] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightIndex === null) return;
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const timer = setTimeout(() => setHighlightIndex(null), 1400);
    return () => clearTimeout(timer);
  }, [highlightIndex]);

  function openCreate() {
    setEditing(null);
    setForm({
      tier: 'SILVER',
      name: '',
      nameTe: '',
      description: '',
      descriptionTe: '',
      pricePerGuest: '',
      imageUrl: '',
      isActive: true,
      itemsText: '',
    });
    setSteps([]);
    setCategoryToAdd('');
    setModalOpen(true);
  }

  function openEdit(pkg: Package) {
    setEditing(pkg);
    setForm({
      tier: pkg.tier,
      name: pkg.name,
      nameTe: pkg.nameTe ?? '',
      description: pkg.description,
      descriptionTe: pkg.descriptionTe ?? '',
      pricePerGuest: pkg.pricePerGuest,
      imageUrl: pkg.imageUrl ?? '',
      isActive: pkg.isActive,
      itemsText: formatItemsText(pkg.items),
    });
    setSteps(
      pkg.steps.map((s) => ({
        kind: s.kind,
        serviceCategoryId: s.serviceCategoryId ?? undefined,
        label: s.kind === 'FOOD' ? t('admin.packages.food') : (s.serviceCategory?.name ?? '—'),
        labelTe: s.kind === 'FOOD' ? undefined : s.serviceCategory?.nameTe,
      })),
    );
    setCategoryToAdd('');
    setModalOpen(true);
  }

  function addFoodStep() {
    if (steps.some((s) => s.kind === 'FOOD')) {
      toast.error(t('admin.packages.foodStepDuplicate'));
      return;
    }
    setSteps((prev) => {
      const next = [...prev, { kind: 'FOOD' as const, label: t('admin.packages.food') }];
      setHighlightIndex(next.length - 1);
      return next;
    });
    toast.success(t('admin.packages.foodStepAdded'));
  }

  function addCategoryStep() {
    const cat = categories?.find((c) => c.id === categoryToAdd);
    if (!cat) return;
    setSteps((prev) => {
      const next = [...prev, { kind: 'SERVICE_CATEGORY' as const, serviceCategoryId: cat.id, label: cat.name, labelTe: cat.nameTe }];
      setHighlightIndex(next.length - 1);
      return next;
    });
    toast.success(`${tf(cat.name, cat.nameTe)} ${t('admin.packages.stepAdded')}`);
    setCategoryToAdd('');
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: PackagePayload = {
      tier: form.tier,
      name: form.name,
      nameTe: form.nameTe || undefined,
      description: form.description,
      descriptionTe: form.descriptionTe || undefined,
      pricePerGuest: Number(form.pricePerGuest),
      imageUrl: form.imageUrl || undefined,
      isActive: form.isActive,
      items: parseItemsText(form.itemsText),
      steps: steps.map((s) => ({ kind: s.kind, serviceCategoryId: s.serviceCategoryId })),
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

      {/* Mobile / tablet: card list */}
      <div className="mt-6 flex flex-col gap-3 lg:hidden">
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
        {packages?.map((pkg) => (
          <div key={pkg.id} className="border-border bg-surface rounded-2xl border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="bg-gold/10 text-gold rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
                  {pkg.tier}
                </span>
                <p className="mt-1.5 text-base font-semibold">{tf(pkg.name, pkg.nameTe)}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${pkg.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-muted text-text-muted'}`}
              >
                {pkg.isActive ? t('admin.active') : t('admin.inactive')}
              </span>
            </div>
            <div className="border-border mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-text-muted">{t('admin.packages.priceGuest')}</span>
              <span className="text-gold text-base font-semibold">₹{Number(pkg.pricePerGuest).toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-text-muted">{t('admin.packages.wizardSteps')}</span>
              <span className="font-medium">
                {pkg.steps.length} {t('admin.packages.stepsSuffix')}
              </span>
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
      <div className="border-border bg-surface mt-6 hidden overflow-x-auto rounded-2xl border lg:block">
        <table className="w-full text-left text-base">
          <thead className="bg-surface-muted text-text-muted text-sm uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">{t('admin.packages.tier')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.packages.name')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.packages.priceGuest')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.packages.wizardSteps')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.active')}</th>
              <th className="px-5 py-3.5 font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-text-muted px-5 py-10 text-center">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <p className="text-rose text-base">{t('admin.packages.couldNotLoad')}</p>
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
            {packages?.map((pkg) => (
              <tr key={pkg.id} className="border-border border-t">
                <td className="px-5 py-3.5">{pkg.tier}</td>
                <td className="px-5 py-3.5">{tf(pkg.name, pkg.nameTe)}</td>
                <td className="px-5 py-3.5">₹{Number(pkg.pricePerGuest).toLocaleString('en-IN')}</td>
                <td className="text-text-muted px-5 py-3.5 text-sm">
                  {pkg.steps.length} {t('admin.packages.stepsSuffix')}
                </td>
                <td className="px-5 py-3.5">{pkg.isActive ? t('common.yes') : t('common.no')}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => openEdit(pkg)} className="text-gold text-sm font-semibold">
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pkg.id)}
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
        title={editing ? t('admin.packages.editTitle') : t('admin.packages.addTitle')}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Package details */}
          <div className="flex flex-col gap-4">
            <h3 className={sectionLabelClass}>{t('admin.packages.detailsSection')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{t('admin.packages.tier')}</label>
                <select
                  className={inputClass}
                  value={form.tier}
                  onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as PackageTier }))}
                >
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('admin.packages.pricePerGuest')}</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.pricePerGuest}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerGuest: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass}>{t('admin.packages.name')}</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>{t('admin.packages.nameTe')}</label>
                <input className={inputClass} value={form.nameTe} onChange={(e) => setForm((f) => ({ ...f, nameTe: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>{t('admin.packages.description')}</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass}>{t('admin.packages.descriptionTe')}</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={form.descriptionTe}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionTe: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('admin.packages.image')}</label>
              <ImageUploadField value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
            </div>
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

          {/* Included items */}
          <div className="flex flex-col gap-2 border-t pt-6">
            <h3 className={sectionLabelClass}>{t('admin.packages.includedItemsSection')}</h3>
            <p className="text-text-muted text-sm">{t('admin.packages.includedItemsHint')}</p>
            <textarea
              rows={5}
              className={inputClass}
              value={form.itemsText}
              onChange={(e) => setForm((f) => ({ ...f, itemsText: e.target.value }))}
            />
          </div>

          {/* Wizard steps */}
          <div className="flex flex-col gap-3 border-t pt-6">
            <div>
              <h3 className={sectionLabelClass}>{t('admin.packages.wizardFlowSection')}</h3>
              <p className="text-text-muted mt-1 text-sm">{t('admin.packages.wizardFlowHint')}</p>
            </div>

            <div className="border-border bg-surface-muted flex flex-col gap-3 rounded-xl border p-4">
              <p className="text-text-muted text-xs font-semibold tracking-wide uppercase">{t('admin.packages.addStep')}</p>
              <Button type="button" variant="outline" size="sm" onClick={addFoodStep} className="w-full sm:w-fit">
                <UtensilsCrossed size={14} /> {t('admin.packages.foodStep')}
              </Button>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <select
                  className="border-border bg-bg focus:border-gold min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none"
                  value={categoryToAdd}
                  onChange={(e) => setCategoryToAdd(e.target.value)}
                >
                  <option value="">{t('admin.packages.selectServiceCategory')}</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {tf(c.name, c.nameTe)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCategoryStep}
                  disabled={!categoryToAdd}
                  className="w-full shrink-0 sm:w-fit"
                >
                  <Plus size={14} /> {t('admin.packages.addStepBtn')}
                </Button>
              </div>
              {!categories?.length && <p className="text-text-muted text-xs">{t('admin.packages.noCategoriesYet')}</p>}
            </div>

            <div className="border-border flex flex-col gap-2 rounded-xl border p-3">
              {steps.length === 0 && (
                <p className="text-text-muted px-2 py-4 text-center text-sm">{t('admin.packages.noStepsYet')}</p>
              )}
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'bg-surface-muted flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm transition-colors duration-500',
                    highlightIndex === index && 'bg-gold/20 ring-gold ring-1',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-gold/10 text-gold flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    {step.kind === 'FOOD' ? (
                      <UtensilsCrossed size={15} className="text-gold shrink-0" />
                    ) : (
                      <Sparkles size={15} className="text-gold shrink-0" />
                    )}
                    <span className="truncate font-medium">{tf(step.label, step.labelTe)}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                      aria-label="Move up"
                      className="text-text-muted hover:text-gold hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, 1)}
                      disabled={index === steps.length - 1}
                      title="Move down"
                      aria-label="Move down"
                      className="text-text-muted hover:text-gold hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      title="Remove step"
                      aria-label="Remove step"
                      className="text-rose hover:bg-rose/10 flex h-8 w-8 items-center justify-center rounded-full"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={create.isPending || update.isPending}
          >
            {create.isPending || update.isPending ? t('admin.saving') : editing ? t('common.saveChanges') : t('common.create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
