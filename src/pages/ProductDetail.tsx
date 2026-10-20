import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Check, Package, RotateCcw, ShoppingBag, Truck, Zap } from 'lucide-react';
import type { ImageView, Product } from '@/types';
import { CATEGORY_MAP } from '@/data/categories';
import { productService } from '@/services/productService';
import { checkPincode, FREE_SHIPPING_ABOVE, type PincodeResult } from '@/services/pricing';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCart, lineKey } from '@/features/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useUi } from '@/features/ui/UiContext';
import { Accordion, Breadcrumbs, ColorSwatches, PriceDisplay, QuantityStepper, Rating, SectionHeading, SizeSelector, Skeleton } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import ProductImage from '@/components/products/ProductImage';
import ProductCard from '@/components/products/ProductCard';
import WishlistButton from '@/components/products/WishlistButton';
import SizeGuideModal from '@/components/products/SizeGuideModal';
import { hash } from '@/utils/hash';
import { formatDate, cn } from '@/utils/format';
import NotFound from './NotFound';

const NAMES = ['Arjun K.', 'Karthik R.', 'Vignesh S.', 'Rahul M.', 'Siddharth P.', 'Naveen T.', 'Aravind S.', 'Dinesh B.'];
const LINES = ['Fits true to size and the fabric feels great after a few washes.', 'Good quality for the price. The colour looks exactly like the pictures.', 'Comfortable all day. I already ordered a second colour.', 'Clean finishing and a sharp fit. Delivery was quick too.', 'Nice stitching and a premium feel. Slightly snug, so go one size up if unsure.', 'Looks even better in person. Gets compliments every time I wear it.'];
const TITLES = ['Worth every rupee', 'Great everyday pick', 'Really comfortable', 'Sharp fit', 'Premium feel', 'Happy with this'];
function reviewsFor(p: Product) {
  return Array.from({ length: 6 }).map((_, i) => {
    const h = hash(`${p.id}-rev-${i}`);
    return { name: NAMES[h % NAMES.length], rating: Math.max(3, Math.min(5, Math.round(p.rating + ((h >> 3) % 3) - 1))), title: TITLES[(h >> 2) % TITLES.length], text: LINES[(h >> 4) % LINES.length], date: new Date(Date.UTC(2026, 9, 19) - ((h % 160) + 3) * 86400000).toISOString(), verified: h % 4 !== 0 };
  });
}

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { data: product, loading } = useAsync(() => productService.getBySlug(slug), [slug]);
  if (loading) return <PdpSkeleton />;
  if (!product) return <NotFound />;
  return <Pdp key={product.id} product={product} />;
}

function PdpSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-label="Loading product">
      <div className="grid gap-8 lg:grid-cols-2"><Skeleton className="aspect-[4/5]" /><div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-10 w-1/2" /><Skeleton className="h-24" /><Skeleton className="h-12" /></div></div>
    </div>
  );
}

function Pdp({ product: p }: { product: Product }) {
  const def = CATEGORY_MAP[p.category];
  const nav = useNavigate();
  const cart = useCart();
  const toast = useToast();
  const { setCartOpen } = useUi();
  const firstAvail = p.colors.find((c) => p.sizes.some((s) => (p.inventory[`${c.name}|${s}`] ?? 0) > 0)) ?? p.colors[0];
  const [color, setColor] = useState(firstAvail.name);
  const [size, setSize] = useState(p.sizes.length === 1 && (p.inventory[`${firstAvail.name}|${p.sizes[0]}`] ?? 0) > 0 ? p.sizes[0] : '');
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<ImageView>('front');
  const [sizeErr, setSizeErr] = useState(false);
  const [guide, setGuide] = useState(false);
  const [pin, setPin] = useState('');
  const [pinRes, setPinRes] = useState<PincodeResult | null>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const reviewsRef = useRef<HTMLElement>(null);

  usePageMeta(p.title, `${p.title} in ${p.colors.map((c) => c.name).slice(0, 3).join(', ')}. ${p.description}`.slice(0, 160));
  useEffect(() => {
    const s = document.createElement('script'); s.type = 'application/ld+json';
    s.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.title, description: p.description, sku: p.id, brand: { '@type': 'Brand', name: p.brand }, offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } });
    document.head.appendChild(s); return () => { s.remove(); };
  }, [p]);

  const related = useAsync(() => productService.related(p, 5), [p.id]);
  const look = useAsync(() => productService.completeTheLook(p, 4), [p.id]);
  const reviews = useMemo(() => reviewsFor(p), [p]);

  const stockFor = (c: string, s: string) => p.inventory[`${c}|${s}`] ?? 0;
  const selStock = size ? stockFor(color, size) : null;
  const colorTotal = (c: string) => p.sizes.reduce((n, s) => n + stockFor(c, s), 0);
  const maxQty = selStock ? Math.min(10, selStock) : 10;
  const colorSoldOut = colorTotal(color) === 0;

  const pickColor = (c: string) => { setColor(c); if (size && stockFor(c, size) <= 0) { setSize(''); toast.info(`${size} isn’t available in ${c}. Choose another size.`); } setQty(1); };
  const validate = () => {
    if (!size) { setSizeErr(true); toast.error('Select a size before adding to cart.'); document.getElementById('size-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; }
    return true;
  };
  const addToCart = () => { if (!validate()) return; const r = cart.add(p.id, color, size, qty); if (r.ok) { toast.success(r.message); setCartOpen(true); } else toast.error(r.message); };
  const buyNow = () => { if (!validate()) return; const r = cart.add(p.id, color, size, qty); if (!r.ok) { toast.error(r.message); return; } nav(`/checkout?buy=${encodeURIComponent(lineKey(p.id, color, size))}`); };
  const onMove = (e: MouseEvent<HTMLDivElement>) => { const b = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 }); };

  const dist = [5, 4, 3, 2, 1].map((star) => { const w = Math.max(0.02, Math.exp(-Math.pow(star - p.rating, 2) / 1.1)); return { star, w }; });
  const total = dist.reduce((n, d) => n + d.w, 0);

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: def.label, to: `/category/${p.category}` }, { label: p.subcategoryLabel, to: `/category/${p.category}?sub=${p.subcategory}` }, { label: p.title }]} />

      <div className="grid gap-8 pb-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-2.5 sm:flex-col" role="group" aria-label="Product images">
            {p.images.map((img) => (
              <button key={img.view} onClick={() => setView(img.view)} aria-label={`Show ${img.view} view`} aria-pressed={view === img.view} className={cn('aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-[76px]', view === img.view ? 'border-cocoa' : 'border-transparent hover:border-beige')}>
                <ProductImage product={p} color={color} view={img.view} />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-xl2 bg-beige" onMouseMove={onMove} onMouseLeave={() => setZoom(null)}>
            <div className="aspect-[4/5] transition-transform duration-200" style={zoom ? { transform: 'scale(1.7)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
              <ProductImage product={p} color={color} view={view} />
            </div>
            <WishlistButton productId={p.id} title={p.title} className="absolute right-3 top-3" />
            {(p.bestSeller || p.stock === 0) && <span className={cn('absolute left-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-bold', p.stock === 0 ? 'bg-ink text-ivory' : 'bg-ivory text-brown')}>{p.stock === 0 ? 'Sold out' : 'Best seller'}</span>}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[13px] font-semibold text-brown">{p.brand}</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">{p.title}</h1>
          <button onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="mt-3 flex items-center gap-2 text-left"><Rating value={p.rating} size="md" /><span className="text-sm text-ink/60 underline underline-offset-4">{p.reviewCount.toLocaleString('en-IN')} reviews</span></button>
          <div className="mt-4"><PriceDisplay price={p.price} compareAt={p.compareAtPrice} discount={p.discount} size="lg" /><p className="mt-1 text-xs text-ink/55">Inclusive of all taxes</p></div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Colour: <span className="font-normal text-ink/70">{color}</span></p>
            <ColorSwatches colors={p.colors} selected={color} onSelect={pickColor} size="lg" />
          </div>

          <div id="size-block" className="mt-6">
            <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Size{size && <span className="font-normal text-ink/70">: {size}</span>}</p>{def.slug !== 'accessories' || p.sizes.length > 1 ? <button onClick={() => setGuide(true)} className="text-[13px] font-semibold text-brown underline underline-offset-4">Size guide</button> : null}</div>
            <SizeSelector sizes={p.sizes} selected={size} onSelect={(s) => { setSize(s); setSizeErr(false); setQty(1); }} isDisabled={(s) => stockFor(color, s) <= 0} error={sizeErr} />
            {sizeErr && <p role="alert" className="mt-2 text-sm font-medium text-red-700">Please select a size.</p>}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, maxQty)} />
            <p className={cn('flex items-center gap-1.5 text-sm font-semibold', p.stock === 0 || colorSoldOut ? 'text-red-700' : selStock !== null && selStock <= 5 ? 'text-coral' : 'text-success')} aria-live="polite">
              <Check className="h-4 w-4" aria-hidden />
              {p.stock === 0 ? 'Out of stock' : colorSoldOut ? `${color} is out of stock` : selStock === null ? 'In stock' : selStock <= 5 ? `Only ${selStock} left in ${size}` : 'In stock'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button size="md" onClick={addToCart} disabled={p.stock === 0 || colorSoldOut}><ShoppingBag className="h-4 w-4" />Add to cart</Button>
            <Button variant="outline" onClick={buyNow} disabled={p.stock === 0 || colorSoldOut}><Zap className="h-4 w-4" />Buy now</Button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setPinRes(checkPincode(pin)); }} className="mt-6 rounded-xl border border-[var(--border)] bg-cream p-4">
            <label htmlFor="pin" className="mb-2 flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-brown" aria-hidden />Check delivery</label>
            <div className="flex gap-2">
              <input id="pin" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinRes(null); }} placeholder="Enter 6-digit pincode" className="field !min-h-[44px]" aria-describedby="pin-res" />
              <Button type="submit" variant="outline" size="sm" className="!min-h-[44px]">Check</Button>
            </div>
            {pinRes && <p id="pin-res" role="status" className={cn('mt-2 text-sm font-medium', pinRes.serviceable ? 'text-success' : 'text-red-700')}>{pinRes.message}</p>}
          </form>

          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            {[[Truck, `Free shipping above ₹${FREE_SHIPPING_ABOVE}`], [RotateCcw, 'Easy 7-day returns'], [BadgeCheck, '100% original']].map(([Icon, t]) => { const I = Icon as typeof Truck; return <li key={t as string} className="flex items-center gap-2 text-ink/75"><I className="h-5 w-5 shrink-0 text-brown" aria-hidden />{t as string}</li>; })}
          </ul>

          <div className="mt-6">
            <Accordion title="Product description" defaultOpen><p>{p.description}</p></Accordion>
            <Accordion title="Fabric & care"><p className="mb-2 font-semibold text-ink">{p.fabric}</p><ul className="list-disc space-y-1 pl-5">{p.care.map((c) => <li key={c}>{c}</li>)}</ul></Accordion>
            <Accordion title="Specifications"><table className="w-full text-left"><tbody>{Object.entries(p.specs).map(([k, v]) => <tr key={k} className="border-b border-[var(--border)] last:border-0"><th scope="row" className="w-2/5 py-2 pr-3 font-semibold text-ink">{k}</th><td className="py-2">{v}</td></tr>)}</tbody></table></Accordion>
            <Accordion title="Shipping & returns"><p className="mb-2"><Package className="mr-1.5 inline h-4 w-4 text-brown" aria-hidden />Orders ship in 1–2 working days. Delivery takes 2–7 days depending on your pincode. Free shipping on orders above ₹{FREE_SHIPPING_ABOVE}; otherwise ₹79.</p><p>Not the right fit? Return or exchange unworn items with tags within 7 days of delivery. See our <Link to="/pages/returns" className="link-underline font-semibold">returns policy</Link>.</p></Accordion>
          </div>
          <p className="mt-4 text-xs text-ink/50">Demo store: ratings, reviews and stock levels are sample data.</p>
        </div>
      </div>

      {/* Reviews */}
      <section ref={reviewsRef} id="reviews" className="scroll-mt-28 border-t border-[var(--border)] py-12" aria-labelledby="rev-h">
        <SectionHeading title="Ratings & reviews" />
        <h2 id="rev-h" className="sr-only">Ratings and reviews</h2>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div>
            <p className="font-serif text-6xl font-semibold">{p.rating.toFixed(1)}</p><Rating value={p.rating} size="md" />
            <p className="mt-1 text-sm text-ink/60">{p.reviewCount.toLocaleString('en-IN')} sample ratings</p>
            <ul className="mt-4 space-y-2">{dist.map((d) => <li key={d.star} className="flex items-center gap-2 text-xs"><span className="w-6 font-semibold">{d.star}★</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-beige"><span className="block h-full rounded-full bg-gold" style={{ width: `${(d.w / total) * 100}%` }} /></span></li>)}</ul>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r, i) => (
              <li key={i} className="rounded-xl border border-[var(--border)] bg-ivory p-5">
                <Rating value={r.rating} /><h3 className="mt-2 font-sans text-[15px] font-bold">{r.title}</h3><p className="mt-1 text-sm leading-6 text-ink/75">{r.text}</p>
                <p className="mt-3 text-xs text-ink/55">{r.name} · {formatDate(r.date)}{r.verified && <span className="ml-2 font-semibold text-success">Verified buyer</span>}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {look.data && look.data.length > 0 && (
        <section className="border-t border-[var(--border)] py-12" aria-labelledby="look-h">
          <SectionHeading eyebrow="Style it with" title="Complete the Look" /><h2 id="look-h" className="sr-only">Complete the look</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{look.data.map((x) => <ProductCard key={x.id} product={x} />)}</div>
        </section>
      )}
      {related.data && related.data.length > 0 && (
        <section className="border-t border-[var(--border)] py-12" aria-labelledby="sim-h">
          <SectionHeading eyebrow="You may also like" title="Similar Products" /><h2 id="sim-h" className="sr-only">Similar products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{related.data.map((x) => <ProductCard key={x.id} product={x} />)}</div>
        </section>
      )}
      <SizeGuideModal open={guide} onClose={() => setGuide(false)} category={p.category} />
    </div>
  );
}
