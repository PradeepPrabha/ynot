import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/Primitives';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductImage from '@/components/products/ProductImage';
import { useCart } from '@/features/cart/CartContext';
import { useUi } from '@/features/ui/UiContext';
import { FREE_SHIPPING_ABOVE } from '@/services/pricing';
import { formatINR } from '@/utils/format';

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUi();
  const cart = useCart();
  const nav = useNavigate();
  const close = () => setCartOpen(false);
  const all = cart.lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const remaining = Math.max(0, FREE_SHIPPING_ABOVE + 1 - all);
  const pct = Math.min(100, (all / (FREE_SHIPPING_ABOVE + 1)) * 100);

  return (
    <Drawer open={cartOpen} onClose={close} title={`Your cart (${cart.count})`}
      footer={cart.lines.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between"><span className="text-sm text-ink/70">Subtotal</span><span className="text-lg font-bold">{formatINR(all)}</span></div>
          <div className="grid grid-cols-2 gap-3">
            <LinkButton to="/cart" variant="outline" onClick={close}>View cart</LinkButton>
            <Button onClick={() => { close(); nav('/checkout'); }} disabled={cart.selectedLines.length === 0}>Checkout</Button>
          </div>
          <p className="mt-3 text-center text-xs text-ink/55">Taxes included. Coupons are applied at checkout.</p>
        </div>
      )}>
      {cart.lines.length === 0 ? (
        <EmptyState kind="bag" title="Your cart is empty" message="Add a piece you love and it will show up here." action={{ label: 'Start shopping', to: '/products' }} secondary={<Button variant="ghost" onClick={close}>Close</Button>} />
      ) : (
        <div className="p-5">
          <div className="mb-5 rounded-xl bg-beige/50 p-3.5">
            <p className="text-[13px] font-semibold text-cocoa">{remaining > 0 ? `Add ${formatINR(remaining)} more for free delivery` : 'You have unlocked free delivery'}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-beige" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex gap-3.5 py-4 first:pt-0">
                <Link to={`/product/${l.product.slug}`} onClick={close} className="aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg"><ProductImage product={l.product} color={l.color.name} /></Link>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <Link to={`/product/${l.product.slug}`} onClick={close} className="line-clamp-2 text-sm font-semibold hover:text-brown">{l.product.title}</Link>
                    <button onClick={() => cart.remove(l.key)} aria-label={`Remove ${l.product.title} from cart`} className="h-7 w-7 shrink-0 rounded-full text-ink/50 hover:bg-beige hover:text-ink"><Trash2 className="mx-auto h-4 w-4" /></button>
                  </div>
                  <p className="mt-0.5 text-xs text-ink/60">{l.color.name} · {l.size}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper value={l.qty} max={Math.max(1, l.maxQty)} onChange={(n) => cart.setQty(l.key, n)} label={`Quantity for ${l.product.title}`} />
                    <span className="text-sm font-bold">{formatINR(l.product.price * l.qty)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
