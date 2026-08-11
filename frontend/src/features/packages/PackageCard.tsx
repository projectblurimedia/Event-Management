import { Check } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { Package } from '@/types/api';
import { getPackageTierContent } from './packageTierContent';

interface PackageCardProps {
  pkg: Package;
  imageClassName?: string;
}

export function PackageCard({ pkg, imageClassName }: PackageCardProps) {
  const { t, tf } = useTranslation();
  const tier = getPackageTierContent(pkg.name);

  return (
    <div
      className={cn(
        'border-border bg-surface flex flex-col overflow-hidden rounded-2xl border',
        pkg.isFeatured && 'border-gold shadow-xl shadow-gold/10 lg:-translate-y-3',
      )}
    >
      <div className={cn('bg-surface-muted flex items-center justify-center', imageClassName)}>
        <span
          className="border-gold/40 bg-bg flex h-20 w-20 items-center justify-center rounded-full border-2 text-4xl"
          aria-hidden
        >
          {tier?.emoji ?? '🎉'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {pkg.isFeatured && (
          <span className="bg-gold text-ink-black mb-3 w-fit rounded-full px-3 py-1 text-sm font-semibold tracking-wide uppercase">
            {t('packages.mostPopular')}
          </span>
        )}
        <h3 className="text-xl font-semibold">{tf(pkg.name, pkg.nameTe)}</h3>
        {tier && <p className="text-gold mt-1 text-xs font-semibold tracking-wide uppercase">{tier.tagline}</p>}
        <ul className="mt-5 flex-1 space-y-2.5">
          {tier
            ? tier.features.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm">
                  <span aria-hidden>{f.emoji}</span>
                  {f.text}
                </li>
              ))
            : pkg.categories.map((pc) => (
                <li key={pc.id} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-gold mt-0.5 shrink-0" />
                  {tf(pc.category.name, pc.category.nameTe)}
                </li>
              ))}
        </ul>
        <LinkButton
          to={`/booking?package=${pkg.id}`}
          variant={pkg.isFeatured ? 'gold' : 'outline'}
          className="mt-6 w-full"
        >
          {t('packages.chooseThisPackage')}
        </LinkButton>
      </div>
    </div>
  );
}
