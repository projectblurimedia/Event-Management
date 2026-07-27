import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'bg-surface border-border relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl',
          sizeClasses[size],
        )}
      >
        <div className="border-border bg-surface sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text hover:bg-surface-muted flex h-8 w-8 items-center justify-center rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-x-hidden overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
