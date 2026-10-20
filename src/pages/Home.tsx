import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CreditCard, Package, Truck } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading, ProductGridSkeleton } from '@/components/ui/Primitives';
import { NewsletterBand } from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductArt from '@/components/art/ProductArt';
import { CATEGORIES } from '@/data/categories';
import { CATALOG } from '@/data/catalog';
import { productService } from '@/services/productService';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/utils/format';
import heroStyle from '@/assets/photos/hero-style.jpg';
import jackets from '@/assets/photos/banner-jackets.jpg';
import tshirts from '@/assets/photos/banner-tshirts.jpg';
import essentials from '@/assets/photos/essentials.jpg';

const SLIDES = [
  { id: 1, eyebrow: 'YNOT Menswear', l1: 'STYLE', l2: 'WITHOUT LIMITS', sub: 'Modern fits. Everyday confidence.', img: heroStyle, cta: { label: 'Shop Now', to: '/products' }, cta2: { label: 'Explore Collection', to: '/category/shirts' }, alt: 'Model in a cream open shirt and sunglasses sitting against a sunlit stone wall' },
  { id: 2, eyebrow: 'New season layers', l1: 'LAYER', l2: 'YOUR STYLE', sub: 'Bombers, utility jackets and blazers built for every day.', img: jackets, cta: { label: 'Shop Jackets', to: '/category/jackets' }, cta2: { label: 'See New In', to: '/products?new=1&sort=newest' }, alt: 'Model wearing a brown utility jacket over a white tee' },
  { id: 3, eyebrow: 'Everyday comfort', l1: 'SOFT', l2: 'BASICS', sub: 'Combed cotton tees that feel right from the first wear.', img: tshirts, cta: { label: 'Shop T-Shirts', to: '/category/t-shirts' }, cta2: { label: 'Explore Collection', to: '/products' }, alt: 'Model wearing a plain white t-shirt and sunglasses' },
];

const BENEFITS = [
  { Icon: Truck, t: 'Free Shipping', d: 'on orders above ₹999' }, { Icon: Package, t: 'Easy Returns', d: 'Hassle-free 7 days return' },
  { Icon: BadgeCheck, t: 'Premium Quality', d: 'Carefully curated for you' }, { Icon: CreditCard, t: 'Secure Payments', d: '100% safe & secure' },
];

const FABRICS = [
  { name: 'Linen Blend', copy: 'Airy and textured for warm days.', style: { background: 'repeating-linear-gradient(0deg,#d9c9a8 0 2px,#e6d9bd 2px 5px),repeating-linear-gradient(90deg,rgba(255,255,255,.25) 0 1px,transparent 1px 4px)' } },
  { name: 'Combed Cotton', copy: 'Soft, smooth and breathable.', style: { background: 'radial-gradient(circle at 20% 30%,#fff8ea 0 2px,transparent 3px) 0 0/10px 10px,#efe4cf' } },
  { name: 'Stretch Denim', copy: 'Holds its shape, moves with you.', style: { background: 'repeating-linear-gradient(135deg,#2e4a7d 0 2px,#3a5a91 2px 4px)' } },
  { name: 'Silk Blend', copy: 'A quiet sheen for festive days.', style: { background: 'linear-gradient(115deg,#5b1b2f 0%,#8a3a50 35%,#5b1b2f 55%,#7a2b43 100%)' } },
];

const maxDiscount = Math.floor(Math.max(...CATALOG.map((p) => p.discount)) / 5) * 5;

export default function Home() {
  usePageMeta('YNOT', 'Premium menswear for a better you. Shop shirts, t-shirts, jeans, trousers, jackets, ethnic wear and accessories with free shipping above ₹999.');
  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];
  const best = useAsync(() => productService.bestSellers(6), []);

  return (
    <div>
      {/* Hero */}
      <section aria-roledescription="carousel" aria-label="Featured collections" className="relative overflow-hidden bg-cream">
        <div className="container-page relative grid min-h-[460px] items-center lg:grid-cols-[1fr_1.15fr]">
          <div className="relative z-10 order-2 py-8 lg:order-1 lg:py-16" aria-live="polite">
            <p className="mb-4 text-[13px] font-bold tracking-[0.18em] text-gold">{s.eyebrow.toUpperCase()}</p>
            <h1 className="font-serif text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl"><span className="block text-ink">{s.l1}</span><span className="block text-brown">{s.l2}</span></h1>
            <p className="mt-5 text-lg text-ink/80">{s.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton to={s.cta.to}>{s.cta.label}<ArrowRight className="h-4 w-4" /></LinkButton>
              <LinkButton to={s.cta2.to} variant="outline">{s.cta2.label}</LinkButton>
            </div>
            <div className="mt-8 flex items-center gap-3" role="group" aria-label="Choose slide">
              {SLIDES.map((x, i) => <button key={x.id} onClick={() => setSlide(i)} aria-label={`Show slide ${i + 1}: ${x.l1} ${x.l2}`} aria-current={i === slide} className={cn('text-sm font-semibold tabular-nums transition', i === slide ? 'border-b-2 border-brown text-ink' : 'text-ink/40 hover:text-ink')}>{String(i + 1).padStart(2, '0')}</button>)}
            </div>
          </div>
          <div className="relative order-1 -mx-4 h-[280px] sm:-mx-6 lg:absolute lg:inset-y-0 lg:right-0 lg:order-2 lg:mx-0 lg:h-auto lg:w-[58%]">
            <img key={s.id} src={s.img} alt={s.alt} fetchPriority="high" className="h-full w-full animate-fade-in object-cover object-[60%_20%]"
              style={{ maskImage: 'linear-gradient(to right, transparent 0%, #000 28%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 28%)' }} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-label="Why shop with YNOT" className="border-y border-[var(--border)] bg-ivory">
        <ul className="container-page grid grid-cols-2 gap-5 py-6 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, t, d }) => <li key={t} className="flex items-center gap-3.5"><Icon className="h-8 w-8 shrink-0 text-cocoa" strokeWidth={1.3} aria-hidden /><div><p className="text-sm font-bold">{t}</p><p className="text-xs text-ink/65">{d}</p></div></li>)}
        </ul>
      </section>

      {/* Categories */}
      <section className="container-page pt-14" aria-labelledby="cat-h">
        <SectionHeading eyebrow="Shop by category" title="Find Your Style" action={<LinkButton to="/products" variant="outline" size="sm">View all</LinkButton>} />
        <h2 id="cat-h" className="sr-only">Categories</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/category/${c.slug}`} className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-ivory transition hover:shadow-lift">
                <div className="aspect-[4/5] overflow-hidden" style={{ background: c.tint }}><ProductArt art={c.art} color={c.subcategories[0].color} pattern={c.subcategories[0].pattern} label={`${c.label} collection`} variant={c.subcategories[0].slug} className="transition duration-500 group-hover:scale-105" /></div>
                <p className="py-3 text-center text-sm font-bold">{c.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Everyday essentials */}
      <section className="container-page pt-12" aria-labelledby="ess-h">
        <div className="relative grid overflow-hidden rounded-xl2 border border-[var(--border)] bg-gradient-to-r from-cream to-beige/70 md:grid-cols-[1fr_1.2fr]">
          <div className="relative z-10 p-7 sm:p-10 lg:p-12">
            <p className="text-[13px] font-bold tracking-[0.16em] text-gold">NEW COLLECTION</p>
            <h2 id="ess-h" className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">EVERYDAY<br />ESSENTIALS</h2>
            <p className="mt-3 text-lg text-ink/80">Clean looks for a confident you.</p>
            <LinkButton to="/products?new=1&sort=newest" className="mt-6">Shop Now<ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
          <div className="relative min-h-[220px]">
            <img src={essentials} alt="Folded olive, white and navy YNOT shirts stacked together" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ maskImage: 'linear-gradient(to right, transparent 0%, #000 25%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 25%)' }} />
          </div>
          <ul className="absolute right-6 top-1/2 hidden -translate-y-1/2 space-y-1 rounded-lg bg-ivory/85 px-5 py-4 text-right font-serif text-sm font-semibold tracking-wide backdrop-blur xl:block"><li>Premium fabrics</li><li>Modern fits</li><li>Timeless style</li></ul>
        </div>
      </section>

      {/* Best sellers */}
      <section className="container-page pt-14" aria-labelledby="best-h">
        <SectionHeading eyebrow="Best sellers" title="Most Loved Styles" action={<LinkButton to="/products?sort=popularity" variant="outline" size="sm">View all</LinkButton>} />
        <h2 id="best-h" className="sr-only">Best sellers</h2>
        {best.loading ? <ProductGridSkeleton count={6} /> : best.data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">{best.data.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>

      {/* Promo banners */}
      <section className="container-page grid gap-4 pt-14 md:grid-cols-2" aria-label="Promotions">
        <div className="relative flex min-h-[220px] items-center overflow-hidden rounded-xl2 bg-gradient-to-r from-[#d8c4a3] to-beige">
          <div className="relative z-10 p-7 sm:p-9">
            <p className="text-[13px] font-bold tracking-[0.14em] text-brown">UP TO {maxDiscount}% OFF</p>
            <h2 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">SEASON SALE</h2>
            <p className="mt-1 text-ink/80">Upgrade your wardrobe today.</p>
            <LinkButton to="/products?sale=1&sort=discount" className="mt-5">Shop Now<ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
          <div className="absolute -bottom-4 right-2 flex h-[88%] items-end gap-2" aria-hidden>
            <div className="h-full w-32 -rotate-3 overflow-hidden rounded-2xl shadow-lift sm:w-40"><ProductArt art="jacket" color="#7a4a28" variant="utility" label="" /></div>
            <div className="hidden h-[85%] w-28 rotate-3 overflow-hidden rounded-2xl shadow-lift sm:block"><ProductArt art="shirt" color="#f6f2ea" label="" /></div>
          </div>
        </div>
        <div className="relative flex min-h-[220px] items-center overflow-hidden rounded-xl2 bg-gradient-to-r from-beige to-[#cdb593]">
          <div className="relative z-10 p-7 sm:p-9">
            <p className="text-[13px] font-bold tracking-[0.14em] text-brown">ACCESSORIES</p>
            <h2 className="mt-1 font-serif text-2xl font-bold leading-tight sm:text-3xl">THE DETAILS<br />MAKE THE<br />DIFFERENCE</h2>
            <LinkButton to="/category/accessories" className="mt-5">Explore<ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
          <div className="absolute -bottom-3 right-3 flex h-[80%] items-end gap-2" aria-hidden>
            {([['belt', '#6b4226'], ['sunglasses', '#1b1a17'], ['wallet', '#422817']] as const).map(([a, c], i) => <div key={a} className={cn('h-full w-20 overflow-hidden rounded-2xl shadow-lift sm:w-24', i === 0 && 'hidden xl:block', i === 1 && 'hidden sm:block')}><ProductArt art={a} color={c} label="" /></div>)}
          </div>
        </div>
      </section>

      {/* Premium fabrics */}
      <section className="container-page pt-14" aria-labelledby="fab-h">
        <SectionHeading eyebrow="Premium fabrics" title="Made to Feel as Good as It Looks" />
        <h2 id="fab-h" className="sr-only">Premium fabrics</h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FABRICS.map((f) => (
            <li key={f.name}><Link to={`/products?fabric=${encodeURIComponent(f.name)}`} className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-ivory transition hover:shadow-lift">
              <div className="h-28 transition duration-500 group-hover:scale-105 sm:h-36" style={f.style} aria-hidden />
              <div className="p-4"><p className="font-serif text-lg font-semibold">{f.name}</p><p className="mt-0.5 text-[13px] text-ink/65">{f.copy}</p></div>
            </Link></li>
          ))}
        </ul>
      </section>

      <NewsletterBand />
    </div>
  );
}
