import { isAxiosError } from 'axios';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/i18n/translations';

/**
 * Turns any thrown error into a user-facing message — distinguishes "you're
 * offline" / "server took too long" from a real server-provided message, so
 * toasts and inline error states never lie about what actually happened.
 * Reads the language store directly (not a hook) so this plain function can
 * be called from anywhere, including outside React components.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const language = useLanguageStore.getState().language;
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return translations[language]['errors.timedOut'];
    }
    if (!error.response) {
      return translations[language]['errors.noConnection'];
    }
    const message = error.response.data?.message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}
