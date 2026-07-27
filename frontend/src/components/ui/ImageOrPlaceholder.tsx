import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ImageOrPlaceholderProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
}

/**
 * Renders the real photo when one is set, otherwise a placeholder box of the
 * exact same size/shape with a centered icon — so cards look identical
 * whether or not the admin has uploaded an image yet.
 */
export function ImageOrPlaceholder({ src, alt, className, iconSize = 20 }: ImageOrPlaceholderProps) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  }
  return (
    <div className={cn('bg-surface-muted text-text-muted/40 flex items-center justify-center', className)}>
      <ImageIcon size={iconSize} />
    </div>
  );
}
