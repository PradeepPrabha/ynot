import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { ColorSwatches, PriceDisplay, Rating } from '@/components/ui/Primitives';
import { cn } from '@/utils/format';
import ProductImage from './ProductImage';
import WishlistButton from './WishlistButton';
import QuickAddModal from './QuickAddModal';

const isNew = (p: Product) => Date.now() - new Date(p.createdAt).getTime() < 45 * 86400000;

function ProductCard({ product: p, layout = 'grid' }: { product: Product; layout?: 'grid' | 'list' }) {
  const [quick, setQuick] = useState(false);
  const soldOut = p.stock <= 0;
  const badge = soldOut ? 'Sold out' : p.bestSeller ? 'Best seller' : isNew(p) ? 'New' : null;
  const list = layout === 'list';
  return (
    <article className={cn('group relative overflow-hidden rounded-xl border border-[var(--border)] bg-ivory transition hover:shadow-lift', list && 'flex')}>
      <div className={cn('relative overflow-hidden bg-beige', list ? 'w-40 shrink-0 sm:w-56' : 'aspect-[4/5]')}>
        <Link to={`/product/${p.slug}`} className="block h-full" aria-label={`View ${p.title}`} tabIndex={-1}>
          <div className={cn('h-full transition duration-500 group-hover:scale-105', list && 'aspect-[4/5]')}><ProductImage product={p} /></div>
        </Link>
        {badge && <span className={cn('absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide', soldOut ? 'bg-ink text-ivory' : 'bg-ivory/95 text-brown')}>{badge}</span>}
        <WishlistButton productId={p.id} title={p.title} className="absolute right-2.5 top-2.5 z-10" />
      </div>
      <div className={cn('p-3', list && 'flex flex-1 flex-col justify-between p-4 sm:p-5')}>
        <div>
          <ColorSwatches colors={p.colors} />
          <h3 className="mt-2.5 line-clamp-1 font-sans text-sm font-semibold text-ink"><Link to={`/product/${p.slug}`} className="before:absolute before:inset-0 before:z-0 focus-visible:outline-none">{p.title}</Link></h3>
          {list && <p className="mt-1 line-clamp-2 hidden text-sm text-ink/65 sm:block">{p.description}</p>}
          <div className="mt-1"><Rating value={p.rating} count={p.reviewCount} /></div>
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <PriceDisplay price={p.price} compareAt={p.compareAtPrice} discount={p.discount} />
          <button type="button" disabled={soldOut} onClick={() => setQuick(true)} aria-label={`Quick add ${p.title} to cart`} className="relative z-10 -mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-cocoa transition hover:border-cocoa hover:bg-cocoa hover:text-ivory disabled:opacity-40">
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
      {quick && <QuickAddModal product={p} open={quick} onClose={() => setQuick(false)} />}
    </article>
  );
}
export default memo(ProductCard);
