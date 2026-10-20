import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/format';

type Variant = 'primary' | 'outline' | 'soft' | 'ghost' | 'gold';
const V: Record<Variant, string> = { primary: 'btn-primary', outline: 'btn-outline', soft: 'btn-soft', ghost: 'btn-ghost', gold: 'btn-gold' };

interface Common { variant?: Variant; size?: 'md' | 'sm'; block?: boolean; className?: string; children?: ReactNode }
export interface ButtonProps extends Common, ButtonHTMLAttributes<HTMLButtonElement> { loading?: boolean }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', block, loading, className, children, disabled, type = 'button', ...rest }, ref) => (
  <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cn('btn', V[variant], size === 'sm' && 'btn-sm', block && 'btn-block', className)} {...rest}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
    {children}
  </button>
));
Button.displayName = 'Button';

export function LinkButton({ variant = 'primary', size = 'md', block, className, children, ...rest }: Common & LinkProps) {
  return <Link className={cn('btn', V[variant], size === 'sm' && 'btn-sm', block && 'btn-block', className)} {...rest}>{children}</Link>;
}
