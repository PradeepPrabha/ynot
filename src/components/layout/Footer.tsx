import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Facebook, Heart, Instagram, Twitter, Youtube } from 'lucide-react';
import { Logo } from '@/components/ui/Primitives';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { newsletterService } from '@/services/newsletterService';
import { FOOTER, SITE } from '@/data/site';

const ICONS = [Instagram, Facebook, Youtube, Twitter];

export function NewsletterForm({ id = 'nl', dark }: { id?: string; dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Enter a valid email address.'); return; }
    setErr(''); setBusy(true);
    try {
      const r = await newsletterService.subscribe(email);
      setDone(true); setEmail('');
      toast.success(r === 'already' ? 'You are already subscribed. Thank you!' : 'You are subscribed. Check your inbox for your welcome offer.');
    } catch { toast.error('Could not subscribe right now. Please try again.'); } finally { setBusy(false); }
  };
  if (done) return <p role="status" className="rounded-lg bg-success/10 px-4 py-3 text-sm font-semibold text-success">Thanks for subscribing. Use WELCOME10 on your first order.</p>;
  return (
    <form onSubmit={submit} noValidate>
      <div className="flex gap-2">
        <label htmlFor={id} className="sr-only">Email address</label>
        <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" autoComplete="email" aria-invalid={!!err} aria-describedby={err ? `${id}-err` : undefined} className={`field ${dark ? '' : ''}`} />
        <Button type="submit" loading={busy} aria-label="Subscribe to newsletter" className="!px-4"><ArrowRight className="h-5 w-5" /></Button>
      </div>
      {err && <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-medium text-red-700">{err}</p>}
    </form>
  );
}

export function NewsletterBand() {
  return (
    <section aria-labelledby="nl-title" className="container-page my-14">
      <div className="grid items-center gap-6 rounded-xl2 bg-beige/60 p-7 md:grid-cols-2 md:p-10">
        <div><h2 id="nl-title" className="font-serif text-3xl font-semibold">Join the YNOT list</h2><p className="mt-2 max-w-md text-sm leading-6 text-ink/75">New arrivals, styling notes and early access to sales. Subscribe and get 10% off your first order with code WELCOME10.</p></div>
        <NewsletterForm id="nl-band" />
      </div>
    </section>
  );
}

export default function Footer() {
  const { pathname } = useLocation();
  const col = (title: string, links: { label: string; to: string }[]) => (
    <nav aria-label={title}><h2 className="mb-3 font-sans text-sm font-bold">{title}</h2><ul className="space-y-2.5 text-sm text-ink/70">{links.map((l) => <li key={l.label}><Link to={l.to} className="hover:text-brown hover:underline">{l.label}</Link></li>)}</ul></nav>
  );
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-cream">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr_1.3fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink/70">Menswear for a Better You. Style today. A bolder tomorrow.</p>
          <div className="mt-5 flex gap-3">
            {SITE.social.map((s, i) => { const Icon = ICONS[i]; return <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`YNOT on ${s.label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-ivory text-ink transition hover:border-cocoa hover:bg-cocoa hover:text-ivory"><Icon className="h-[18px] w-[18px]" /></a>; })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{col('Shop', FOOTER.shop)}{col('Help', FOOTER.help)}{col('About', FOOTER.about)}</div>
        {pathname !== '/' && (
          <div><h2 className="mb-1 font-sans text-sm font-bold">Subscribe to our newsletter</h2><p className="mb-3 text-sm text-ink/70">Exclusive offers, new arrivals and style inspiration.</p><NewsletterForm id="nl-footer" /></div>
        )}
      </div>
      <div className="border-t border-[var(--border)] bg-beige/50">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-ink/70 sm:flex-row">
          <p>© 2026 YNOT. All rights reserved.</p>
          <p className="flex gap-4"><Link to="/pages/terms" className="hover:underline">Terms &amp; Conditions</Link><Link to="/pages/privacy" className="hover:underline">Privacy Policy</Link><Link to="/pages/shipping" className="hover:underline">Shipping</Link></p>
          <p className="flex items-center gap-1.5">Made with care in India <Heart className="h-3.5 w-3.5 fill-coral text-coral" aria-hidden /></p>
        </div>
      </div>
    </footer>
  );
}
