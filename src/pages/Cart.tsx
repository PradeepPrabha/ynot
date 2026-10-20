import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Package, RotateCcw, ShieldCheck, Trash2, Truck } from 'lucide-react';
import { useCart } from '@/features/cart/CartContext';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs, PriceDisplay, QuantityStepper, SectionHeading } from '@/components/ui/Primitives';
import { CouponBox, TotalsTable } from '@/components/cart/OrderSummary';
import ProductImage from '@/components/products/ProductImage';
import ProductCard from '@/components/products/ProductCard';
import { productService } from '@/services/productService';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatINR } from '@/utils/format';

export default function Cart() {
  usePageMeta('Shopping cart', 'Review the items in your YNOT cart and proceed to a secure checkout.');
  const cart = useCart();
  const wish = useWishlist();
  const toast = useToast();
  const confirm = useConfirm();
  const nav = useNavigate();
  const recs = useAsync(() => productService.recommendations(5, cart.lines.map((l) => l.product.id)), [cart.lines.length]);
  const selected = cart.selectedLines;
  const allSelected = cart.lines.length > 0 && selected.length === cart.lines.length;
  const keys = (l: typeof cart.lines) => l.map((x) => x.key);

  const removeOne = async (key: string, title: string) => {
    if (await confirm({ title: 'Remove this item?', message: `${title} will be removed from your cart.`, confirmLabel: 'Remove', destructive: true })) { cart.remove(key); toast.info('Item removed from your cart.'); }
  };
  const moveToWishlist = (l: (typeof cart.lines)[number]) => { wish.add(l.product.id, { color: l.color.name, size: l.size }); cart.remove(l.key); toast.success('Moved to your wishlist.'); };
  const removeSelected = async () => {
    if (await confirm({ title: `Remove ${selected.length} selected item${selected.length > 1 ? 's' : ''}?`, message: 'They will be removed from your cart.', confirmLabel: 'Remove', destructive: true })) { cart.removeKeys(keys(selected)); toast.info('Selected items removed.'); }
  };
  const moveSelected = () => { selected.forEach((l) => wish.add(l.product.id, { color: l.color.name, size: l.size })); cart.removeKeys(keys(selected)); toast.success('Selected items moved to your wishlist.'); };

  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <div className="mb-6 flex items-end justify-between gap-4"><div><h1 className="font-serif text-4xl font-semibold">Shopping Cart</h1>{cart.lines.length > 0 && <p className="mt-1 text-sm text-ink/65">{cart.count} item{cart.count > 1 ? 's' : ''} in your cart</p>}</div><Link to="/products" className="hidden text-sm font-semibold text-brown underline underline-offset-4 sm:block">Continue shopping</Link></div>

      {cart.lines.length === 0 ? (
        <EmptyState kind="bag" title="Your cart is empty" message="Looks like you haven’t added anything yet. Explore the collection and find something you love." action={{ label: 'Continue shopping', to: '/products' }} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section aria-label="Cart items">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-cream px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold"><input type="checkbox" checked={allSelected} onChange={(e) => cart.setAllSelected(e.target.checked)} className="h-4 w-4 accent-[#6B4226]" />Select all ({cart.lines.length})</label>
              <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={moveSelected} disabled={!selected.length}><Heart className="h-4 w-4" />Move to wishlist</Button><Button variant="ghost" size="sm" onClick={removeSelected} disabled={!selected.length}><Trash2 className="h-4 w-4" />Remove</Button></div>
            </div>
            <ul className="space-y-3">
              {cart.lines.map((l) => (
                <li key={l.key} className="flex gap-3 rounded-xl border border-[var(--border)] bg-ivory p-3 sm:gap-5 sm:p-4">
                  <input type="checkbox" checked={l.selected} onChange={() => cart.toggleSelected(l.key)} aria-label={`Select ${l.product.title}`} className="mt-1 h-4 w-4 shrink-0 accent-[#6B4226]" />
                  <Link to={`/product/${l.product.slug}`} className="aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg sm:w-28"><ProductImage product={l.product} color={l.color.name} /></Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${l.product.slug}`} className="line-clamp-2 font-semibold hover:text-brown">{l.product.title}</Link>
                        <p className="mt-1 flex items-center gap-2 text-[13px] text-ink/65"><span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-ink/20" style={{ background: l.color.hex }} aria-hidden />{l.color.name} · Size {l.size}</p>
                        {l.maxQty <= 3 && <p className="mt-1 text-xs font-semibold text-coral">{l.maxQty === 0 ? 'Now out of stock. Remove to continue.' : `Only ${l.maxQty} left`}</p>}
                      </div>
                      <div className="text-right"><p className="font-bold">{formatINR(l.product.price * l.qty)}</p><p className="text-xs text-ink/45 line-through">{formatINR(l.product.compareAtPrice * l.qty)}</p></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3"><QuantityStepper value={l.qty} max={Math.max(1, l.maxQty)} onChange={(n) => cart.setQty(l.key, n)} label={`Quantity for ${l.product.title}`} /><PriceDisplay price={l.product.price} discount={l.product.discount} /></div>
                      <div className="flex gap-1 text-[13px] font-semibold"><button onClick={() => moveToWishlist(l)} className="rounded-md px-2.5 py-2 text-brown hover:bg-beige/60">Move to wishlist</button><button onClick={() => removeOne(l.key, l.product.title)} className="rounded-md px-2.5 py-2 text-ink/60 hover:bg-beige/60 hover:text-red-700">Remove</button></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside aria-label="Order summary" className="h-fit rounded-xl2 border border-[var(--border)] bg-ivory p-5 shadow-soft lg:sticky lg:top-28">
            <h2 className="mb-4 font-serif text-2xl font-semibold">Order Summary</h2>
            {selected.length === 0 ? <p className="rounded-lg bg-beige/50 p-3 text-sm text-ink/70">Select at least one item to see your total.</p> : (<><TotalsTable totals={cart.totals} /><div className="mt-5 border-t border-[var(--border)] pt-5"><CouponBox subtotal={cart.totals.subtotal} status={cart.couponStatus} /></div></>)}
            <Button block className="mt-5" disabled={selected.length === 0 || selected.some((l) => l.maxQty === 0)} onClick={() => nav('/checkout')}><Lock className="h-4 w-4" />Proceed to checkout</Button>
            <LinkButton to="/products" variant="outline" block className="mt-3">Continue shopping</LinkButton>
            <ul className="mt-5 grid gap-2.5 text-[13px] text-ink/70">{[[Truck, 'Free shipping above ₹999'], [RotateCcw, 'Easy 7-day returns'], [ShieldCheck, 'Secure payments'], [Package, 'Original quality guaranteed']].map(([I, t]) => { const Icon = I as typeof Truck; return <li key={t as string} className="flex items-center gap-2"><Icon className="h-4 w-4 text-brown" aria-hidden />{t as string}</li>; })}</ul>
          </aside>
        </div>
      )}

      {recs.data && recs.data.length > 0 && (
        <section className="mt-14" aria-labelledby="rec-h"><SectionHeading eyebrow="Picked for you" title="You May Also Like" /><h2 id="rec-h" className="sr-only">Recommendations</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{recs.data.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      )}
    </div>
  );
}
