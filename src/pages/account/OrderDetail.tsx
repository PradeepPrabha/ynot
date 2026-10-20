import { useParams, Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { orderService } from '@/services/orderService';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { downloadInvoice } from '@/utils/invoice';
import { statusLabel } from '@/utils/orderTimeline';
import { Breadcrumbs, Skeleton } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TotalsTable } from '@/components/cart/OrderSummary';
import { METHOD_LABEL } from '@/components/checkout/DemoGatewayModal';
import Timeline from '@/components/checkout/Timeline';
import ProductImage from '@/components/products/ProductImage';
import { getProductById } from '@/data/catalog';
import { formatDate, formatDateTime, formatINR } from '@/utils/format';

export default function OrderDetail() {
  const { id = '' } = useParams();
  const { actorId, user } = useAuth();
  const { data: o, loading, error, reload } = useAsync(() => orderService.get(id, actorId), [id, actorId]);
  usePageMeta(`Order ${id}`);
  if (loading) return <div className="container-page space-y-4 py-8" role="status"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64" /></div>;
  if (error) return <div className="container-page"><EmptyState level={1} kind="alert" title="We couldn’t load this order" message={error} secondary={<Button onClick={reload}>Try again</Button>} /></div>;
  if (!o) return <div className="container-page"><EmptyState level={1} kind="lock" title="Order not found" message="We couldn’t find this order for your account. It may belong to a different account, or the number may be wrong." action={{ label: 'View my orders', to: '/account/orders' }} /></div>;
  const paid = o.paymentStatus === 'paid';
  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, ...(user ? [{ label: 'Account', to: '/account' }] : []), { label: 'Orders', to: '/account/orders' }, { label: o.id }]} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="font-serif text-3xl font-semibold sm:text-4xl">Order {o.id}</h1><p className="mt-1 text-sm text-ink/65">Placed on {formatDateTime(o.createdAt)} · <span className="font-semibold text-success">{statusLabel(o)}</span></p></div>
        <Button variant="outline" onClick={() => downloadInvoice(o)}><Download className="h-4 w-4" />Download invoice</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl2 border border-[var(--border)] bg-ivory p-5" aria-labelledby="items-h"><h2 id="items-h" className="mb-3 font-serif text-xl font-semibold">Items ({o.totals.itemCount})</h2>
            <ul className="divide-y divide-[var(--border)]">{o.lines.map((l) => { const p = getProductById(l.productId); return (
              <li key={`${l.productId}${l.color}${l.size}`} className="flex gap-4 py-3.5">
                <span className="aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg">{p && <ProductImage product={p} color={l.color} />}</span>
                <div className="min-w-0 flex-1 text-sm"><Link to={`/product/${l.slug}`} className="line-clamp-2 font-semibold hover:text-brown">{l.title}</Link><p className="mt-1 text-xs text-ink/60">{l.color} · Size {l.size} · Qty {l.qty}</p></div>
                <p className="text-sm font-bold">{formatINR(l.unitPrice * l.qty)}</p>
              </li>); })}</ul>
          </section>
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl2 border border-[var(--border)] bg-ivory p-5"><h2 className="mb-2 font-serif text-xl font-semibold">Shipping address</h2><p className="text-sm leading-6 text-ink/75"><strong className="text-ink">{o.address.fullName}</strong><br />{o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}<br />{o.address.city}, {o.address.state} {o.address.pincode}<br />{o.address.phone}</p></section>
            <section className="rounded-xl2 border border-[var(--border)] bg-ivory p-5"><h2 className="mb-2 font-serif text-xl font-semibold">Payment</h2><p className="text-sm leading-6 text-ink/75">{METHOD_LABEL[o.paymentMethod]}<br /><span className={paid ? 'font-semibold text-success' : 'font-semibold text-brown'}>{paid ? 'Paid and verified' : 'Pay on delivery'}</span>{o.paymentRef && <><br /><span className="text-xs text-ink/50">Ref {o.paymentRef}</span></>}</p><div className="mt-4 border-t border-[var(--border)] pt-4"><TotalsTable totals={o.totals} /></div></section>
          </div>
        </div>
        <section id="tracking" className="h-fit scroll-mt-28 rounded-xl2 border border-[var(--border)] bg-ivory p-6 lg:sticky lg:top-28" aria-labelledby="trk-h"><h2 id="trk-h" className="font-serif text-xl font-semibold">Shipment timeline</h2><p className="mb-5 mt-1 text-xs text-ink/60">Estimated delivery by {formatDate(o.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'long' })}</p><Timeline order={o} /></section>
      </div>
    </div>
  );
}
