import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useSettings } from '@/lib/api/settings';

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export function Logo({ className }: { className?: string }) {
  const { data: settings } = useSettings();
  const displayName = settings?.businessName ?? '';

  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      {settings?.logoUrl ? (
        <img src={settings.logoUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <span className="border-gold text-gold font-display flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold">
          {initial(displayName) || '—'}
        </span>
      )}
      <span className="font-display block text-base font-semibold tracking-wide leading-tight">{displayName}</span>
    </Link>
  );
}
