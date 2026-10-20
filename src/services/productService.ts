import type { Product } from '@/types';
import { CATALOG, PRODUCT_BY_SLUG, getProductById } from '@/data/catalog';
import { runQuery, tokenize, searchScore, type ProductQuery, type QueryResult } from '@/utils/catalogQuery';
import { CATEGORIES } from '@/data/categories';
import { hash } from '@/utils/hash';
import { tick } from './ids';

/** Product service. Swap the bodies for Supabase queries (e.g. `supabase.from('products')`) later; signatures stay the same. */
export interface IProductService {
  list(q: ProductQuery): Promise<QueryResult>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  related(p: Product, n?: number): Promise<Product[]>;
  completeTheLook(p: Product, n?: number): Promise<Product[]>;
  bestSellers(n?: number): Promise<Product[]>;
  recommendations(n?: number, excludeIds?: string[]): Promise<Product[]>;
  suggest(q: string): Promise<{ products: Product[]; categories: { slug: string; label: string }[] }>;
}

const LOOK: Record<string, string[]> = {
  shirts: ['trousers', 'accessories', 'jackets'], 't-shirts': ['jeans', 'accessories', 'jackets'], jeans: ['t-shirts', 'accessories', 'jackets'],
  trousers: ['shirts', 'accessories', 'jackets'], jackets: ['t-shirts', 'jeans', 'accessories'], ethnic: ['accessories', 'ethnic', 'accessories'], accessories: ['shirts', 'jeans', 't-shirts'],
};

export const productService: IProductService = {
  async list(q) { await tick(); return runQuery(q); },
  async getBySlug(slug) { await tick(80); return PRODUCT_BY_SLUG.get(slug) ?? null; },
  async getById(id) { return getProductById(id) ?? null; },
  async related(p, n = 5) {
    await tick(80);
    return CATALOG.filter((x) => x.id !== p.id && x.category === p.category)
      .sort((a, b) => Number(b.subcategory === p.subcategory) - Number(a.subcategory === p.subcategory) || b.reviewCount - a.reviewCount).slice(0, n);
  },
  async completeTheLook(p, n = 4) {
    await tick(80);
    const picks: Product[] = [];
    const used = new Set<string>([p.id]);
    LOOK[p.category].forEach((cat, i) => {
      const pool = CATALOG.filter((x) => x.category === cat && !used.has(x.id) && (cat !== p.category || x.subcategory !== p.subcategory));
      if (!pool.length) return;
      const pick = pool[(hash(p.id) + i * 7) % pool.length];
      used.add(pick.id); picks.push(pick);
    });
    return picks.slice(0, n);
  },
  async bestSellers(n = 6) { await tick(); return CATALOG.filter((p) => p.bestSeller).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, n); },
  async recommendations(n = 5, excludeIds = []) {
    await tick(80);
    return CATALOG.filter((p) => !excludeIds.includes(p.id) && (p.featured || p.bestSeller)).sort((a, b) => b.rating - a.rating).slice(0, n);
  },
  async suggest(q) {
    const tokens = tokenize(q);
    if (!tokens.length) return { products: [], categories: [] };
    const products = CATALOG.map((p) => ({ p, s: searchScore(p, tokens) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).slice(0, 5).map((x) => x.p);
    const categories = CATEGORIES.filter((c) => tokens.some((t) => c.label.toLowerCase().includes(t) || c.subcategories.some((s) => s.label.toLowerCase().includes(t)))).map((c) => ({ slug: c.slug, label: c.label })).slice(0, 3);
    return { products, categories };
  },
};
