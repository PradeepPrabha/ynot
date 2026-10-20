import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, Product, ProductColor, Totals } from '@/types';
import { getProductById } from '@/data/catalog';
import { computeTotals, evaluateCoupon, MAX_QTY_PER_LINE, type CouponResult } from '@/services/pricing';
import { storage, KEYS } from '@/utils/storage';

export interface DetailedLine { key: string; product: Product; color: ProductColor; size: string; qty: number; selected: boolean; maxQty: number }
interface Persisted { lines: CartLine[]; coupon?: string }
interface CartApi {
  lines: DetailedLine[];
  selectedLines: DetailedLine[];
  count: number;
  totals: Totals;
  couponCode?: string;
  couponStatus: CouponResult;
  add: (productId: string, color: string, size: string, qty: number) => { ok: boolean; message: string };
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  removeKeys: (keys: string[]) => void;
  toggleSelected: (key: string) => void;
  setAllSelected: (v: boolean) => void;
  applyCoupon: (code: string, subtotal?: number) => CouponResult;
  removeCoupon: () => void;
}
const Ctx = createContext<CartApi | null>(null);
export const useCart = () => { const c = useContext(Ctx); if (!c) throw new Error('useCart outside provider'); return c; };
export const lineKey = (id: string, color: string, size: string) => `${id}|${color}|${size}`;

function hydrate(): Persisted {
  const raw = storage.get<Persisted>(KEYS.cart, { lines: [] });
  const lines = (raw.lines ?? []).filter((l) => {
    const p = getProductById(l.productId);
    return p && p.colors.some((c) => c.name === l.color) && p.sizes.includes(l.size) && l.qty > 0;
  });
  return { lines, coupon: raw.coupon };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(hydrate);
  useEffect(() => { storage.set(KEYS.cart, state); }, [state]);

  const lines = useMemo<DetailedLine[]>(() => state.lines.map((l) => {
    const product = getProductById(l.productId)!;
    return { key: lineKey(l.productId, l.color, l.size), product, color: product.colors.find((c) => c.name === l.color)!, size: l.size, qty: l.qty, selected: l.selected, maxQty: Math.min(MAX_QTY_PER_LINE, product.inventory[`${l.color}|${l.size}`] ?? 0) };
  }), [state.lines]);
  const selectedLines = useMemo(() => lines.filter((l) => l.selected), [lines]);
  const { totals, coupon: couponStatus } = useMemo(() => computeTotals(selectedLines.map((l) => ({ productId: l.product.id, qty: l.qty })), state.coupon), [selectedLines, state.coupon]);

  const add = useCallback<CartApi['add']>((productId, color, size, qty) => {
    const p = getProductById(productId);
    if (!p) return { ok: false, message: 'This product is no longer available.' };
    if (!color) return { ok: false, message: 'Select a colour first.' };
    if (!size) return { ok: false, message: 'Select a size first.' };
    const stock = p.inventory[`${color}|${size}`] ?? 0;
    if (stock <= 0) return { ok: false, message: `${color}, ${size} is out of stock.` };
    let result = { ok: true, message: `${p.title} added to your cart.` };
    setState((s) => {
      const existing = s.lines.find((l) => l.productId === productId && l.color === color && l.size === size);
      const cap = Math.min(stock, MAX_QTY_PER_LINE);
      if (existing) {
        const next = Math.min(existing.qty + qty, cap);
        if (existing.qty + qty > cap) result = { ok: true, message: `Only ${cap} available. Cart updated to ${cap}.` };
        return { ...s, lines: s.lines.map((l) => (l === existing ? { ...l, qty: next, selected: true } : l)) };
      }
      return { ...s, lines: [{ productId, color, size, qty: Math.min(qty, cap), selected: true }, ...s.lines] };
    });
    return result;
  }, []);

  const setQty = useCallback((key: string, qty: number) => setState((s) => ({
    ...s, lines: s.lines.map((l) => {
      if (lineKey(l.productId, l.color, l.size) !== key) return l;
      const p = getProductById(l.productId)!;
      const cap = Math.min(MAX_QTY_PER_LINE, p.inventory[`${l.color}|${l.size}`] ?? 1);
      return { ...l, qty: Math.max(1, Math.min(qty, cap)) };
    }),
  })), []);
  const removeKeys = useCallback((keys: string[]) => setState((s) => ({ ...s, lines: s.lines.filter((l) => !keys.includes(lineKey(l.productId, l.color, l.size))) })), []);
  const remove = useCallback((key: string) => removeKeys([key]), [removeKeys]);
  const toggleSelected = useCallback((key: string) => setState((s) => ({ ...s, lines: s.lines.map((l) => (lineKey(l.productId, l.color, l.size) === key ? { ...l, selected: !l.selected } : l)) })), []);
  const setAllSelected = useCallback((v: boolean) => setState((s) => ({ ...s, lines: s.lines.map((l) => ({ ...l, selected: v })) })), []);

  const applyCoupon = useCallback((code: string, subtotal?: number) => {
    const result = evaluateCoupon(code.trim().toUpperCase() || undefined, subtotal ?? totals.subtotal);
    if (!code.trim()) return { valid: false, message: 'Enter a coupon code.', discount: 0, freeShipping: false };
    if (result.valid) setState((s) => ({ ...s, coupon: result.code }));
    return result;
  }, [totals.subtotal]);
  const removeCoupon = useCallback(() => setState((s) => ({ ...s, coupon: undefined })), []);

  const value = useMemo<CartApi>(() => ({
    lines, selectedLines, count: lines.reduce((n, l) => n + l.qty, 0), totals, couponCode: state.coupon, couponStatus,
    add, setQty, remove, removeKeys, toggleSelected, setAllSelected, applyCoupon, removeCoupon,
  }), [lines, selectedLines, totals, state.coupon, couponStatus, add, setQty, remove, removeKeys, toggleSelected, setAllSelected, applyCoupon, removeCoupon]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
