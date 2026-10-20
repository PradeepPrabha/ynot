import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CategorySlug } from '@/types';
import { CATALOG } from '@/data/catalog';
import { CATEGORY_MAP, CATEGORIES, type FilterGroup } from '@/data/categories';
import { COLOR_HEX } from '@/data/catalog';
import type { QueryResult, FacetKey } from '@/utils/catalogQuery';
import { clearFilters, countActiveFilters, setParam, toggleListParam } from '@/utils/queryParams';
import { cn, formatINR } from '@/utils/format';
import { luminance } from '@/utils/color';

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', 'One Size', 'Free Size', '100 ml'];
const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)] py-4">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left font-sans text-[15px] font-bold text-ink">
        {title}<ChevronDown className={cn('h-4 w-4 text-brown transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function CheckRow({ label, count, checked, onChange, disabled }: { label: string; count?: number; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm hover:bg-beige/40', disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent')}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="h-4 w-4 rounded border-[var(--border)] accent-[#6B4226]" />
      <span className="flex-1 text-ink/85">{label}</span>
      {count != null && <span className="text-xs text-ink/45">({count})</span>}
    </label>
  );
}

interface Props { groups: FilterGroup[]; result: QueryResult; sp: URLSearchParams; setSp: (n: URLSearchParams) => void; category?: CategorySlug }

export default function ProductFilters({ groups, result, sp, setSp, category }: Props) {
  const scope = category ? CATALOG.filter((p) => p.category === category) : CATALOG;
  const universe = (pick: (p: (typeof CATALOG)[number]) => string[]) => Array.from(new Set(scope.flatMap(pick)));
  const sel = (k: string) => (sp.get(k) ? sp.get(k)!.split('~') : []);
  const toggle = (k: string, v: string) => setSp(toggleListParam(sp, k, v));
  const active = countActiveFilters(sp);
  const f = result.facets;
  const [lo, hi] = result.priceBounds;
  const min = Number(sp.get('min') ?? lo), max = Number(sp.get('max') ?? hi);
  const [price, setPrice] = useState<[number, number]>([min, max]);
  const commitPrice = (a: number, b: number) => {
    let n = setParam(sp, 'min', a <= lo ? null : String(a));
    n = setParam(n, 'max', b >= hi ? null : String(b));
    setSp(n);
  };

  const list = (key: FacetKey, param: string, values: string[], label: (v: string) => string = (v) => v) => (
    <div className="max-h-60 space-y-0.5 overflow-y-auto pr-1">
      {values.map((v) => {
        const count = f[key][v] ?? 0;
        const checked = sel(param).includes(v);
        return <CheckRow key={v} label={label(v)} count={count} checked={checked} disabled={!count && !checked} onChange={() => toggle(param, v)} />;
      })}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-serif text-xl font-semibold">Filter by</h2>
        {active > 0 && <button type="button" onClick={() => setSp(clearFilters(sp))} className="text-[13px] font-semibold text-brown underline underline-offset-4 hover:text-cocoa">Clear all ({active})</button>}
      </div>
      {groups.includes('category') && <Section title="Category">{list('cats', 'cat', CATEGORIES.map((c) => c.slug), (v) => CATEGORY_MAP[v as CategorySlug].label)}</Section>}
      {groups.includes('subcategory') && category && <Section title="Style">{list('subs', 'sub', CATEGORY_MAP[category].subcategories.map((s) => s.slug), (v) => CATEGORY_MAP[category].subcategories.find((s) => s.slug === v)!.label)}</Section>}
      {groups.includes('size') && <Section title="Size">{list('sizes', 'size', universe((p) => p.sizes).sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)))}</Section>}
      {groups.includes('color') && (
        <Section title="Colour">
          <div className="flex flex-wrap gap-2.5">
            {universe((p) => p.colors.map((c) => c.name)).map((name) => {
              const on = sel('color').includes(name); const count = f.colors[name] ?? 0; const hex = COLOR_HEX[name];
              return (
                <button key={name} type="button" aria-pressed={on} aria-label={`${name} (${count})`} title={`${name} (${count})`} disabled={!count && !on} onClick={() => toggle('color', name)}
                  className={cn('h-8 w-8 rounded-full p-[3px] ring-1 transition disabled:opacity-35', on ? 'ring-2 ring-brown' : 'ring-transparent hover:ring-beige')}>
                  <span className={cn('block h-full w-full rounded-full', luminance(hex) > 0.85 && 'ring-1 ring-ink/25')} style={{ background: hex }} />
                </button>
              );
            })}
          </div>
        </Section>
      )}
      {groups.includes('fit') && <Section title="Fit">{list('fits', 'fit', universe((p) => [p.fit]))}</Section>}
      {groups.includes('pattern') && <Section title="Pattern" defaultOpen={false}>{list('patterns', 'pattern', universe((p) => [p.pattern]), cap)}</Section>}
      {groups.includes('fabric') && <Section title="Fabric" defaultOpen={false}>{list('fabrics', 'fabric', universe((p) => [p.fabric]).sort())}</Section>}
      {groups.includes('brand') && <Section title="Brand" defaultOpen={false}>{list('brands', 'brand', universe((p) => [p.brand]))}</Section>}
      {groups.includes('price') && (
        <Section title="Price range">
          <p className="mb-3 text-sm font-semibold">{formatINR(price[0])} – {formatINR(price[1])}</p>
          <label className="block text-xs text-ink/60">From
            <input type="range" className="range-input mt-2" min={lo} max={hi} step={100} value={price[0]} aria-label="Minimum price"
              onChange={(e) => setPrice([Math.min(Number(e.target.value), price[1] - 100), price[1]])} onPointerUp={() => commitPrice(price[0], price[1])} onKeyUp={() => commitPrice(price[0], price[1])} onBlur={() => commitPrice(price[0], price[1])} />
          </label>
          <label className="mt-4 block text-xs text-ink/60">To
            <input type="range" className="range-input mt-2" min={lo} max={hi} step={100} value={price[1]} aria-label="Maximum price"
              onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value), price[0] + 100)])} onPointerUp={() => commitPrice(price[0], price[1])} onKeyUp={() => commitPrice(price[0], price[1])} onBlur={() => commitPrice(price[0], price[1])} />
          </label>
        </Section>
      )}
      {groups.includes('discount') && (
        <Section title="Discount" defaultOpen={false}>
          <div role="radiogroup" aria-label="Minimum discount" className="space-y-0.5">
            {[0, 20, 30, 40].map((d) => (
              <label key={d} className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm hover:bg-beige/40">
                <input type="radio" name="disc" checked={(Number(sp.get('disc')) || 0) === d} onChange={() => setSp(setParam(sp, 'disc', d ? String(d) : null))} className="h-4 w-4 accent-[#6B4226]" />
                {d ? `${d}% and above` : 'Any discount'}
              </label>
            ))}
          </div>
        </Section>
      )}
      {groups.includes('availability') && <Section title="Availability" defaultOpen={false}><CheckRow label="In stock only" checked={sp.get('stock') === '1'} onChange={() => setSp(setParam(sp, 'stock', sp.get('stock') === '1' ? null : '1'))} /></Section>}
    </div>
  );
}
