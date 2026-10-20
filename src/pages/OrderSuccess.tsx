import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarDays, Headphones, MapPin, PackageCheck } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/features/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { productService } from '@/services/productService';
import { Button, LinkButton } from '@/components/ui/Button';
import { SectionHeading, Skeleton, Spinner } from '@/components/ui/Primitives';
import { METHOD_LABEL } from '@/components/checkout/DemoGatewayModal';
import Timeline from '@/components/checkout/Timeline';
import ProductCard from '@/components/products/ProductCard';
import ProductImage from '@/components/products/ProductImage';
import { getProductById } from '@/data/catalog';
import { SITE } from '@/data/site';
import { formatDate, formatDateTime, formatINR } from '@/utils/format';

export default function OrderSuccess() {
  const { orderId = '' } = useParams();
  const { actorId } = useAuth();
  // The URL only carries an id. Whether it is shown as "success" is decided by the server's verified record.
  const check = useAsync(() => paymentService.confirm(orderId, actorId), [orderId, actorId]);
  const recs = useAsync(() => productService.recommendations(5), []);
  usePageMeta(check.data?.verified ? 'Order confirmed' : 'Verifying order');

  if (check.loading) return <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center" role="status"><Spinner className="h-9 w-9" /><p className="font-serif text-2xl font-semibold">Verifying your payment…</p><p className="text-sm text-ink/65">Please don’t close this page.</p><Skeleton className="h-3 w-48" /></div>;

  const r = check.data;
  if (!r || !r.verified || !r.order) {
    return (
      <div className="container-page py-16"><div className="mx-auto max-w-lg rounded-xl2 border border-[var(--border)] bg-ivory p-8 text-center shadow-soft">
        <AlertTriangle className="mx-auto h-14 w-14 text-coral" aria-hidden />
        <h1 className="mt-4 font-serif text-3xl font-semibold">We couldn’t verify this payment</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">{check.error ?? r?.reason ?? 'This order could not be confirmed.'} If money was debited from your account, it will be refunded automatically, or contact support with your order number.</p>
        <p className="mt-2 text-xs text-ink/50">Reference: {orderId}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"><LinkButton to="/cart">Back to cart</LinkButton><LinkButton to="/account/orders" variant="outline">My orders</LinkButton><Button variant="ghost" onClick={check.reload}>Check again</Button></div>
      </div></div>
    );
  }

  const o = r.order;
  const cod = o.paymentStatus === 'cod_due';
  return (
    <div className="container-page pb-14 pt-8">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl2 border border-[var(--border)] bg-gradient-to-br from-ivory to-cream p-6 sm:p-9" aria-labelledby="ok-h">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0" aria-hidden><circle cx="40" cy="40" r="36" fill="#258A48" /><path d="M24 41l11 11 21-23" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" className="animate-check-draw" /></svg>
            <div><h1 id="ok-h" className="font-serif text-4xl font-semibold">{cod ? 'Order confirmed!' : 'Payment successful!'}</h1><p className="mt-1.5 text-ink/70">Thank you for shopping with YNOT. {cod ? 'Pay on delivery when your order arrives.' : 'Your payment has been verified and your order is confirmed.'}</p></div>
          </div>
          <dl className="mt-7 grid gap-4 rounded-xl bg-ivory p-5 text-sm sm:grid-cols-2">
            <div><dt className="text-ink/55">Order number</dt><dd className="mt-0.5 text-lg font-bold">{o.id}</dd></div>
            <div><dt className="text-ink/55">Order date</dt><dd className="mt-0.5 font-semibold">{formatDateTime(o.createdAt)}</dd></div>
            <div><dt className="text-ink/55">Payment method</dt><dd className="mt-0.5 font-semibold">{METHOD_LABEL[o.paymentMethod]}</dd></div>
            <div><dt className="text-ink/55">Payment status</dt><dd className="mt-0.5"><span className="rounded-md bg-success/12 px-2 py-1 text-xs font-bold text-success">{cod ? 'Pay on delivery' : 'Verified · Paid'}</span></dd></div>
            <div className="sm:col-span-2 border-t border-[var(--border)] pt-4"><dt className="text-ink/55">{cod ? 'Amount due on delivery' : 'Total paid'}</dt><dd className="mt-0.5 text-2xl font-bold">{formatINR(o.totals.total)}</dd></div>
            {o.paymentRef && <div className="sm:col-span-2 text-xs text-ink/50">Payment reference: {o.paymentRef} (demo sandbox)</div>}
          </dl>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-5"><h2 className="mb-2 flex items-center gap-2 font-sans text-sm font-bold"><MapPin className="h-4 w-4 text-brown" aria-hidden />Shipping information</h2><p className="text-sm leading-6 text-ink/75"><strong className="text-ink">{o.address.fullName}</strong><br />{o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}<br />{o.address.city}, {o.address.state} {o.address.pincode}<br />{o.address.phone}</p></div>
            <div className="rounded-xl border border-[var(--border)] p-5"><h2 className="mb-2 flex items-center gap-2 font-sans text-sm font-bold"><CalendarDays className="h-4 w-4 text-brown" aria-hidden />Estimated delivery</h2><p className="font-serif text-2xl font-semibold">{formatDate(o.estimatedDelivery, { weekday: 'short', day: 'numeric', month: 'short' })}</p><p className="mt-1 text-xs text-ink/60">We will update you at every step.</p></div>
          </div>
          <ul className="mt-6 flex gap-2 overflow-x-auto pb-1">{o.lines.map((l) => { const p = getProductById(l.productId); return p ? <li key={`${l.productId}${l.color}${l.size}`} className="aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)]"><ProductImage product={p} color={l.color} /></li> : null; })}</ul>
          <div className="mt-7 flex flex-wrap gap-3"><LinkButton to={`/account/orders/${o.id}`}>View order details</LinkButton><LinkButton to={`/account/orders/${o.id}#tracking`} variant="outline">Track your order</LinkButton><LinkButton to="/products" variant="ghost">Continue shopping</LinkButton></div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl2 border border-[var(--border)] bg-ivory p-6"><h2 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold"><PackageCheck className="h-5 w-5 text-brown" aria-hidden />Order tracking</h2><Timeline order={o} /></section>
          <section className="rounded-xl2 border border-[var(--border)] bg-cream p-6"><h2 className="mb-2 flex items-center gap-2 font-serif text-xl font-semibold"><Headphones className="h-5 w-5 text-brown" aria-hidden />Need help?</h2><p className="text-sm leading-6 text-ink/70">Questions about your order? Write to <a className="link-underline font-semibold" href={`mailto:${SITE.supportEmail}?subject=Order%20${o.id}`}>{SITE.supportEmail}</a> or read our <Link to="/pages/returns" className="link-underline font-semibold">returns policy</Link>.</p></section>
        </aside>
      </div>
      {recs.data && <section className="mt-14" aria-labelledby="osr-h"><SectionHeading eyebrow="Keep exploring" title="You May Also Like" /><h2 id="osr-h" className="sr-only">Recommendations</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{recs.data.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>}
    </div>
  );
}
