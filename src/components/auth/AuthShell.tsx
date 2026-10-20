import type { ReactNode } from 'react';
import { BadgeCheck, Package, Truck } from 'lucide-react';
import heroStyle from '@/assets/photos/hero-style.jpg';

export default function AuthShell({ title, subtitle, children, side }: { title: string; subtitle: string; children: ReactNode; side: { heading: string; text: string } }) {
  return (
    <div className="container-page py-8 lg:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-xl2 border border-[var(--border)] bg-ivory shadow-soft lg:grid-cols-2">
        <div className="relative hidden min-h-[560px] lg:block">
          <img src={heroStyle} alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-9 text-ivory">
            <p className="font-serif text-4xl font-semibold leading-tight text-ivory">{side.heading}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ivory/85">{side.text}</p>
            <ul className="mt-6 space-y-2 text-sm">{[[Truck, 'Free shipping above ₹999'], [Package, 'Easy 7-day returns'], [BadgeCheck, '100% original quality']].map(([I, t]) => { const Icon = I as typeof Truck; return <li key={t as string} className="flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden />{t as string}</li>; })}</ul>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <h1 className="font-serif text-3xl font-semibold">{title}</h1>
          <p className="mt-1.5 text-sm text-ink/65">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

const providers = ((import.meta.env.VITE_SOCIAL_LOGIN_PROVIDERS as string | undefined) ?? '').split(',').map((s) => s.trim()).filter(Boolean);
/** Renders social buttons ONLY when VITE_SOCIAL_LOGIN_PROVIDERS is set (e.g. "google,facebook"). Wire `onSelect` to Supabase OAuth. */
export function SocialLogin({ onSelect }: { onSelect: (provider: string) => void }) {
  if (!providers.length) return null;
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3 text-xs text-ink/50"><span className="h-px flex-1 bg-[var(--border)]" />or continue with<span className="h-px flex-1 bg-[var(--border)]" /></div>
      <div className="grid gap-2 sm:grid-cols-2">{providers.map((p) => <button key={p} type="button" onClick={() => onSelect(p)} className="btn btn-outline capitalize">{p}</button>)}</div>
    </div>
  );
}
