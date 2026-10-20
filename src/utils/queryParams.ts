import type { SortKey } from '@/types';
import type { ProductQuery } from './catalogQuery';

const list = (sp: URLSearchParams, k: string) => (sp.get(k) ? sp.get(k)!.split('~').filter(Boolean) : undefined);
const num = (sp: URLSearchParams, k: string) => { const v = sp.get(k); return v && !Number.isNaN(Number(v)) ? Number(v) : undefined; };
const SORTS: SortKey[] = ['popularity', 'newest', 'price-asc', 'price-desc', 'rating', 'discount', 'relevance'];

export function parseListing(sp: URLSearchParams): ProductQuery {
  const sort = sp.get('sort') as SortKey | null;
  return {
    q: sp.get('q')?.trim() || undefined,
    cats: list(sp, 'cat') as ProductQuery['cats'],
    subs: list(sp, 'sub'), sizes: list(sp, 'size'), colors: list(sp, 'color'), fits: list(sp, 'fit'),
    fabrics: list(sp, 'fabric'), patterns: list(sp, 'pattern'), brands: list(sp, 'brand'),
    minDiscount: num(sp, 'disc'), inStock: sp.get('stock') === '1' || undefined,
    minPrice: num(sp, 'min'), maxPrice: num(sp, 'max'),
    onSale: sp.get('sale') === '1' || undefined, newIn: sp.get('new') === '1' || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined, page: num(sp, 'page'),
  };
}

export const FILTER_PARAM_KEYS = ['cat', 'sub', 'size', 'color', 'fit', 'fabric', 'pattern', 'brand', 'disc', 'stock', 'min', 'max'] as const;

export function countActiveFilters(sp: URLSearchParams): number {
  return FILTER_PARAM_KEYS.reduce((n, k) => n + (sp.get(k) ? (['cat', 'sub', 'size', 'color', 'fit', 'fabric', 'pattern', 'brand'].includes(k) ? sp.get(k)!.split('~').length : 1) : 0), 0);
}

export function toggleListParam(sp: URLSearchParams, key: string, value: string): URLSearchParams {
  const next = new URLSearchParams(sp);
  const cur = list(sp, key) ?? [];
  const upd = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
  if (upd.length) next.set(key, upd.join('~')); else next.delete(key);
  next.delete('page');
  return next;
}

export function setParam(sp: URLSearchParams, key: string, value: string | null, resetPage = true): URLSearchParams {
  const next = new URLSearchParams(sp);
  if (value == null || value === '') next.delete(key); else next.set(key, value);
  if (resetPage) next.delete('page');
  return next;
}

export function clearFilters(sp: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(sp);
  FILTER_PARAM_KEYS.forEach((k) => next.delete(k));
  next.delete('page');
  return next;
}
