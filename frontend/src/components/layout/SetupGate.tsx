import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSetupStatus } from '@/lib/api/setup';
import { PageLoader } from '@/components/ui/PageLoader';
import { SetupPage } from '@/pages/SetupPage';

/**
 * Blocks the entire app (public site and admin) behind a one-time setup
 * form until an AdminUser exists. Rendered outside the router, so nothing
 * here can rely on route context.
 */
export function SetupGate({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, refetch } = useSetupStatus();

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="bg-bg text-text flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">Can't reach the server</h1>
        <p className="text-text-muted max-w-sm text-sm">
          We couldn't check the site's setup status. Please check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="bg-gold text-ink-black inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold hover:brightness-105"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  if (!data?.isSetup) return <SetupPage />;

  return <>{children}</>;
}
