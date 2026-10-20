import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CATEGORIES } from '@/data/categories';
import { SITE } from '@/data/site';
import { Button, LinkButton } from '@/components/ui/Button';
import ProductArt from '@/components/art/ProductArt';

function ZeroButton() {
  return (
    <svg viewBox="0 0 200 200" className="h-28 w-28 animate-float sm:h-44 sm:w-44" aria-hidden>
      <circle cx="100" cy="100" r="92" fill="#6B4226" /><circle cx="100" cy="100" r="76" fill="none" stroke="#C39A61" strokeWidth="4" strokeDasharray="6 8" />
      <circle cx="100" cy="100" r="58" fill="#8a5a38" />
      {[[84, 84], [116, 84], [84, 116], [116, 116]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#F8F3EA" />)}
      <path d="M84 84L116 116M116 84L84 116" stroke="#C39A61" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function NotFound() {
  usePageMeta('Page not found', 'The page you are looking for could not be found.');
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); };
  return (
    <div className="bg-cream">
      <div className="container-page py-14 text-center sm:py-20">
        <div className="flex items-center justify-center gap-2 sm:gap-4" role="img" aria-label="404">
          <span className="font-serif text-[96px] font-bold leading-none text-cocoa sm:text-[190px]">4</span><ZeroButton /><span className="font-serif text-[96px] font-bold leading-none text-cocoa sm:text-[190px]">4</span>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Oops! This page lost a button</h1>
        <p className="mx-auto mt-3 max-w-md text-ink/70">The page you’re looking for has moved or doesn’t exist. Search for something else or pick up where you left off.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton to="/"><Home className="h-4 w-4" />Go to homepage</LinkButton>
          <Button variant="outline" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))}><ArrowLeft className="h-4 w-4" />Go back</Button>
        </div>
        <form onSubmit={submit} role="search" className="mx-auto mt-8 flex max-w-md gap-2">
          <label htmlFor="nf-search" className="sr-only">Search products</label>
          <input id="nf-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shirts, jeans, jackets…" className="field" />
          <Button type="submit" aria-label="Search"><Search className="h-4 w-4" /></Button>
        </form>
        <h2 className="mb-5 mt-14 font-serif text-2xl font-semibold">Popular categories</h2>
        <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <li key={c.slug}><Link to={`/category/${c.slug}`} className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-ivory transition hover:shadow-lift">
              <div className="aspect-square overflow-hidden"><ProductArt art={c.art} color={c.subcategories[0].color} pattern={c.subcategories[0].pattern} label="" className="transition duration-500 group-hover:scale-105" /></div>
              <p className="py-2.5 text-[13px] font-semibold">{c.label}</p>
            </Link></li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-ink/65">Need help? <Link to="/pages/contact" className="link-underline font-semibold">Contact support</Link> · <a href={`mailto:${SITE.supportEmail}`} className="link-underline font-semibold">{SITE.supportEmail}</a> · <Link to="/pages/faqs" className="link-underline font-semibold">FAQs</Link></p>
      </div>
    </div>
  );
}
