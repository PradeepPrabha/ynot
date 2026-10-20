import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product, WishlistItem } from '@/types';
import { getProductById } from '@/data/catalog';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useCart } from '@/features/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useUi } from '@/features/ui/UiContext';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs, ColorSwatches, PriceDisplay, Rating, SectionHeading, SizeSelector } from '@/components/ui/Primitives';
import ProductImage from '@/components/products/ProductImage';
import ProductCard from '@/components/products/ProductCard';
import { productService } from '@/services/productService';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';

function WishlistCard({ item, product: p }: { item: WishlistItem; product: Product }) {
  const wish = useWishlist();
  const cart = useCart();
  const toast = useToast();
  const { setCartOpen } = useUi();
  const [color, setColor] = useState(item.color && p.colors.some((c) => c.name === item.color) ? item.color : p.colors[0].name);
  const [size, setSize] = useState(item.size && p.sizes.includes(item.size) ? item.size : '');
  const [err, setErr] = useState(false);
  const stock = (c: string, s: string) => p.inventory[`${c}|${s}`] ?? 0;
  const add = () => {
    if (!size) { setErr(true); toast.error(`Select a size for ${p.title}.`); return; }
    const r = cart.add(p.id, color, size, 1);
    if (r.ok) { toast.success(r.message); setCartOpen(true); } else toast.error(r.message);
  };
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-ivory">
      <Link to={`/product/${p.slug}`} className="block aspect-[4/5] overflow-hidden bg-beige"><ProductImage product={p} color={color} className="transition duration-500 hover:scale-105" /></Link>
      <div className="flex flex-1 flex-col p-3.5">
        <Link to={`/product/${p.slug}`} className="line-clamp-1 text-sm font-semibold hover:text-brown">{p.title}</Link>
        <div className="mt-1"><Rating value={p.rating} count={p.reviewCount} /></div>
        <div className="mt-1.5"><PriceDisplay price={p.price} compareAt={p.compareAtPrice} discount={p.discount} /></div>
        <div className="mt-3"><ColorSwatches colors={p.colors} selected={color} onSelect={(c) => { setColor(c); wish.update(p.id, { color: c }); if (size && stock(c, size) <= 0) setSize(''); }} label={`Colour for ${p.title}`} /></div>
        <div className="mt-3"><SizeSelector sizes={p.sizes} selected={size} onSelect={(s) => { setSize(s); setErr(false); wish.update(p.id, { size: s }); }} isDisabled={(s) => stock(color, s) <= 0} error={err} /></div>
        <div className="mt-4 flex gap-2 pt-1">
          <Button block size="sm" onClick={add} disabled={p.stock === 0}><ShoppingBag className="h-4 w-4" />Add to cart</Button>
          <button onClick={() => { wish.remove(p.id); toast.info('Removed from your wishlist.'); }} aria-label={`Remove ${p.title} from wishlist`} className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-ink/60 hover:border-red-300 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </li>
  );
}

export default function Wishlist() {
  usePageMeta('My wishlist', 'Your saved YNOT styles. Choose a size and add them to your cart.');
  const wish = useWishlist();
  const recs = useAsync(() => productService.recommendations(5, wish.items.map((i) => i.productId)), [wish.count]);
  const items = wish.items.map((i) => ({ item: i, product: getProductById(i.productId) })).filter((x): x is { item: WishlistItem; product: Product } => !!x.product);
  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-serif text-4xl font-semibold">My Wishlist</h1><p className="mt-1 text-sm text-ink/65">{items.length ? `${items.length} saved style${items.length > 1 ? 's' : ''}. Pick a size to add to your cart.` : 'Your favourite styles, all in one place.'}</p></div></div>
      {items.length === 0 ? (
        <EmptyState kind="heart" title="Your wishlist is empty" message="Tap the heart on any product to save it here for later." action={{ label: 'Explore products', to: '/products' }} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(({ item, product }) => <WishlistCard key={item.productId} item={item} product={product} />)}</ul>
      )}
      {recs.data && recs.data.length > 0 && (
        <section className="mt-14" aria-labelledby="wrec-h"><SectionHeading eyebrow="You may also like" title={items.length ? 'More to Love' : 'Start With These'} action={<Heart className="h-5 w-5 text-coral" aria-hidden />} /><h2 id="wrec-h" className="sr-only">Recommendations</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{recs.data.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      )}
    </div>
  );
}
