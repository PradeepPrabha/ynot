import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Search, X } from 'lucide-react';
import { useUi } from '@/features/ui/UiContext';
import { useDebounced } from '@/hooks/useDebounced';
import { useLockBody } from '@/hooks/useLockBody';
import { useFocusTrap } from '@/components/ui/Modal';
import { productService } from '@/services/productService';
import { POPULAR_SEARCHES } from '@/data/site';
import { storage, KEYS } from '@/utils/storage';
import { formatINR } from '@/utils/format';
import type { Product } from '@/types';
import ProductImage from '@/components/products/ProductImage';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUi();
  const [q, setQ] = useState('');
  const [res, setRes] = useState<{ products: Product[]; categories: { slug: string; label: string }[] } | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const dq = useDebounced(q.trim());
  const nav = useNavigate();
  const close = () => setSearchOpen(false);
  useLockBody(searchOpen);
  const ref = useFocusTrap(searchOpen, close);

  useEffect(() => { if (searchOpen) { setQ(''); setRes(null); setRecent(storage.get<string[]>(KEYS.recent, [])); } }, [searchOpen]);
  useEffect(() => {
    let live = true;
    if (!dq) { setRes(null); return; }
    productService.suggest(dq).then((r) => { if (live) setRes(r); });
    return () => { live = false; };
  }, [dq]);

  const go = (term: string) => {
    const t = term.trim(); if (!t) return;
    storage.set(KEYS.recent, [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5));
    close(); nav(`/search?q=${encodeURIComponent(t)}`);
  };
  if (!searchOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 animate-fade-in bg-ink/45" onClick={close} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Search products" className="relative max-h-[90vh] animate-pop-in overflow-y-auto bg-ivory shadow-lift">
        <div className="container-page py-5">
          <form role="search" onSubmit={(e) => { e.preventDefault(); go(q); }} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4">
            <Search className="h-5 w-5 text-brown" aria-hidden />
            <label htmlFor="overlay-search" className="sr-only">Search for shirts, jeans, jackets</label>
            <input id="overlay-search" data-autofocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for shirts, jeans, jackets…" autoComplete="off" className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-ink/40" />
            <button type="button" onClick={close} aria-label="Close search" className="rounded-full p-2 text-ink/60 hover:bg-beige"><X className="h-5 w-5" /></button>
          </form>

          {!dq ? (
            <div className="grid gap-8 py-6 md:grid-cols-2">
              <div>
                <h2 className="mb-3 font-sans text-sm font-bold">Popular searches</h2>
                <div className="flex flex-wrap gap-2">{POPULAR_SEARCHES.map((s) => <button key={s} onClick={() => go(s)} className="chip">{s}</button>)}</div>
              </div>
              {recent.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between"><h2 className="font-sans text-sm font-bold">Recent searches</h2><button className="text-xs font-semibold text-brown underline" onClick={() => { storage.remove(KEYS.recent); setRecent([]); }}>Clear</button></div>
                  <ul className="space-y-1">{recent.map((r) => <li key={r}><button onClick={() => go(r)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-beige/50"><Clock className="h-4 w-4 text-ink/40" aria-hidden />{r}</button></li>)}</ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6" aria-live="polite">
              {res && res.products.length === 0 && res.categories.length === 0 && <p className="text-sm text-ink/70">No quick matches for “{dq}”. Press Enter to search the full catalogue, or try “shirt”, “jeans” or “watch”.</p>}
              {res && res.categories.length > 0 && <div className="mb-5 flex flex-wrap gap-2">{res.categories.map((c) => <Link key={c.slug} to={`/category/${c.slug}`} onClick={close} className="chip">Browse {c.label}</Link>)}</div>}
              {res && res.products.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {res.products.map((p) => (
                    <li key={p.id}><Link to={`/product/${p.slug}`} onClick={close} className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-2.5 hover:border-brown">
                      <span className="aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} /></span>
                      <span className="min-w-0"><span className="line-clamp-2 text-sm font-semibold">{p.title}</span><span className="text-xs text-ink/60">{formatINR(p.price)}</span></span>
                    </Link></li>
                  ))}
                </ul>
              )}
              {dq && <button onClick={() => go(dq)} className="mt-5 text-sm font-semibold text-brown underline underline-offset-4">See all results for “{dq}”</button>}
            </div>
          )}
        </div>
      </div>
    </div>, document.body);
}
