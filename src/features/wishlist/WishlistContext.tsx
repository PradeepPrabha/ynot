import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { WishlistItem } from '@/types';
import { getProductById } from '@/data/catalog';
import { storage, KEYS } from '@/utils/storage';

interface WishlistApi {
  items: WishlistItem[];
  count: number;
  has: (id: string) => boolean;
  add: (id: string, extra?: Partial<WishlistItem>) => void;
  remove: (id: string) => void;
  toggle: (id: string) => boolean;
  update: (id: string, patch: Partial<WishlistItem>) => void;
}
const Ctx = createContext<WishlistApi | null>(null);
export const useWishlist = () => { const c = useContext(Ctx); if (!c) throw new Error('useWishlist outside provider'); return c; };

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => storage.get<WishlistItem[]>(KEYS.wishlist, []).filter((i) => getProductById(i.productId)));
  useEffect(() => { storage.set(KEYS.wishlist, items); }, [items]);
  const has = useCallback((id: string) => items.some((i) => i.productId === id), [items]);
  const add = useCallback((id: string, extra?: Partial<WishlistItem>) => setItems((l) => (l.some((i) => i.productId === id) ? l : [{ productId: id, addedAt: new Date().toISOString(), ...extra }, ...l])), []);
  const remove = useCallback((id: string) => setItems((l) => l.filter((i) => i.productId !== id)), []);
  const toggle = useCallback((id: string) => {
    const exists = items.some((i) => i.productId === id);
    if (exists) remove(id); else add(id);
    return !exists;
  }, [items, add, remove]);
  const update = useCallback((id: string, patch: Partial<WishlistItem>) => setItems((l) => l.map((i) => (i.productId === id ? { ...i, ...patch } : i))), []);
  const value = useMemo(() => ({ items, count: items.length, has, add, remove, toggle, update }), [items, has, add, remove, toggle, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
