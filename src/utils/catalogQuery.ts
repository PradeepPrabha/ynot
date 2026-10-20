import type { CategorySlug, Product, SortKey } from '@/types';
import { CATALOG } from '@/data/catalog';

export interface ProductQuery {
  category?: CategorySlug;
  cats?: CategorySlug[];
  q?: string;
  subs?: string[];
  sizes?: string[];
  colors?: string[];
  fits?: string[];
  fabrics?: string[];
  patterns?: string[];
  brands?: string[];
  minDiscount?: number;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  newIn?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export type FacetKey = 'cats' | 'subs' | 'sizes' | 'colors' | 'fits' | 'fabrics' | 'patterns' | 'brands';
export type Facets = Record<FacetKey, Record<string, number>>;
export interface QueryResult { items: Product[]; total: number; page: number; pageCount: number; pageSize: number; facets: Facets; priceBounds: [number, number] }

const SYNONYMS: Record<string, string> = { tee: 't-shirt', tees: 't-shirt', pants: 'trousers', pant: 'trousers', kurti: 'kurta', denim: 'jeans', glasses: 'sunglasses', shades: 'sunglasses', bag: 'bags', perfume: 'fragrance', scent: 'fragrance' };
const stem = (t: string) => (t.length > 3 ? t.replace(/(es|s)$/, '') : t);
export const tokenize = (q: string) => q.toLowerCase().split(/[\s,]+/).filter(Boolean).map((t) => stem(SYNONYMS[t] ?? t));

function haystack(p: Product) {
  return {
    title: p.title.toLowerCase(),
    meta: `${p.category} ${p.subcategoryLabel} ${p.tags.join(' ')} ${p.fabric} ${p.fit} ${p.brand}`.toLowerCase(),
    desc: p.description.toLowerCase(),
  };
}
const HAY = new Map(CATALOG.map((p) => [p.id, haystack(p)]));

export function searchScore(p: Product, tokens: string[]): number {
  if (!tokens.length) return 0;
  const h = HAY.get(p.id)!;
  let score = 0;
  for (const t of tokens) {
    const inTitle = h.title.includes(t), inMeta = h.meta.includes(t), inDesc = h.desc.includes(t);
    if (!inTitle && !inMeta && !inDesc) return -1;
    score += (inTitle ? 6 : 0) + (inMeta ? 3 : 0) + (inDesc ? 1 : 0);
  }
  return score;
}

const anyOf = (sel: string[] | undefined, has: (v: string) => boolean) => !sel?.length || sel.some(has);

function matches(p: Product, q: ProductQuery, tokens: string[], skip?: FacetKey): boolean {
  if (q.category && p.category !== q.category) return false;
  if (skip !== 'cats' && !anyOf(q.cats, (v) => p.category === v)) return false;
  if (tokens.length && searchScore(p, tokens) < 0) return false;
  if (skip !== 'subs' && !anyOf(q.subs, (v) => p.subcategory === v)) return false;
  if (skip !== 'sizes' && !anyOf(q.sizes, (v) => p.sizes.includes(v))) return false;
  if (skip !== 'colors' && !anyOf(q.colors, (v) => p.colors.some((c) => c.name === v))) return false;
  if (skip !== 'fits' && !anyOf(q.fits, (v) => p.fit === v)) return false;
  if (skip !== 'fabrics' && !anyOf(q.fabrics, (v) => p.fabric === v)) return false;
  if (skip !== 'patterns' && !anyOf(q.patterns, (v) => p.pattern === v)) return false;
  if (skip !== 'brands' && !anyOf(q.brands, (v) => p.brand === v)) return false;
  if (q.minDiscount && p.discount < q.minDiscount) return false;
  if (q.inStock && p.stock <= 0) return false;
  if (q.minPrice != null && p.price < q.minPrice) return false;
  if (q.maxPrice != null && p.price > q.maxPrice) return false;
  if (q.onSale && p.discount < 30) return false;
  if (q.newIn && Date.now() - new Date(p.createdAt).getTime() > 45 * 86400000) return false;
  return true;
}

function sortItems(items: Product[], sort: SortKey, tokens: string[]): Product[] {
  const arr = [...items];
  switch (sort) {
    case 'newest': return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case 'price-asc': return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    case 'rating': return arr.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'discount': return arr.sort((a, b) => b.discount - a.discount);
    case 'relevance': return arr.sort((a, b) => searchScore(b, tokens) - searchScore(a, tokens) || b.reviewCount - a.reviewCount);
    default: return arr.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.reviewCount - a.reviewCount);
  }
}

const bump = (rec: Record<string, number>, k: string) => { rec[k] = (rec[k] ?? 0) + 1; };

export function runQuery(q: ProductQuery): QueryResult {
  const tokens = q.q ? tokenize(q.q) : [];
  const sort = q.sort ?? (tokens.length ? 'relevance' : 'popularity');
  const filtered = CATALOG.filter((p) => matches(p, q, tokens));

  const facets: Facets = { cats: {}, subs: {}, sizes: {}, colors: {}, fits: {}, fabrics: {}, patterns: {}, brands: {} };
  (Object.keys(facets) as FacetKey[]).forEach((key) => {
    CATALOG.filter((p) => matches(p, q, tokens, key)).forEach((p) => {
      if (key === 'cats') bump(facets.cats, p.category);
      if (key === 'subs') bump(facets.subs, p.subcategory);
      if (key === 'sizes') p.sizes.forEach((s) => bump(facets.sizes, s));
      if (key === 'colors') p.colors.forEach((c) => bump(facets.colors, c.name));
      if (key === 'fits') bump(facets.fits, p.fit);
      if (key === 'fabrics') bump(facets.fabrics, p.fabric);
      if (key === 'patterns') bump(facets.patterns, p.pattern);
      if (key === 'brands') bump(facets.brands, p.brand);
    });
  });

  const scope = CATALOG.filter((p) => (!q.category || p.category === q.category) && (!tokens.length || searchScore(p, tokens) >= 0));
  const prices = scope.map((p) => p.price);
  const priceBounds: [number, number] = prices.length ? [Math.floor(Math.min(...prices) / 100) * 100, Math.ceil(Math.max(...prices) / 100) * 100] : [0, 5000];

  const pageSize = q.pageSize ?? 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, q.page ?? 1), pageCount);
  const sorted = sortItems(filtered, sort, tokens);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageCount, pageSize, facets, priceBounds };
}
