import { useState, type ReactNode } from 'react';
import { Check, Tag, X } from 'lucide-react';
import type { Totals } from '@/types';
import { useCart } from '@/features/cart/CartContext';
import { COUPONS, FREE_SHIPPING_ABOVE, type CouponResult } from '@/services/pricing';
import { Button } from '@/components/ui/Button';
import { formatINR, cn } from '@/utils/format';

export function CouponBox({ subtotal, status }: { subtotal: number; status: CouponResult }) {
  const cart = useCart();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const apply = () => { const r = cart.applyCoupon(code, subtotal); setMsg({ ok: r.valid, text: r.message }); if (r.valid) setCode(''); };
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Tag className="h-4 w-4 text-brown" aria-hidden />Have a coupon?</p>
      {cart.couponCode && status.valid ? (
        <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 font-semibold text-success"><Check className="h-4 w-4" />{cart.couponCode} applied</span>
          <button type="button" onClick={() => { cart.removeCoupon(); setMsg(null); }} aria-label="Remove coupon" className="rounded p-1 text-ink/60 hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex gap-2">
          <label className="sr-only" htmlFor="coupon">Coupon code</label>
          <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="field !min-h-[44px] flex-1 uppercase" autoComplete="off" />
          <Button type="submit" variant="outline" size="sm" className="!min-h-[44px]">Apply</Button>
        </form>
      )}
      {msg && !cart.couponCode && <p role="status" className={cn('mt-2 text-xs font-medium', msg.ok ? 'text-success' : 'text-red-700')}>{msg.text}</p>}
      {cart.couponCode && !status.valid && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{status.message}</p>}
      {!cart.couponCode && (
        <details className="mt-2 text-xs text-ink/65"><summary className="cursor-pointer font-semibold text-brown">View available offers</summary>
          <ul className="mt-2 space-y-1.5">{COUPONS.map((c) => <li key={c.code}><button type="button" onClick={() => setCode(c.code)} className="font-bold text-cocoa underline underline-offset-2">{c.code}</button> — {c.label}</li>)}</ul>
        </details>
      )}
    </div>
  );
}

export function TotalsTable({ totals }: { totals: Totals }) {
  const row = (label: string, value: ReactNode, cls = '') => <div className={cn('flex items-center justify-between text-sm', cls)}><dt className="text-ink/70">{label}</dt><dd className="font-semibold">{value}</dd></div>;
  return (
    <dl className="space-y-3">
      {row(`Price (${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'})`, formatINR(totals.mrpTotal))}
      {totals.productSavings > 0 && row('Discount', `− ${formatINR(totals.productSavings)}`, 'text-success [&_dt]:text-success')}
      {totals.couponDiscount > 0 && row(`Coupon (${totals.couponCode})`, `− ${formatINR(totals.couponDiscount)}`, 'text-success [&_dt]:text-success')}
      {row('Delivery', totals.shipping === 0 ? <span className="text-success">Free</span> : formatINR(totals.shipping))}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3"><dt className="font-semibold">Total amount</dt><dd className="text-xl font-bold">{formatINR(totals.total)}</dd></div>
      {totals.totalSavings > 0 && <p className="rounded-lg bg-success/10 px-3 py-2 text-[13px] font-semibold text-success">You will save {formatINR(totals.totalSavings)} on this order.</p>}
      {totals.shipping > 0 && <p className="text-xs text-ink/60">Add {formatINR(FREE_SHIPPING_ABOVE + 1 - totals.subtotal)} more for free delivery.</p>}
    </dl>
  );
}
