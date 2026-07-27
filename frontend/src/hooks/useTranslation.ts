import { useLanguageStore } from '@/store/languageStore';
import { translations, type TranslationKey } from '@/lib/i18n/translations';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  function t(key: TranslationKey): string {
    return translations[language][key] ?? translations.en[key] ?? key;
  }

  /** Picks a Telugu DB field when Telugu is active and populated, else falls back to English. */
  function tf(en: string, te: string | null | undefined): string {
    return language === 'te' && te ? te : en;
  }

  return { t, tf, language, setLanguage, toggleLanguage };
}
