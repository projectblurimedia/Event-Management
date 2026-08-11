import { Check } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { CUSTOM_PACKAGE_CONTENT } from './packageTierContent';
import { PackageBadge } from './PackageBadge';

interface CustomPackageCardProps {
  imageClassName?: string;
}

/** Matches PackageCard's badge/tagline/feature-list structure so the "Custom
 * Package" tile doesn't look like an afterthought next to Silver/Gold/Platinum. */
export function CustomPackageCard({ imageClassName }: CustomPackageCardProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border border-dashed">
      <div className={`bg-surface-muted flex items-center justify-center ${imageClassName ?? ''}`}>
        <PackageBadge />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold">{t('wizard.customPackageTitle')}</h3>
        <p className="text-gold mt-1 text-xs font-semibold tracking-wide uppercase">{CUSTOM_PACKAGE_CONTENT.tagline}</p>
        <ul className="mt-5 flex-1 space-y-2.5">
          {CUSTOM_PACKAGE_CONTENT.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-gold mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <LinkButton to="/booking?package=custom" variant="outline" className="mt-6 w-full">
          {t('packages.chooseThisPackage')}
        </LinkButton>
      </div>
    </div>
  );
}
