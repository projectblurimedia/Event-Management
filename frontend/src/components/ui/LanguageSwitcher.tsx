import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

interface LanguageSwitcherProps {
  /** Smaller footprint for tight spaces (mobile header row). */
  compact?: boolean;
  className?: string;
  /** Text color class for the inactive option — differs between the public header (dark gradient) and the admin header (surface background). */
  mutedClassName?: string;
}

/**
 * Always shows both options side by side (rather than just the target
 * language) so it reads clearly at a glance for anyone unfamiliar with the
 * site — important for the Telugu-speaking audience this exists for.
 */
export function LanguageSwitcher({ compact = false, className, mutedClassName = 'text-text-muted' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('header.toggleLanguage')}
      className={cn(
        'border-gold/40 flex items-center overflow-hidden rounded-full border',
        compact ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={cn(
          'font-semibold transition-colors',
          compact ? 'px-2.5 py-1' : 'px-3.5 py-1.5',
          language === 'en' ? 'bg-gold text-ink-black' : cn(mutedClassName, 'hover:text-gold'),
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('te')}
        aria-pressed={language === 'te'}
        className={cn(
          'font-semibold transition-colors',
          compact ? 'px-2.5 py-1' : 'px-3.5 py-1.5',
          language === 'te' ? 'bg-gold text-ink-black' : cn(mutedClassName, 'hover:text-gold'),
        )}
      >
        తె
      </button>
    </div>
  );
}
