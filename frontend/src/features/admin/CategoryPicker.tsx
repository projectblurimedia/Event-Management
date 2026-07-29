import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { categoryHooks } from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/api';

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface CategoryPickerProps {
  categories: Category[];
  excludeIds: string[];
  onSelect: (category: Category) => void;
}

/**
 * Type a category name and add it — no browsing dropdown. If a category
 * with that name already exists, it's reused; otherwise a new one is
 * created (default pricing: flat) and added in one step. Full details
 * (pricing mode, food flag, etc.) can be refined later in Admin > Categories.
 */
export function CategoryPicker({ categories, excludeIds, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();
  const createCategory = categoryHooks.useAdminCreate();
  const [name, setName] = useState('');
  const [pricingMode, setPricingMode] = useState<'FLAT' | 'PER_PERSON'>('FLAT');

  const existingMatch = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (existingMatch) {
      if (excludeIds.includes(existingMatch.id)) {
        toast.error(t('admin.packages.categoryAlreadyAdded'));
        return;
      }
      onSelect(existingMatch);
      setName('');
      return;
    }

    try {
      const created = await createCategory.mutateAsync({
        name: trimmed,
        slug: slugify(trimmed) || `category-${Date.now()}`,
        pricingMode,
      });
      toast.success(t('admin.packages.categoryCreated'));
      onSelect(created);
      setName('');
      setPricingMode('FLAT');
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.somethingWentWrong')));
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        placeholder={t('admin.packages.categoryNamePlaceholder')}
        className="border-border bg-bg focus:border-gold min-w-0 flex-1 rounded-lg border px-4 py-3 text-base outline-none"
      />
      {!existingMatch && (
        <select
          value={pricingMode}
          onChange={(e) => setPricingMode(e.target.value as 'FLAT' | 'PER_PERSON')}
          title={t('admin.categories.pricingModeHint')}
          className="border-border bg-bg focus:border-gold shrink-0 rounded-lg border px-3 py-3 text-sm outline-none"
        >
          <option value="FLAT">{t('admin.categories.flatPrice')}</option>
          <option value="PER_PERSON">{t('admin.categories.perPerson')}</option>
        </select>
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!name.trim() || createCategory.isPending}
        className="bg-gold text-ink-black flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
      >
        <Plus size={15} /> {createCategory.isPending ? t('admin.saving') : t('common.add')}
      </button>
    </div>
  );
}
