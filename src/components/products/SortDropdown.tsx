import type { SortKey } from '@/types';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popularity', label: 'Popularity' }, { value: 'newest', label: 'Newest' }, { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' }, { value: 'rating', label: 'Customer Rating' }, { value: 'discount', label: 'Biggest Discount' },
];
export default function SortDropdown({ value, onChange, withRelevance }: { value: SortKey; onChange: (s: SortKey) => void; withRelevance?: boolean }) {
  const opts = withRelevance ? [{ value: 'relevance' as SortKey, label: 'Relevance' }, ...OPTIONS] : OPTIONS;
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="font-medium text-ink/70">Sort by</span>
      <select value={value} onChange={(e) => onChange(e.target.value as SortKey)} className="rounded-lg border border-[var(--border)] bg-white py-2.5 pl-3 pr-8 text-sm font-semibold text-ink focus:border-brown focus:outline-none focus:ring-2 focus:ring-brown/20">
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
