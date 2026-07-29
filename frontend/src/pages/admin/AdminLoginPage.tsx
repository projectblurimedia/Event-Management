import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { useSettings } from '@/lib/api/settings';
import { cn } from '@/lib/cn';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

type Mode = 'login' | 'forgot-request' | 'forgot-verify' | 'forgot-reset' | 'forgot-success';

const fieldClasses =
  'border-gold/20 bg-ink-black text-cream focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none';
const labelClasses = 'text-cream/70 mb-1.5 block text-xs font-medium';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mode, setMode] = useState<Mode>('login');
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const businessName = settings?.businessName ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Already signed in (e.g. navigated here directly, or clicked the header
  // Admin link while the session from earlier today/this week is still
  // valid) — skip straight to the dashboard instead of re-prompting.
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const passwordChecks = (pw: string) => [
    { label: t('admin.login.check8Chars'), pass: pw.length >= 8 },
    { label: t('admin.login.checkUppercase'), pass: /[A-Z]/.test(pw) },
    { label: t('admin.login.checkLowercase'), pass: /[a-z]/.test(pw) },
    { label: t('admin.login.checkNumber'), pass: /\d/.test(pw) },
    { label: t('admin.login.checkSpecial'), pass: /[^A-Za-z0-9]/.test(pw) },
  ];

  // Forgot-password flow state — email is fetched from the admin's own
  // registered account (there's only ever one admin), not typed by hand.
  const [identifier, setIdentifier] = useState('');
  const [identifierLoading, setIdentifierLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    try {
      const { data } = await api.post('/admin/auth/login', values);
      login(data.token, data.admin);
      navigate('/admin');
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.login.invalidCredentials')));
    }
  }

  function resetForgotState() {
    setIdentifier('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function openForgotPassword() {
    resetForgotState();
    setMode('forgot-request');
    setIdentifierLoading(true);
    try {
      const { data } = await api.get('/admin/auth/forgot-password/identifier');
      setIdentifier(data.email ?? '');
    } catch {
      setIdentifier('');
    } finally {
      setIdentifierLoading(false);
    }
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error(t('admin.login.noRegisteredEmail'));
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/admin/auth/forgot-password/request', { identifier, channel: 'EMAIL' });
      toast.success(data.message ?? t('admin.login.otpSentDefault'));
      setMode('forgot-verify');
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.login.otpSendFailed')));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error(t('admin.login.enter6DigitOtp'));
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/admin/auth/forgot-password/verify', { identifier, channel: 'EMAIL', otp });
      setResetToken(data.resetToken);
      setMode('forgot-reset');
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.login.otpIncorrect')));
    } finally {
      setBusy(false);
    }
  }

  async function handleResendOtp() {
    setBusy(true);
    try {
      const { data } = await api.post('/admin/auth/forgot-password/request', { identifier, channel: 'EMAIL' });
      toast.success(data.message ?? t('admin.login.otpResentDefault'));
      setOtp('');
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.login.otpResendFailed')));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    const checks = passwordChecks(newPassword);
    if (!checks.every((c) => c.pass)) {
      toast.error(t('admin.login.passwordRulesFailed'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('admin.login.passwordsDoNotMatch'));
      return;
    }
    setBusy(true);
    try {
      await api.post('/admin/auth/forgot-password/reset', { resetToken, newPassword });
      setMode('forgot-success');
    } catch (error) {
      toast.error(getErrorMessage(error, t('admin.login.resetFailed')));
    } finally {
      setBusy(false);
    }
  }

  const checks = passwordChecks(newPassword);

  return (
    <>
      <Helmet>
        <title>Admin Login{businessName ? ` | ${businessName}` : ''}</title>
      </Helmet>
      <div className="bg-[image:var(--gradient-luxury)] flex min-h-screen items-center justify-center px-4 py-10">
        <div className="border-gold/20 bg-charcoal-2 w-full max-w-sm rounded-2xl border p-8 shadow-2xl">
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher mutedClassName="text-cream/70" />
          </div>
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={businessName} className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="border-gold text-gold font-display flex h-11 w-11 items-center justify-center rounded-full border text-lg font-semibold">
                {businessName.trim().charAt(0).toUpperCase() || '—'}
              </span>
            )}
            <h1 className="text-cream text-xl font-semibold">
              {mode === 'login' && t('admin.login.title')}
              {mode === 'forgot-request' && t('admin.login.forgotPasswordTitle')}
              {mode === 'forgot-verify' && t('admin.login.enterOtpTitle')}
              {mode === 'forgot-reset' && t('admin.login.setNewPasswordTitle')}
              {mode === 'forgot-success' && t('admin.login.passwordUpdatedTitle')}
            </h1>
            <p className="text-cream/50 text-sm">
              {mode === 'login' && `${t('admin.login.signInSubtitle')} ${businessName}`}
              {mode === 'forgot-request' && t('admin.login.chooseOtpMethod')}
              {mode === 'forgot-verify' && `${t('admin.login.enterCodeSentTo')} ${t('admin.login.email.lower')}`}
              {mode === 'forgot-reset' && t('admin.login.createStrongPassword')}
              {mode === 'forgot-success' && t('admin.login.canSignInNow')}
            </p>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className={labelClasses}>
                  {t('admin.login.email')}
                </label>
                <input id="email" type="email" autoComplete="username" className={fieldClasses} {...register('email')} />
                {errors.email && <p className="text-rose mt-1 text-xs">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className={labelClasses}>
                  {t('admin.login.password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={cn(fieldClasses, 'pr-10')}
                    {...register('password')}
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
                {errors.password && <p className="text-rose mt-1 text-xs">{errors.password.message}</p>}
              </div>

              <button
                type="button"
                onClick={openForgotPassword}
                className="text-gold self-end text-xs font-medium hover:underline"
              >
                {t('admin.login.forgotPassword')}
              </button>

              <Button type="submit" variant="gold" className="mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting ? t('wizard.submitting') : t('admin.login.signIn')}
              </Button>
            </form>
          )}

          {mode === 'forgot-request' && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div>
                <label htmlFor="identifier" className={labelClasses}>
                  {t('admin.login.registeredEmail')}
                </label>
                <input
                  id="identifier"
                  type="email"
                  readOnly
                  disabled={identifierLoading}
                  value={identifierLoading ? t('common.loading') : identifier || t('admin.login.noRegisteredEmail')}
                  className={cn(fieldClasses, 'cursor-not-allowed opacity-80')}
                />
              </div>

              <Button type="submit" variant="gold" className="mt-2 w-full" disabled={busy || identifierLoading || !identifier}>
                {busy ? t('admin.login.sendingOtp') : t('admin.login.generateOtp')}
              </Button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-cream/50 text-xs font-medium hover:underline"
              >
                {t('admin.login.backToLogin')}
              </button>
            </form>
          )}

          {mode === 'forgot-verify' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <label htmlFor="otp" className={labelClasses}>
                  {t('admin.login.otpCode')}
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={cn(fieldClasses, 'tracking-[0.5em]')}
                />
              </div>

              <Button type="submit" variant="gold" className="mt-2 w-full" disabled={busy}>
                {busy ? t('admin.login.verifying') : t('admin.login.verifyOtp')}
              </Button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('forgot-request')}
                  className="text-cream/50 text-xs font-medium hover:underline"
                >
                  {t('admin.login.changeEmail')}
                </button>
                <button type="button" onClick={handleResendOtp} disabled={busy} className="text-gold text-xs font-medium hover:underline">
                  {t('admin.login.resendOtp')}
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot-reset' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label htmlFor="newPassword" className={labelClasses}>
                  {t('admin.login.newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={cn(fieldClasses, 'pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="text-cream/50 hover:text-cream absolute inset-y-0 right-0 flex w-10 items-center justify-center"
                    aria-label={showNewPassword ? t('admin.login.hidePassword') : t('admin.login.showPassword')}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <ul className="grid grid-cols-1 gap-1">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-1.5 text-xs">
                    {c.pass ? <Check size={13} className="text-emerald-400" /> : <X size={13} className="text-cream/30" />}
                    <span className={c.pass ? 'text-cream/70' : 'text-cream/40'}>{c.label}</span>
                  </li>
                ))}
              </ul>

              <div>
                <label htmlFor="confirmPassword" className={labelClasses}>
                  {t('admin.login.confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(fieldClasses, 'pr-10')}
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
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-rose mt-1 text-xs">{t('admin.login.passwordsDoNotMatch')}</p>
                )}
              </div>

              <Button type="submit" variant="gold" className="mt-2 w-full" disabled={busy}>
                {busy ? t('admin.login.updating') : t('admin.login.resetPassword')}
              </Button>
            </form>
          )}

          {mode === 'forgot-success' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="bg-emerald-500/10 text-emerald-400 flex h-14 w-14 items-center justify-center rounded-full">
                <Check size={26} />
              </span>
              <Button
                variant="gold"
                className="w-full"
                onClick={() => {
                  resetForgotState();
                  setMode('login');
                }}
              >
                {t('admin.login.backToLoginBtn')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
