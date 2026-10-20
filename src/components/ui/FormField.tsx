import { type ReactNode } from 'react';
import { cn } from '@/utils/format';

interface Props { label: string; htmlFor: string; error?: string; hint?: string; required?: boolean; className?: string; children: ReactNode }
export function FormField({ label, htmlFor, error, hint, required, className, children }: Props) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">{label}{required && <span className="text-coral" aria-hidden> *</span>}</label>
      {children}
      {hint && !error && <p id={`${htmlFor}-hint`} className="mt-1 text-xs text-ink/55">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
export const fieldClass = (error?: string, extra?: string) => cn('field', error && 'field-error', extra);
export const aria = (id: string, error?: string, hint?: string) => ({ 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined });
