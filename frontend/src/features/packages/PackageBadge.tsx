import { Crown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getPackageTierContent } from './packageTierContent';

interface PackageBadgeProps {
  packageName: string;
  size?: 'md' | 'lg';
}

/** Circular metallic medallion standing in for a package photo — mirrors the
 * printed catalogue's Silver/Gold/Platinum badges instead of a stock emoji
 * or an admin-uploaded photo that may not exist. */
export function PackageBadge({ packageName, size = 'md' }: PackageBadgeProps) {
  const tier = getPackageTierContent(packageName);
  const dimension = size === 'lg' ? 'h-24 w-24' : 'h-20 w-20';

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-inner',
        dimension,
        tier?.badgeGradient ?? 'from-gold/40 via-gold/20 to-gold/50',
      )}
      aria-hidden
    >
      <span className="absolute inset-1.5 rounded-full border border-white/60" />
      <Crown
        className={cn(size === 'lg' ? 'h-9 w-9' : 'h-7 w-7', tier?.badgeAccent ?? 'text-gold')}
        strokeWidth={1.75}
      />
    </span>
  );
}
