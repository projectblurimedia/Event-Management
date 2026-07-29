import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Check, Eye, EyeOff, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useCompleteSetup } from '@/lib/api/setup';
import { cn } from '@/lib/cn';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { useGeolocationCapture } from '@/hooks/useGeolocationCapture';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const setupSchema = z
  .object({
    businessName: z.string().min(1, 'Business name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    whatsapp: z.string().optional(),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    address: z.string().min(1, 'Address is required'),
    adminName: z.string().min(1, 'Your name is required'),
    adminEmail: z.string().email('Enter a valid email'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetupForm = z.infer<typeof setupSchema>;

const fieldClasses =
  'border-gold/20 bg-ink-black text-cream focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none';
const labelClasses = 'text-cream/70 mb-1.5 block text-xs font-medium';

export function SetupPage() {
  const login = useAuthStore((s) => s.login);
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const { locating, requestLocation } = useGeolocationCapture(setCoords);
  const completeSetup = useCompleteSetup();

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupForm>({ resolver: zodResolver(setupSchema) });

  async function onSubmit(values: SetupForm) {
    try {
      const { token, admin } = await completeSetup.mutateAsync({
        businessName: values.businessName,
        phone: values.phone,
        whatsapp: values.whatsapp || undefined,
        email: values.email || undefined,
        address: values.address,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        logo,
      });
      login(token, admin);
      toast.success(t('setup.success'));
      // Full navigation (not client-side routing): SetupPage renders outside
      // the router while setup is incomplete, and a fresh load re-checks
      // setup status so the real app mounts cleanly post-setup.
      window.location.href = '/admin';
    } catch (error) {
      toast.error(getErrorMessage(error, t('setup.failed')));
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('setup.title')}</title>
      </Helmet>
      <div className="bg-[image:var(--gradient-luxury)] flex min-h-screen items-center justify-center px-4 py-10">
        <div className="border-gold/20 bg-charcoal-2 w-full max-w-lg rounded-2xl border p-8 shadow-2xl">
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher mutedClassName="text-cream/70" />
          </div>
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <span className="border-gold text-gold flex h-11 w-11 items-center justify-center rounded-full border">
              <Sparkles size={20} />
            </span>
            <h1 className="text-cream text-xl font-semibold">{t('setup.title')}</h1>
            <p className="text-cream/50 text-sm">{t('setup.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <h2 className="text-gold mb-3 text-xs font-semibold tracking-wide uppercase">
                {t('setup.businessDetails')}
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label htmlFor="businessName" className={labelClasses}>
                    {t('setup.businessName')}
                  </label>
                  <input id="businessName" className={fieldClasses} {...register('businessName')} />
                  {errors.businessName && <p className="text-rose mt-1 text-xs">{errors.businessName.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className={labelClasses}>
                      {t('setup.businessPhone')}
                    </label>
                    <input id="phone" type="tel" className={fieldClasses} {...register('phone')} />
                    {errors.phone && <p className="text-rose mt-1 text-xs">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className={labelClasses}>
                      {t('setup.businessWhatsapp')}
                    </label>
                    <input id="whatsapp" type="tel" className={fieldClasses} {...register('whatsapp')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    {t('setup.businessEmail')}
                  </label>
                  <input id="email" type="email" className={fieldClasses} {...register('email')} />
                  {errors.email && <p className="text-rose mt-1 text-xs">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="address" className={labelClasses}>
                    {t('setup.businessAddress')}
                  </label>
                  <input id="address" className={fieldClasses} {...register('address')} />
                  {errors.address && <p className="text-rose mt-1 text-xs">{errors.address.message}</p>}
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={locating}
                    className="border-gold/40 text-gold mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-gold hover:text-ink-black disabled:opacity-50"
                  >
                    {coords ? <Check size={13} /> : <MapPin size={13} />}
                    {locating
                      ? t('setup.locating')
                      : coords
                        ? t('setup.locationCaptured')
                        : t('setup.useMyLocation')}
                  </button>
                  <p className="text-cream/40 mt-1 text-xs">{t('setup.locationHint')}</p>
                </div>
                <div>
                  <label htmlFor="logo" className={labelClasses}>
                    {t('setup.logo')}
                  </label>
                  <div className="flex items-center gap-3">
                    {logoPreview && (
                      <img src={logoPreview} alt="" className="border-gold/20 h-12 w-12 rounded-full border object-cover" />
                    )}
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="text-cream/70 file:border-gold/40 file:text-gold file:mr-3 file:rounded-full file:border file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:font-medium text-xs"
                    />
                  </div>
                  <p className="text-cream/40 mt-1 text-xs">{t('setup.logoHint')}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-gold mb-3 text-xs font-semibold tracking-wide uppercase">
                {t('setup.adminDetails')}
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label htmlFor="adminName" className={labelClasses}>
                    {t('setup.adminName')}
                  </label>
                  <input id="adminName" className={fieldClasses} {...register('adminName')} />
                  {errors.adminName && <p className="text-rose mt-1 text-xs">{errors.adminName.message}</p>}
                </div>
                <div>
                  <label htmlFor="adminEmail" className={labelClasses}>
                    {t('setup.adminEmail')}
                  </label>
                  <input id="adminEmail" type="email" autoComplete="username" className={fieldClasses} {...register('adminEmail')} />
                  {errors.adminEmail && <p className="text-rose mt-1 text-xs">{errors.adminEmail.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="adminPassword" className={labelClasses}>
                      {t('setup.adminPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="adminPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={cn(fieldClasses, 'pr-10')}
                        {...register('adminPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-cream/50 hover:text-cream absolute inset-y-0 right-0 flex w-10 items-center justify-center"
                        aria-label={showPassword ? t('admin.login.hidePassword') : t('admin.login.showPassword')}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.adminPassword && <p className="text-rose mt-1 text-xs">{errors.adminPassword.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className={labelClasses}>
                      {t('admin.login.confirmNewPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={cn(fieldClasses, 'pr-10')}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="text-cream/50 hover:text-cream absolute inset-y-0 right-0 flex w-10 items-center justify-center"
                        aria-label={showConfirmPassword ? t('admin.login.hidePassword') : t('admin.login.showPassword')}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-rose mt-1 text-xs">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" variant="gold" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting ? t('setup.submitting') : t('setup.submit')}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
