import { Logo } from './Primitives';
import ProductArt from '@/components/art/ProductArt';
import { cn } from '@/utils/format';
import type { ArtKind } from '@/types';

const ORBIT: { art: ArtKind; color: string; pos: string; delay: string }[] = [
  { art: 'shirt', color: '#f6f2ea', pos: 'left-[4%] top-[8%]', delay: '0s' },
  { art: 'jacket', color: '#6b4226', pos: 'right-[4%] top-[6%]', delay: '.6s' },
  { art: 'jeans', color: '#4f78ad', pos: 'left-[-2%] top-[52%]', delay: '1.2s' },
  { art: 'sunglasses', color: '#1b1a17', pos: 'right-[-2%] top-[50%]', delay: '.3s' },
  { art: 'watch', color: '#6b4226', pos: 'left-[10%] bottom-[0%]', delay: '.9s' },
  { art: 'trousers', color: '#b8a47a', pos: 'right-[10%] bottom-[2%]', delay: '1.5s' },
];

interface Props {
  /** 0–100. Only pass a value when it reflects REAL completed work; otherwise omit and an indeterminate ring is shown. */
  progress?: number;
  message?: string;
  inline?: boolean;
}

export default function LoadingScreen({ progress, message = 'Getting your style ready', inline }: Props) {
  const r = 70, circ = 2 * Math.PI * r;
  const determinate = typeof progress === 'number';
  return (
    <div role="status" aria-live="polite" className={cn('relative flex flex-col items-center justify-center overflow-hidden bg-cream px-4', inline ? 'min-h-[70vh]' : 'fixed inset-0 z-[300]')}>
      <div className="relative h-[300px] w-[300px] sm:h-[380px] sm:w-[380px]">
        {ORBIT.map((o) => (
          <div key={o.art} className={cn('absolute h-[84px] w-[70px] animate-float overflow-hidden rounded-2xl border border-[var(--border)] bg-ivory shadow-soft sm:h-[104px] sm:w-[88px]', o.pos)} style={{ animationDelay: o.delay }} aria-hidden>
            <ProductArt art={o.art} color={o.color} label="" view="front" />
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full bg-ivory shadow-lift">
            <svg viewBox="0 0 160 160" className={cn('absolute inset-0 h-full w-full -rotate-90', !determinate && 'animate-[spin_1.4s_linear_infinite]')} aria-hidden>
              <circle cx="80" cy="80" r={r} fill="none" stroke="#E9DDCC" strokeWidth="5" />
              <circle cx="80" cy="80" r={r} fill="none" stroke="#6B4226" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={determinate ? circ * (1 - progress! / 100) : circ * 0.72} style={{ transition: 'stroke-dashoffset .4s ease' }} />
            </svg>
            <div className="text-center">
              <Logo className="pointer-events-none" />
              {determinate && <p className="mt-2 font-sans text-xs font-bold tabular-nums text-brown">{Math.round(progress!)}%</p>}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 font-serif text-xl text-cocoa">{message}</p>
      <p className="mt-1 text-sm text-ink/60">Premium menswear. For a better you.</p>
    </div>
  );
}
