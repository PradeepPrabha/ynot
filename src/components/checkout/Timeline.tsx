import { Check } from 'lucide-react';
import type { Order } from '@/types';
import { buildTimeline } from '@/utils/orderTimeline';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/format';

export default function Timeline({ order }: { order: Order }) {
  const steps = buildTimeline(order);
  return (
    <ol className="relative space-y-5" aria-label="Order tracking">
      {steps.map((s, i) => (
        <li key={s.key} className="relative flex gap-4">
          {i < steps.length - 1 && <span className={cn('absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5', s.done && steps[i + 1].done ? 'bg-success' : 'bg-[var(--border)]')} aria-hidden />}
          <span className={cn('z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2', s.done ? 'border-success bg-success text-ivory' : 'border-[var(--border)] bg-ivory')}>{s.done && <Check className="h-4 w-4" />}</span>
          <div><p className={cn('text-sm font-semibold', !s.done && 'text-ink/55')}>{s.label}</p><p className="text-xs text-ink/60">{s.done ? formatDate(s.date, { day: 'numeric', month: 'short' }) : `Expected ${formatDate(s.date, { day: 'numeric', month: 'short' })}`} · {s.detail}</p></div>
        </li>
      ))}
    </ol>
  );
}
