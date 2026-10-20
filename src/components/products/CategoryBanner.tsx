import { Crown, Shirt, Sparkles } from 'lucide-react';
import type { CategoryDef } from '@/types';
import ProductArt from '@/components/art/ProductArt';

const BENEFITS = [
  { Icon: Shirt, title: 'Premium Fabrics', text: 'Breathable & comfortable' },
  { Icon: Sparkles, title: 'Modern Fits', text: 'For every occasion' },
  { Icon: Crown, title: 'Styles for Every You', text: 'Casual · Formal · Party' },
];

export default function CategoryBanner({ category }: { category: CategoryDef }) {
  const art = category.subcategories.slice(0, 3);
  return (
    <section aria-labelledby="cat-title" className="relative overflow-hidden border-b border-[var(--border)]" style={{ background: `linear-gradient(100deg, #F8F3EA 0%, ${category.tint} 100%)` }}>
      <div className="container-page relative grid min-h-[190px] items-center gap-4 lg:grid-cols-[1.1fr_1.3fr_.8fr]">
        <div className="relative z-10 py-8">
          <h1 id="cat-title" className="font-serif text-5xl font-semibold sm:text-6xl">{category.headline}</h1>
          <p className="mt-3 max-w-sm text-lg leading-snug text-ink/80">{category.tagline}</p>
          <span className="mt-4 block h-0.5 w-12 bg-brown" aria-hidden />
        </div>
        <div className="relative hidden h-full min-h-[190px] lg:block" aria-hidden>
          {category.photo ? (
            <img src={category.photo} alt="" className="absolute inset-0 h-full w-full object-cover object-top" style={{ maskImage: 'linear-gradient(to right, transparent 0%, #000 22%, #000 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 22%, #000 100%)' }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center gap-4 py-5">
              {art.map((s, i) => <div key={s.slug} className="h-full max-h-[150px] w-[120px] overflow-hidden rounded-2xl border border-[var(--border)] shadow-soft" style={{ transform: `translateY(${i === 1 ? 8 : -4}px)` }}><ProductArt art={s.art} color={s.color} pattern={s.pattern} label="" /></div>)}
            </div>
          )}
        </div>
        <ul className="relative z-10 hidden space-y-4 py-6 lg:block">
          {BENEFITS.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3"><Icon className="h-7 w-7 shrink-0 text-cocoa" strokeWidth={1.4} aria-hidden /><div><p className="text-sm font-bold">{title}</p><p className="text-xs text-ink/65">{text}</p></div></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
