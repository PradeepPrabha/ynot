import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { PaymentMethod } from '@/types';
import type { PaymentSession } from '@/services/orderService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/utils/format';

export const METHOD_LABEL: Record<PaymentMethod, string> = { upi: 'UPI', card: 'Credit / Debit card', netbanking: 'Net banking', wallet: 'Wallet', cod: 'Cash on delivery' };

interface Props { session: PaymentSession | null; onSettle: (outcome: 'success' | 'failure') => Promise<void>; onCancel: () => void }

/**
 * SANDBOX ONLY. Stands in for the payment provider's hosted checkout. It never collects card/UPI details.
 * The result is sent to the mock server, which alone decides whether an order counts as paid.
 * Replace with the provider's SDK (Razorpay, Stripe, Cashfree…) when going live.
 */
export default function DemoGatewayModal({ session, onSettle, onCancel }: Props) {
  const [busy, setBusy] = useState<'success' | 'failure' | null>(null);
  const run = async (o: 'success' | 'failure') => { setBusy(o); try { await onSettle(o); } finally { setBusy(null); } };
  return (
    <Modal open={!!session} onClose={() => (busy ? undefined : onCancel())} title="Demo payment sandbox" size="sm">
      {session && (
        <div>
          <p className="flex items-start gap-2.5 rounded-lg bg-gold/15 p-3 text-[13px] leading-5 text-cocoa"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />This is a test screen. No real money moves and no card or UPI details are collected. Choose the outcome you want to test.</p>
          <dl className="my-5 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-ink/65">Order</dt><dd className="font-semibold">{session.orderId}</dd></div><div className="flex justify-between"><dt className="text-ink/65">Method</dt><dd className="font-semibold">{METHOD_LABEL[session.method]}</dd></div><div className="flex justify-between border-t border-[var(--border)] pt-2"><dt className="text-ink/65">Amount</dt><dd className="text-lg font-bold">{formatINR(session.amount)}</dd></div></dl>
          <div className="grid gap-3">
            <Button onClick={() => run('success')} loading={busy === 'success'} disabled={!!busy} className="!bg-success hover:!bg-[#1d6e3a]">Simulate successful payment</Button>
            <Button variant="outline" onClick={() => run('failure')} loading={busy === 'failure'} disabled={!!busy}>Simulate failed payment</Button>
            <Button variant="ghost" onClick={onCancel} disabled={!!busy}>Cancel and go back</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
