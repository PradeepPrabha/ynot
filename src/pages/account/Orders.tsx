import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { orderService } from '@/services/orderService';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { statusLabel } from '@/utils/orderTimeline';
import { Breadcrumbs, Skeleton } from '@/components/ui/Primitives';
import { LinkButton, Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductImage from '@/components/products/ProductImage';
import { getProductById } from '@/data/catalog';
import { formatDate, formatINR } from '@/utils/format';

export default function Orders() {
  usePageMeta('My orders', 'View and track your YNOT orders.');
  const { user, actorId } = useAuth();
  const { data, loading, error, reload } = useAsync(() => orderService.list(actorId), [actorId]);
  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, ...(user ? [{ label: 'Account', to: '/account' }] : []), { label: 'Orders' }]} />
      <h1 className="font-serif text-4xl font-semibold">Order history</h1>
      {!user && <p className="mt-2 rounded-lg bg-beige/50 p-3 text-sm text-ink/75">Showing orders placed on this device as a guest. <Link to="/login" state={{ from: '/account/orders' }} className="link-underline font-semibold">Log in</Link> to keep them with your account.</p>}
      <div className="mt-6">
        {loading ? <div className="space-y-3" role="status" aria-label="Loading orders">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
        : error ? <EmptyState kind="alert" title="We couldn’t load your orders" message={error} secondary={<Button onClick={reload}>Try again</Button>} />
        : !data?.length ? <EmptyState kind="box" title="No orders yet" message="When you place an order, it will show up here so you can track it." action={{ label: 'Start shopping', to: '/products' }} />
        : (
          <ul className="space-y-4">{data.map((o) => (
            <li key={o.id} className="rounded-xl border border-[var(--border)] bg-ivory p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3 text-sm">
                <div><p className="font-bold">{o.id}</p><p className="text-xs text-ink/60">Placed on {formatDate(o.createdAt)}</p></div>
                <span className="rounded-md bg-success/12 px-2.5 py-1 text-xs font-bold text-success">{statusLabel(o)}</span>
                <p className="font-bold">{formatINR(o.totals.total)}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <ul className="flex gap-2">{o.lines.slice(0, 4).map((l) => { const p = getProductById(l.productId); return p ? <li key={`${l.productId}${l.color}${l.size}`} className="aspect-[4/5] w-14 overflow-hidden rounded-lg border border-[var(--border)]"><ProductImage product={p} color={l.color} /></li> : null; })}{o.lines.length > 4 && <li className="flex w-14 items-center justify-center text-xs font-semibold text-ink/60">+{o.lines.length - 4}</li>}</ul>
                <LinkButton to={`/account/orders/${o.id}`} variant="outline" size="sm">View order</LinkButton>
              </div>
            </li>))}</ul>
        )}
      </div>
    </div>
  );
}
