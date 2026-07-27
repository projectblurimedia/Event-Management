import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <span className="border-gold text-gold font-display flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold">
        MS
      </span>
      <span className="font-display leading-tight">
        <span className="block text-base font-semibold tracking-wide">MS Wedding Planner</span>
        <span className="text-gold block text-[11px] tracking-[0.2em] uppercase">
          Events &amp; Catering
        </span>
      </span>
    </Link>
  );
}
