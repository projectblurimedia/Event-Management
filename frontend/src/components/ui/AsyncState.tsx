import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AsyncStateProps {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  loadingLabel?: string;
  errorLabel?: string;
  /** Tailwind height class for the loading/error placeholder — match the content it's replacing. */
  minHeight?: string;
  compact?: boolean;
  children: ReactNode;
}

/**
 * Drop-in wrapper for query-backed content: shows a spinner while loading,
 * a friendly message + retry button on failure (network-aware via the
 * message passed in from getErrorMessage at call sites), otherwise renders
 * children. Keeps every list/detail view from going silently blank when the
 * connection is slow or drops.
 */
export function AsyncState({
  isLoading,
  isError,
  onRetry,
  loadingLabel = 'Loading…',
  errorLabel = "Couldn't load this content.",
  minHeight = 'min-h-[30vh]',
  compact = false,
  children,
}: AsyncStateProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', compact ? 'py-6' : 'py-16', minHeight)}>
        <div className="border-gold h-7 w-7 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-text-muted text-sm">{loadingLabel}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 text-center',
          compact ? 'py-6' : 'py-16',
          minHeight,
        )}
      >
        <p className="text-text-muted max-w-xs text-sm">{errorLabel}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="border-gold text-gold inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-gold hover:text-ink-black"
          >
            <RefreshCw size={13} /> Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
