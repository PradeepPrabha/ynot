import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Banknote, Building2, CreditCard, Lock, Smartphone, Wallet } from 'lucide-react';
import type { Address, PaymentMethod } from '@/types';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs } from '@/components/ui/Primitives';
import { FormField, aria, fieldClass } from '@/components/ui/FormField';
import { CouponBox, TotalsTable } from '@/components/cart/OrderSummary';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import DemoGatewayModal, { METHOD_LABEL } from '@/components/checkout/DemoGatewayModal';
import ProductImage from '@/components/products/ProductImage';
import { checkPincode, computeTotals } from '@/services/pricing';
import { orderService, OrderError, type PaymentSession } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { addressService } from '@/services/addressService';
import { COD_LIMIT } from '@/services/mock/mockBackend';
import { uid } from '@/services/ids';
import { INDIAN_STATES } from '@/data/states';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn, formatINR } from '@/utils/format';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter the recipient’s full name.'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  email: z.string().trim().email('Enter a valid email address.'),
  line1: z.string().trim().min(5, 'Enter your house number and street.'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'Enter your city.'),
  state: z.string().min(1, 'Select your state.'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode.').refine((v) => checkPincode(v).serviceable, 'We do not deliver to this pincode yet.'),
  type: z.enum(['Home', 'Work', 'Other']),
  save: z.boolean(),
});
type Values = z.infer<typeof schema>;

const METHODS: { id: PaymentMethod; Icon: typeof Wallet; desc: string }[] = [
  { id: 'upi', Icon: Smartphone, desc: 'Pay with any UPI app' },
  { id: 'card', Icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', Icon: Building2, desc: 'All major Indian banks' },
  { id: 'wallet', Icon: Wallet, desc: 'Popular mobile wallets' },
  { id: 'cod', Icon: Banknote, desc: 'Pay when your order arrives' },
];

export default function Checkout() {
  usePageMeta('Checkout', 'Complete your YNOT order with secure shipping and payment.');
  const cart = useCart();
  const { user, actorId } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const buy = sp.get('buy');

  const lines = useMemo(() => (buy ? cart.lines.filter((l) => l.key === buy) : cart.selectedLines), [buy, cart.lines, cart.selectedLines]);
  const { totals, coupon } = useMemo(() => computeTotals(lines.map((l) => ({ productId: l.product.id, qty: l.qty })), cart.couponCode), [lines, cart.couponCode]);
  const saved = useMemo(() => (user ? addressService.list(user.id) : []), [user]);

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address | null>(null);
  const [save, setSave] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [gateway, setGateway] = useState<{ orderId: string; session: PaymentSession } | null>(null);
  const [failedOrder, setFailedOrder] = useState<string | null>(null);
  const submitting = useRef(false);
  const idem = useRef(uid());

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.fullName ?? '', phone: user?.phone ?? '', email: user?.email ?? '', type: 'Home', save: false, state: 'Tamil Nadu' },
  });
  useEffect(() => { if (step > 0) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const codBlocked = totals.total > COD_LIMIT;
  useEffect(() => { if (codBlocked && method === 'cod') setMethod('upi'); }, [codBlocked, method]);

  if (lines.length === 0) {
    return <div className="container-page py-8"><EmptyState level={1} kind="bag" title="Nothing to check out" message={cart.lines.length ? 'Select at least one item in your cart to continue.' : 'Your cart is empty. Add something you love first.'} action={{ label: cart.lines.length ? 'Back to cart' : 'Start shopping', to: cart.lines.length ? '/cart' : '/products' }} /></div>;
  }

  const onShipping = (v: Values) => { const { save: s, ...a } = v; setAddress(a as Address); setSave(s); setStep(1); };

  const finish = async (orderId: string) => {
    const r = await paymentService.confirm(orderId, actorId);
    if (!r.verified) { setError(r.reason ?? 'We could not verify your payment.'); return; }
    if (save && user && address) addressService.save(user.id, address);
    const keys = lines.map((l) => l.key);
    nav(`/order-success/${orderId}`, { replace: true });
    cart.removeKeys(keys);
  };

  const placeOrder = async () => {
    if (submitting.current || !address) return;
    const ok = await confirm({ title: 'Place your order?', message: `You are placing an order of ${formatINR(totals.total)} for ${totals.itemCount} item${totals.itemCount > 1 ? 's' : ''}, paying by ${METHOD_LABEL[method].toLowerCase()}.`, confirmLabel: method === 'cod' ? 'Place order' : 'Continue to payment' });
    if (!ok) return;
    submitting.current = true; setBusy(true); setError(''); setFailedOrder(null);
    try {
      const { order, session } = await orderService.place({ lines: lines.map((l) => ({ productId: l.product.id, color: l.color.name, size: l.size, qty: l.qty })), address, paymentMethod: method, couponCode: totals.couponCode, idempotencyKey: idem.current }, actorId);
      if (!session) await finish(order.id); else setGateway({ orderId: order.id, session });
    } catch (e) {
      const msg = e instanceof OrderError ? e.message : 'We could not place your order. Please try again.';
      setError(msg); toast.error(msg);
    } finally { submitting.current = false; setBusy(false); }
  };

  const settle = async (outcome: 'success' | 'failure') => {
    if (!gateway) return;
    const { orderId, session } = gateway;
    await paymentService.settleSandbox(session, outcome);
    setGateway(null);
    if (outcome === 'success') await finish(orderId);
    else { idem.current = uid(); setFailedOrder(orderId); setError('Your payment did not go through. You have not been charged and your cart is unchanged.'); }
  };
  const retry = async () => {
    if (!failedOrder) return;
    try { const r = await orderService.retryPayment(failedOrder, actorId); setError(''); setGateway({ orderId: r.order.id, session: r.session }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not restart the payment.'); }
  };

  const fieldProps = (id: keyof Values) => ({ ...aria(id, errors[id]?.message), ...register(id as never) });
  const card = 'rounded-xl2 border border-[var(--border)] bg-ivory p-5 sm:p-6';

  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mb-6 text-center font-serif text-4xl font-semibold">Checkout</h1>
      <CheckoutSteps current={step} />

      {error && (
        <div role="alert" className="mx-auto mb-6 flex max-w-3xl items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><div className="flex-1"><p className="font-semibold">{error}</p>{failedOrder && <Button size="sm" className="mt-3" onClick={retry}>Try payment again</Button>}</div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          {/* Shipping */}
          <form hidden={step !== 0} onSubmit={handleSubmit(onShipping)} noValidate className={card} aria-labelledby="ship-h">
            <h2 id="ship-h" className="font-serif text-2xl font-semibold">Shipping information</h2>
            <p className="mb-5 mt-1 text-sm text-ink/65">Where should we send your order?</p>
            {saved.length > 0 && (
              <div className="mb-5"><p className="label">Saved addresses</p><div className="grid gap-2 sm:grid-cols-2">{saved.map((a) => <button key={a.id} type="button" onClick={() => reset({ ...a, save: false })} className="rounded-lg border border-[var(--border)] p-3 text-left text-[13px] hover:border-brown"><span className="font-semibold">{a.type} · {a.fullName}</span><br />{a.line1}, {a.city} {a.pincode}</button>)}</div></div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message} required><input id="fullName" autoComplete="name" className={fieldClass(errors.fullName?.message)} {...fieldProps('fullName')} /></FormField>
              <FormField label="Mobile number" htmlFor="phone" error={errors.phone?.message} required><input id="phone" inputMode="numeric" maxLength={10} autoComplete="tel-national" className={fieldClass(errors.phone?.message)} {...fieldProps('phone')} /></FormField>
              <FormField label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-2" required><input id="email" type="email" autoComplete="email" className={fieldClass(errors.email?.message)} {...fieldProps('email')} /></FormField>
              <FormField label="Address" htmlFor="line1" error={errors.line1?.message} className="sm:col-span-2" required><input id="line1" autoComplete="address-line1" placeholder="House no., building, street" className={fieldClass(errors.line1?.message)} {...fieldProps('line1')} /></FormField>
              <FormField label="Area / landmark (optional)" htmlFor="line2" className="sm:col-span-2"><input id="line2" autoComplete="address-line2" className={fieldClass()} {...register('line2')} /></FormField>
              <FormField label="City" htmlFor="city" error={errors.city?.message} required><input id="city" autoComplete="address-level2" className={fieldClass(errors.city?.message)} {...fieldProps('city')} /></FormField>
              <FormField label="State" htmlFor="state" error={errors.state?.message} required><select id="state" autoComplete="address-level1" className={fieldClass(errors.state?.message)} {...fieldProps('state')}><option value="">Select state</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select></FormField>
              <FormField label="Pincode" htmlFor="pincode" error={errors.pincode?.message} required><input id="pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" className={fieldClass(errors.pincode?.message)} {...fieldProps('pincode')} /></FormField>
            </div>
            <fieldset className="mt-5"><legend className="label">Address type</legend><div className="flex gap-2">{(['Home', 'Work', 'Other'] as const).map((t) => <label key={t} className="cursor-pointer"><input type="radio" value={t} className="peer sr-only" {...register('type')} /><span className="chip peer-checked:border-cocoa peer-checked:bg-cocoa peer-checked:text-ivory peer-focus-visible:ring-2 peer-focus-visible:ring-brown">{t}</span></label>)}</div></fieldset>
            {user ? <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#6B4226]" {...register('save')} />Save this address for next time</label> : <p className="mt-5 text-[13px] text-ink/60"><Link to="/login" state={{ from: '/checkout' }} className="font-semibold text-brown underline">Log in</Link> to save addresses, or continue as a guest.</p>}
            <Button type="submit" className="mt-6" block>Continue to payment</Button>
          </form>

          {step > 0 && address && (
            <section className={cn(card, step !== 1 && 'py-4')} aria-label="Shipping summary"><div className="flex items-start justify-between gap-3"><div className="text-sm"><p className="font-semibold">Ship to {address.fullName} <span className="font-normal text-ink/55">({address.type})</span></p><p className="mt-0.5 text-ink/70">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.pincode} · {address.phone}</p></div><button onClick={() => setStep(0)} className="shrink-0 text-[13px] font-semibold text-brown underline">Edit</button></div></section>
          )}

          {/* Payment */}
          {step === 1 && (
            <section className={card} aria-labelledby="pay-h">
              <h2 id="pay-h" className="font-serif text-2xl font-semibold">Payment method</h2>
              <fieldset className="mt-4 space-y-2.5"><legend className="sr-only">Choose a payment method</legend>
                {METHODS.map(({ id, Icon, desc }) => {
                  const off = id === 'cod' && codBlocked;
                  return (
                    <label key={id} className={cn('flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition', method === id ? 'border-cocoa bg-beige/40' : 'border-[var(--border)] hover:border-brown', off && 'cursor-not-allowed opacity-50')}>
                      <input type="radio" name="method" checked={method === id} disabled={off} onChange={() => setMethod(id)} className="h-4 w-4 accent-[#6B4226]" />
                      <Icon className="h-6 w-6 text-brown" aria-hidden /><span className="flex-1"><span className="block text-sm font-semibold">{METHOD_LABEL[id]}</span><span className="block text-xs text-ink/60">{off ? `Available on orders up to ${formatINR(COD_LIMIT)}` : desc}</span></span>
                    </label>
                  );
                })}
              </fieldset>
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-cream p-3 text-[13px] leading-5 text-ink/70"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-brown" aria-hidden />{method === 'cod' ? 'Pay in cash or by UPI when your order is delivered.' : 'You will complete payment on a secure payment page. YNOT never sees or stores your card, UPI or bank details.'}</p>
              <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(0)}>Back</Button><Button block onClick={() => setStep(2)}>Review order</Button></div>
            </section>
          )}

          {/* Review */}
          {step === 2 && (
            <section className={card} aria-labelledby="rev-h">
              <h2 id="rev-h" className="font-serif text-2xl font-semibold">Review your order</h2>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-cream p-3 text-sm"><span>Payment: <strong>{METHOD_LABEL[method]}</strong></span><button onClick={() => setStep(1)} className="text-[13px] font-semibold text-brown underline">Change</button></div>
              <ul className="mt-4 divide-y divide-[var(--border)]">{lines.map((l) => <li key={l.key} className="flex gap-3 py-3"><span className="aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg"><ProductImage product={l.product} color={l.color.name} /></span><div className="min-w-0 flex-1 text-sm"><p className="line-clamp-1 font-semibold">{l.product.title}</p><p className="text-xs text-ink/60">{l.color.name} · {l.size} · Qty {l.qty}</p></div><p className="text-sm font-bold">{formatINR(l.product.price * l.qty)}</p></li>)}</ul>
              <p className="mt-3 text-xs text-ink/55">Final prices and stock are re-checked by our server when you place the order.</p>
              <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button block loading={busy} onClick={placeOrder}><Lock className="h-4 w-4" />{method === 'cod' ? `Place order · ${formatINR(totals.total)}` : `Pay ${formatINR(totals.total)}`}</Button></div>
            </section>
          )}
        </div>

        <aside aria-label="Order summary" className="h-fit rounded-xl2 border border-[var(--border)] bg-ivory p-5 shadow-soft lg:sticky lg:top-28">
          <h2 className="mb-4 font-serif text-2xl font-semibold">Order Summary</h2>
          <ul className="mb-5 max-h-52 space-y-3 overflow-y-auto pr-1">{lines.map((l) => <li key={l.key} className="flex items-center gap-3 text-sm"><span className="aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md"><ProductImage product={l.product} color={l.color.name} /></span><span className="min-w-0 flex-1"><span className="line-clamp-1 font-semibold">{l.product.title}</span><span className="text-xs text-ink/60">{l.color.name} · {l.size} · Qty {l.qty}</span></span><span className="font-semibold">{formatINR(l.product.price * l.qty)}</span></li>)}</ul>
          <TotalsTable totals={totals} />
          <div className="mt-5 border-t border-[var(--border)] pt-5"><CouponBox subtotal={totals.subtotal} status={coupon} /></div>
          <LinkButton to="/cart" variant="ghost" size="sm" block className="mt-3">Edit cart</LinkButton>
        </aside>
      </div>

      <DemoGatewayModal session={gateway?.session ?? null} onSettle={settle} onCancel={() => { setGateway(null); setError('Payment was not completed, so no order has been placed. You can try again whenever you are ready.'); }} />
    </div>
  );
}
