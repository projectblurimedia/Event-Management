import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  /** When set, shows a small icon beside the title linking to the full page. */
  linkTo?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  linkTo,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}>
      {eyebrow && (
        <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">{eyebrow}</span>
      )}
      <div className="flex items-center gap-2.5">
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        {linkTo && (
          <Link
            to={linkTo}
            aria-label={`View full ${title} page`}
            className="border-gold text-gold hover:bg-gold hover:text-ink-black flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
      <div aria-hidden className="flex items-center gap-2 text-gold">
        <span className="h-px w-8 bg-gold/60" />
        <span className="text-sm">&#10022;</span>
        <span className="h-px w-8 bg-gold/60" />
      </div>
      {description && <p className="text-text-muted max-w-2xl text-balance">{description}</p>}
    </div>
  );
}
