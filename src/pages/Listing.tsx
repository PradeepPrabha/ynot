import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import type { SortKey } from '@/types';
import { CATEGORIES, CATEGORY_FILTERS, CATEGORY_MAP, isCategorySlug } from '@/data/categories';
import { POPULAR_SEARCHES } from '@/data/site';
import { productService } from '@/services/productService';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { clearFilters, countActiveFilters, parseListing, setParam, toggleListParam } from '@/utils/queryParams';
import { storage, KEYS } from '@/utils/storage';
import { Breadcrumbs, Pagination, ProductGridSkeleton } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import SortDropdown from '@/components/products/SortDropdown';
import CategoryBanner from '@/components/products/CategoryBanner';
import ProductArt from '@/components/art/ProductArt';
import NotFound from './NotFound';
import { cn } from '@/utils/format';

type Mode = 'all' | 'category' | 'search';

export default function Listing({ mode }: { mode: Mode }) {
  const { slug } = useParams();
  if (mode === 'category' && !isCategorySlug(slug)) return <NotFound />;
  return <ListingInner key={mode === 'category' ? slug : mode} mode={mode} category={mode === 'category' ? (slug as never) : undefined} />;
}

function ListingInner({ mode, category }: { mode: Mode; category?: import('@/types').CategorySlug }) {
  const [sp, setSpRaw] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>(() => storage.get(KEYS.viewMode, 'grid'));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const def = category ? CATEGORY_MAP[category] : null;
  const search = mode === 'search' ? sp.get('q')?.trim() ?? '' : '';
  const setSp = (n: URLSearchParams) => setSpRaw(n, { replace: false });

  const parsed = parseListing(sp);
  const query = useMemo(() => ({ ...parsed, category, q: mode === 'search' ? search : undefined, pageSize: layout === 'list' ? 8 : 12 }), [sp.toString(), category, mode, search, layout]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data, loading, error, reload } = useAsync(() => productService.list(query), [JSON.stringify(query)]);

  const isSale = sp.get('sale') === '1', isNew = sp.get('new') === '1';
  const title = def ? def.headline : mode === 'search' ? (search ? `Results for “${search}”` : 'Search') : isSale ? 'Sale' : isNew ? 'New In' : 'All Products';
  usePageMeta(mode === 'search' ? (search ? `Search: ${search}` : 'Search') : def ? `${def.label} for Men` : title, def ? def.blurb : 'Browse the full YNOT menswear collection. Shirts, t-shirts, jeans, trousers, jackets, ethnic wear and accessories.');
  useEffect(() => { storage.set(KEYS.viewMode, layout); }, [layout]);

  const groups = CATEGORY_FILTERS[category ?? 'all'];
  const active = countActiveFilters(sp);
  const sort = (sp.get('sort') as SortKey) || (mode === 'search' && search ? 'relevance' : 'popularity');
  const goPage = (p: number) => { setSp(setParam(sp, 'page', p > 1 ? String(p) : null, false)); top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const crumbs = [{ label: 'Home', to: '/' }, ...(def ? [{ label: def.label }] : mode === 'search' ? [{ label: 'Search' }] : [{ label: title }])];
  const start = data && data.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const end = data ? Math.min(data.total, data.page * data.pageSize) : 0;

  const chips: { label: string; remove: () => void }[] = [];
  (['cat', 'sub', 'size', 'color', 'fit', 'fabric', 'pattern', 'brand'] as const).forEach((k) => (sp.get(k)?.split('~') ?? []).forEach((v) => chips.push({ label: k === 'cat' ? CATEGORY_MAP[v as keyof typeof CATEGORY_MAP]?.label ?? v : k === 'sub' ? def?.subcategories.find((s) => s.slug === v)?.label ?? v : v, remove: () => setSp(toggleListParam(sp, k, v)) })));
  if (sp.get('disc')) chips.push({ label: `${sp.get('disc')}% off+`, remove: () => setSp(setParam(sp, 'disc', null)) });
  if (sp.get('stock')) chips.push({ label: 'In stock', remove: () => setSp(setParam(sp, 'stock', null)) });
  if (sp.get('min') || sp.get('max')) chips.push({ label: `₹${sp.get('min') ?? '…'} – ₹${sp.get('max') ?? '…'}`, remove: () => setSp(setParam(setParam(sp, 'min', null), 'max', null)) });

  return (
    <div>
      {def ? <CategoryBanner category={def} /> : (
        <section className="border-b border-[var(--border)] bg-gradient-to-r from-cream to-beige/70">
          <div className="container-page py-9">
            <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-xl text-ink/75">{mode === 'search' ? (search ? 'Matching products across names, categories, tags and descriptions.' : 'Type something to search the catalogue.') : isSale ? 'Premium pieces at 30% off and more.' : isNew ? 'The latest drops from the last six weeks.' : 'Discover the full YNOT collection, from everyday essentials to festive wear.'}</p>
            {mode !== 'search' && <div className="mt-4 flex flex-wrap gap-2">{CATEGORIES.map((c) => <Link key={c.slug} to={`/category/${c.slug}`} className="chip">{c.label}</Link>)}</div>}
          </div>
        </section>
      )}

      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Breadcrumbs items={crumbs} />
          <p className="text-[13px] text-ink/65" aria-live="polite">{data ? (data.total ? `Showing ${start}–${end} of ${data.total} products` : '0 products') : ' '}</p>
        </div>

        {def && (
          <div className="no-scrollbar -mx-4 mb-5 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label={`${def.label} styles`}>
            <button onClick={() => setSp(setParam(sp, 'sub', null))} data-active={!sp.get('sub')} className="chip shrink-0 !rounded-xl !px-4 !py-2.5 data-[active=true]:!bg-cocoa">All {def.label}</button>
            {def.subcategories.map((s) => {
              const on = sp.get('sub')?.split('~').includes(s.slug);
              return (
                <button key={s.slug} onClick={() => setSp(setParam(sp, 'sub', on ? null : s.slug))} aria-pressed={!!on} data-active={!!on} className="chip shrink-0 !rounded-xl !py-2 !pl-2 !pr-4">
                  <span className="h-9 w-9 overflow-hidden rounded-lg bg-beige"><ProductArt art={s.art} color={s.color} pattern={s.pattern} label="" /></span>{s.label}
                </button>
              );
            })}
          </div>
        )}

        <div ref={top} className="scroll-mt-28 lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3">
              {data ? <ProductFilters groups={groups} result={data} sp={sp} setSp={setSp} category={category} /> : <div className="skeleton h-96" />}
            </div>
          </aside>

          <section aria-label="Products" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal className="h-4 w-4" />Filters{active > 0 && ` (${active})`}</Button>
              <p className="hidden text-sm font-semibold lg:block">{data ? `${data.total} Products` : ''}</p>
              <div className="ml-auto flex items-center gap-3">
                <SortDropdown value={sort} onChange={(s) => setSp(setParam(sp, 'sort', s))} withRelevance={mode === 'search' && !!search} />
                <div className="hidden rounded-lg border border-[var(--border)] p-1 sm:flex" role="group" aria-label="Layout">
                  {([['grid', LayoutGrid, 'Grid view'], ['list', List, 'List view']] as const).map(([k, Icon, label]) => <button key={k} onClick={() => setLayout(k)} aria-pressed={layout === k} aria-label={label} className={cn('rounded-md p-2', layout === k ? 'bg-cocoa text-ivory' : 'text-ink/60 hover:bg-beige/60')}><Icon className="h-4 w-4" /></button>)}
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
                {chips.map((c, i) => <button key={`${c.label}${i}`} onClick={c.remove} className="chip !py-1.5" aria-label={`Remove filter ${c.label}`}>{c.label}<X className="h-3.5 w-3.5" /></button>)}
                <button onClick={() => setSp(clearFilters(sp))} className="text-[13px] font-semibold text-brown underline underline-offset-4">Clear all</button>
              </div>
            )}

            {error ? (
              <EmptyState kind="alert" title="We couldn’t load products" message={error} secondary={<Button onClick={reload}>Try again</Button>} />
            ) : loading && !data ? (
              <ProductGridSkeleton count={8} list={layout === 'list'} />
            ) : data && data.total === 0 ? (
              <NoResults search={search} hasFilters={active > 0} onClear={() => setSp(clearFilters(sp))} />
            ) : data ? (
              <div className={cn('transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
                <ProductGrid products={data.items} layout={layout} />
                <Pagination page={data.page} pageCount={data.pageCount} onChange={goPage} />
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" side="left" width="max-w-sm"
        footer={<div className="flex gap-3"><Button variant="outline" block onClick={() => setSp(clearFilters(sp))} disabled={!active}>Clear all</Button><Button block onClick={() => setFiltersOpen(false)}>Show {data?.total ?? ''} products</Button></div>}>
        <div className="px-5 pb-4">{data && <ProductFilters groups={groups} result={data} sp={sp} setSp={setSp} category={category} />}</div>
      </Drawer>
    </div>
  );
}

function NoResults({ search, hasFilters, onClear }: { search: string; hasFilters: boolean; onClear: () => void }) {
  return (
    <div>
      <EmptyState kind="search" title={search ? `No results for “${search}”` : 'No products match these filters'}
        message={hasFilters ? 'Try removing a filter or two to see more products.' : 'Check the spelling, or try a broader word like “shirt”, “jeans” or “watch”.'}
        secondary={hasFilters ? <Button onClick={onClear}>Clear all filters</Button> : undefined} />
      <div className="mx-auto max-w-2xl pb-10 text-center">
        <p className="mb-3 text-sm font-semibold">Popular searches</p>
        <div className="flex flex-wrap justify-center gap-2">{POPULAR_SEARCHES.map((s) => <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="chip">{s}</Link>)}</div>
        <p className="mb-3 mt-8 text-sm font-semibold">Or shop a category</p>
        <div className="flex flex-wrap justify-center gap-2">{CATEGORIES.map((c) => <Link key={c.slug} to={`/category/${c.slug}`} className="chip">{c.label}</Link>)}</div>
      </div>
    </div>
  );
}
