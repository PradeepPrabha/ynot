import { Check } from 'lucide-react';
import { cn } from '@/utils/format';

const STEPS = ['Shipping', 'Payment', 'Review', 'Order Placed'];
export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-2xl items-center" aria-label="Checkout progress">
      {STEPS.map((s, i) => {
        const done = i < current, on = i === current;
        return (
          <li key={s} className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')} aria-current={on ? 'step' : undefined}>
            <span className="flex flex-col items-center gap-1.5">
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold', done ? 'border-brown bg-brown text-ivory' : on ? 'border-cocoa bg-cocoa text-ivory' : 'border-[var(--border)] bg-ivory text-ink/45')}>{done ? <Check className="h-4 w-4" /> : i + 1}</span>
              <span className={cn('text-[12px] font-semibold', on || done ? 'text-ink' : 'text-ink/45')}>{s}</span>
            </span>
            {i < STEPS.length - 1 && <span className={cn('mx-2 mb-5 h-0.5 flex-1', done ? 'bg-brown' : 'bg-[var(--border)]')} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
