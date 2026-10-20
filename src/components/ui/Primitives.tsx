import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import type { ProductColor } from '@/types';
import { cn, formatINR } from '@/utils/format';
import { luminance } from '@/utils/color';

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" aria-label="YNOT home" className={cn('inline-block leading-none', className)}>
      <span className={cn('block font-serif text-[34px] font-semibold tracking-[0.04em]', light ? 'text-ivory' : 'text-ink')}>YNOT</span>
      <span className={cn('mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.32em]', light ? 'text-ivory/70' : 'text-ink/60')}>For a Better You</span>
    </Link>
  );
}

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink/70" aria-label={`Rated ${value} out of 5${count != null ? ` from ${count} reviews` : ''}`}>
      <Star className={cn('fill-gold text-gold', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden />
      <span className={cn('font-semibold text-ink', size === 'md' && 'text-sm')}>{value.toFixed(1)}</span>
      {count != null && <span>({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})</span>}
    </span>
  );
}

export function PriceDisplay({ price, compareAt, discount, size = 'sm' }: { price: number; compareAt?: number; discount?: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={cn('font-bold text-ink', size === 'lg' ? 'text-2xl' : 'text-[15px]')}>{formatINR(price)}</span>
      {compareAt && compareAt > price && <span className={cn('text-ink/45 line-through', size === 'lg' ? 'text-base' : 'text-xs')}>{formatINR(compareAt)}</span>}
      {discount ? <span className="badge-sale">{discount}% OFF</span> : null}
    </div>
  );
}

export function ColorSwatches({ colors, selected, onSelect, max = 4, size = 'sm', label }: { colors: ProductColor[]; selected?: string; onSelect?: (name: string) => void; max?: number; size?: 'sm' | 'lg'; label?: string }) {
  const shown = onSelect ? colors : colors.slice(0, max);
  const dim = size === 'lg' ? 'h-9 w-9' : 'h-4 w-4';
  return (
    <div className="flex flex-wrap items-center gap-2" role={onSelect ? 'radiogroup' : undefined} aria-label={label ?? 'Colour'}>
      {shown.map((c) => {
        const on = selected === c.name;
        const ring = luminance(c.hex) > 0.85 ? 'ring-1 ring-ink/25' : '';
        return onSelect ? (
          <button key={c.name} type="button" role="radio" aria-checked={on} aria-label={c.name} title={c.name} onClick={() => onSelect(c.name)}
            className={cn('relative inline-flex items-center justify-center rounded-full p-[3px] transition', on ? 'ring-2 ring-brown' : 'ring-1 ring-transparent hover:ring-beige')}>
            <span className={cn('flex items-center justify-center rounded-full', dim, ring)} style={{ background: c.hex }}>{on && <Check className={cn('h-4 w-4', luminance(c.hex) > 0.6 ? 'text-ink' : 'text-ivory')} aria-hidden />}</span>
          </button>
        ) : (
          <span key={c.name} title={c.name} className={cn('rounded-full', dim, ring)} style={{ background: c.hex }}><span className="sr-only">{c.name}</span></span>
        );
      })}
      {!onSelect && colors.length > max && <span className="text-xs text-ink/55">+{colors.length - max}</span>}
    </div>
  );
}

export function SizeSelector({ sizes, selected, onSelect, isDisabled, error }: { sizes: string[]; selected?: string; onSelect: (s: string) => void; isDisabled?: (s: string) => boolean; error?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Size" className={cn('flex flex-wrap gap-2', error && 'rounded-lg ring-2 ring-red-500/50 ring-offset-4')}>
      {sizes.map((s) => {
        const off = isDisabled?.(s);
        const on = selected === s;
        return (
          <button key={s} type="button" role="radio" aria-checked={on} disabled={off} onClick={() => onSelect(s)} aria-label={off ? `${s}, out of stock` : s}
            className={cn('relative min-w-[48px] rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition', on ? 'border-cocoa bg-cocoa text-ivory' : 'border-[var(--border)] bg-white text-ink hover:border-brown', off && 'cursor-not-allowed overflow-hidden border-dashed text-ink/35 hover:border-[var(--border)]')}>
            {s}
            {off && <span className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="h-px w-[130%] rotate-[-30deg] bg-ink/25" /></span>}
          </button>
        );
      })}
    </div>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = 10, label = 'Quantity' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-white" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity" className="flex h-10 w-10 items-center justify-center rounded-l-lg text-ink hover:bg-beige/60 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity" className="flex h-10 w-10 items-center justify-center rounded-r-lg text-ink hover:bg-beige/60 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export interface Crumb { label: string; to?: string }
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink/60">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            {c.to && i < items.length - 1 ? <Link to={c.to} className="hover:text-brown hover:underline">{c.label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined} className={i === items.length - 1 ? 'font-semibold text-ink' : ''}>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  const nums: (number | '…')[] = [];
  for (let i = 1; i <= pageCount; i++) if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
  const base = 'flex h-10 min-w-[40px] items-center justify-center rounded-lg border text-sm font-semibold transition';
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" className={cn(base, 'border-[var(--border)] bg-white disabled:opacity-40')}><ChevronLeft className="h-4 w-4" /></button>
      {nums.map((n, i) => n === '…' ? <span key={`e${i}`} className="px-1 text-ink/50" aria-hidden>…</span> : (
        <button key={n} onClick={() => onChange(n)} aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined} className={cn(base, n === page ? 'border-cocoa bg-cocoa text-ivory' : 'border-[var(--border)] bg-white hover:border-brown')}>{n}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page" className={cn(base, 'border-[var(--border)] bg-white disabled:opacity-40')}><ChevronRight className="h-4 w-4" /></button>
    </nav>
  );
}

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = title.replace(/\W+/g, '-').toLowerCase();
  return (
    <div className="border-b border-[var(--border)]">
      <h3><button type="button" aria-expanded={open} aria-controls={`acc-${id}`} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left font-sans text-[15px] font-semibold text-ink">
        {title}<ChevronDown className={cn('h-5 w-5 shrink-0 text-brown transition-transform', open && 'rotate-180')} aria-hidden />
      </button></h3>
      <div id={`acc-${id}`} hidden={!open} className="pb-5 text-sm leading-6 text-ink/75">{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) { return <div className={cn('skeleton', className)} aria-hidden />; }

export function ProductGridSkeleton({ count = 8, list }: { count?: number; list?: boolean }) {
  return (
    <div className={list ? 'space-y-4' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5'} role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => list ? <Skeleton key={i} className="h-40 w-full" /> : (
        <div key={i}><Skeleton className="aspect-[4/5] w-full" /><Skeleton className="mt-3 h-4 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></div>
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) { return <span className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-brown/30 border-t-brown', className)} role="status" aria-label="Loading" />; }

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[13px] font-semibold text-brown">{eyebrow}</p>}
        <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
