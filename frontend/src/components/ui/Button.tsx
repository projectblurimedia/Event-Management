import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

const variantClasses = {
  primary: 'bg-rose text-brand-white hover:bg-rose-deep shadow-lg shadow-rose/20',
  gold: 'bg-[image:var(--gradient-gold)] text-ink-black hover:brightness-105 shadow-lg shadow-gold/20',
  outline: 'border border-gold text-gold hover:bg-gold hover:text-ink-black',
  ghost: 'text-current hover:bg-current/10',
} as const;

const sizeClasses = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
} as const;

type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

interface LinkButtonProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function LinkButton({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(base, variantClasses[variant], sizeClasses[size], className)} {...props} />
  );
}
