import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, MapPin, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUploadField } from '@/features/admin/ImageUploadField';
import { useSettings, useUpdateSettings } from '@/lib/api/settings';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { useGeolocationCapture } from '@/hooks/useGeolocationCapture';
import type { SiteSettings } from '@/types/api';

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-4 py-3 text-base outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';
const sectionLabelClass = 'text-sm font-semibold tracking-wide uppercase text-gold';

type FormState = Omit<SiteSettings, 'id'>;

export function AdminSettingsPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<FormState | null>(null);
  const { locating, requestLocation } = useGeolocationCapture((coords) => {
    setForm((prev) => (prev ? { ...prev, latitude: coords.latitude, longitude: coords.longitude } : prev));
  });

  useEffect(() => {
    if (settings) {
      const { id: _id, ...rest } = settings;
      setForm(rest);
    }
  }, [settings]);

  function handleClearLocation() {
    if (!form) return;
    setForm({ ...form, latitude: null, longitude: null, mapEmbedUrl: null });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    // Fields the setup flow never asked for (Telugu translations, hero image)
    // come back from the API as `null` — the update schema only accepts them
    // being absent, not explicitly null, so drop those keys before sending.
    // latitude/longitude are the one exception: null is how the map pin gets
    // explicitly cleared, so those must be allowed through as-is.
    const payload: Record<string, unknown> = { ...form };
    for (const key of Object.keys(payload)) {
      if (key === 'latitude' || key === 'longitude') continue;
      if (payload[key] === null) delete payload[key];
    }
    try {
      await updateSettings.mutateAsync(payload);
      toast.success(t('admin.settings.updated'));
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.settings.couldNotUpdate')));
    }
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">{t('admin.settings.title')}</h1>
        <div className="border-border bg-surface mt-6 max-w-2xl rounded-2xl border p-10 text-center">
          <p className="text-rose text-base">{t('admin.settings.couldNotLoad')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
          >
            <RefreshCw size={14} /> {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !form) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">{t('admin.settings.title')}</h1>
        <p className="text-text-muted mt-4 text-base">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t('admin.settings.title')}</h1>
      <p className="text-text-muted mt-1 text-base">{t('admin.settings.subtitle')}</p>

      <form onSubmit={handleSubmit} className="border-border bg-surface mt-6 flex max-w-3xl flex-col gap-7 rounded-2xl border p-5 sm:p-7">
        <div className="flex flex-col gap-4">
          <h3 className={sectionLabelClass}>{t('admin.settings.contactSection')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t('admin.settings.businessName')}</label>
              <input className={inputClass} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.organiser')}</label>
              <input className={inputClass} value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.phone')}</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.whatsapp')}</label>
              <input className={inputClass} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.email')}</label>
              <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.address')}</label>
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('admin.settings.mapLocation')}</label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={requestLocation}
                disabled={locating}
                className="border-gold text-gold inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black disabled:opacity-50"
              >
                <MapPin size={14} />
                {locating ? t('setup.locating') : t('setup.useMyLocation')}
              </button>
              {form.latitude != null && form.longitude != null && (
                <>
                  <span className="text-text-muted inline-flex items-center gap-1 text-sm">
                    <Check size={14} className="text-emerald-500" /> {t('admin.settings.pinSet')}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="text-rose inline-flex items-center gap-1 text-sm hover:underline"
                  >
                    <X size={14} /> {t('admin.settings.clearPin')}
                  </button>
                </>
              )}
            </div>
            <p className="text-text-muted mt-1.5 text-sm">{t('admin.settings.mapLocationHint')}</p>
          </div>
          <div>
            <label className={labelClass}>{t('admin.settings.logo')}</label>
            <ImageUploadField value={form.logoUrl ?? ''} onChange={(url) => setForm({ ...form, logoUrl: url })} />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-6">
          <h3 className={sectionLabelClass}>{t('admin.settings.heroSection')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t('admin.settings.heroHeadline')}</label>
              <input className={inputClass} value={form.heroHeadline} onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.heroSubheadline')}</label>
              <textarea rows={3} className={inputClass} value={form.heroSubheadline} onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('admin.settings.heroImage')}</label>
            <ImageUploadField value={form.heroImageUrl ?? ''} onChange={(url) => setForm({ ...form, heroImageUrl: url })} />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-6">
          <h3 className={sectionLabelClass}>{t('admin.settings.introSection')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t('admin.settings.introTitle')}</label>
              <input className={inputClass} value={form.businessIntroTitle} onChange={(e) => setForm({ ...form, businessIntroTitle: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>{t('admin.settings.introText')}</label>
              <textarea rows={4} className={inputClass} value={form.businessIntroText} onChange={(e) => setForm({ ...form, businessIntroText: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('admin.settings.introImage')}</label>
            <ImageUploadField
              value={form.businessIntroImageUrl ?? ''}
              onChange={(url) => setForm({ ...form, businessIntroImageUrl: url })}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full sm:w-fit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t('admin.saving') : t('admin.settings.saveSettings')}
        </Button>
      </form>
    </div>
  );
}
