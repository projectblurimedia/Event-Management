import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="bg-rose text-brand-white fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:text-sm"
    >
      <WifiOff size={14} className="shrink-0" />
      You&apos;re offline — some features won&apos;t work until your connection is back.
    </div>
  );
}
