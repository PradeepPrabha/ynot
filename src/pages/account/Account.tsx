import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, LogOut, MapPin, Package, Plus, Trash2, User } from 'lucide-react';
import type { Address } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { Breadcrumbs, Skeleton } from '@/components/ui/Primitives';
import { FormField, aria, fieldClass } from '@/components/ui/FormField';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductCard from '@/components/products/ProductCard';
import { addressService } from '@/services/addressService';
import { orderService } from '@/services/orderService';
import { checkPincode } from '@/services/pricing';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { statusLabel } from '@/utils/orderTimeline';
import { getProductById } from '@/data/catalog';
import { INDIAN_STATES } from '@/data/states';
import { cn, formatDate, formatINR } from '@/utils/format';

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist';
const TABS: { id: Tab; label: string; Icon: typeof User }[] = [{ id: 'profile', label: 'Profile', Icon: User }, { id: 'addresses', label: 'Addresses', Icon: MapPin }, { id: 'orders', label: 'Orders', Icon: Package }, { id: 'wishlist', label: 'Wishlist', Icon: Heart }];

const profileSchema = z.object({ fullName: z.string().trim().min(2, 'Enter your full name.'), phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.') });
const addrSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter a name.'), phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'), email: z.string().trim().email('Enter a valid email.'),
  line1: z.string().trim().min(5, 'Enter your house number and street.'), line2: z.string().trim().optional(), city: z.string().trim().min(2, 'Enter your city.'), state: z.string().min(1, 'Select a state.'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode.').refine((v) => checkPincode(v).serviceable, 'We do not deliver to this pincode yet.'), type: z.enum(['Home', 'Work', 'Other']),
});

export default function Account() {
  usePageMeta('My account', 'Manage your YNOT profile, addresses, orders and wishlist.');
  const { user, actorId, signOut, updateProfile } = useAuth();
  const wish = useWishlist();
  const toast = useToast();
  const confirm = useConfirm();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [addresses, setAddresses] = useState(() => (user ? addressService.list(user.id) : []));
  const [adding, setAdding] = useState(false);
  const orders = useAsync(() => orderService.list(actorId), [actorId]);
  const pf = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { fullName: user?.fullName, phone: user?.phone } });
  const af = useForm<z.infer<typeof addrSchema>>({ resolver: zodResolver(addrSchema), defaultValues: { type: 'Home', state: 'Tamil Nadu', fullName: user?.fullName, phone: user?.phone, email: user?.email } });
  if (!user) return null;

  const logout = async () => { if (await confirm({ title: 'Log out?', message: 'Your cart and wishlist stay saved on this device.', confirmLabel: 'Log out' })) { await signOut(); toast.info('You have been logged out.'); nav('/'); } };
  const saveProfile = pf.handleSubmit(async (v) => { try { await updateProfile(v); toast.success('Profile updated.'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not update profile.'); } });
  const saveAddress = af.handleSubmit((v) => { setAddresses(addressService.save(user.id, v as Address)); setAdding(false); af.reset({ type: 'Home', state: 'Tamil Nadu', fullName: user.fullName, phone: user.phone, email: user.email }); toast.success('Address saved.'); });
  const removeAddress = async (id: string) => { if (await confirm({ title: 'Delete this address?', message: 'This cannot be undone.', confirmLabel: 'Delete', destructive: true })) { setAddresses(addressService.remove(user.id, id)); toast.info('Address deleted.'); } };
  const card = 'rounded-xl2 border border-[var(--border)] bg-ivory p-5 sm:p-6';
  const wishProducts = wish.items.map((i) => getProductById(i.productId)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-serif text-4xl font-semibold">Hello, {user.fullName.split(' ')[0]}</h1><p className="mt-1 text-sm text-ink/65">{user.email}</p></div><Button variant="outline" onClick={logout}><LogOut className="h-4 w-4" />Log out</Button></div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Account sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map(({ id, label, Icon }) => <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold transition', tab === id ? 'bg-cocoa text-ivory' : 'bg-beige/40 text-cocoa hover:bg-beige')}><Icon className="h-4 w-4" aria-hidden />{label}{id === 'wishlist' && wish.count > 0 && <span className="ml-auto text-xs opacity-70">{wish.count}</span>}</button>)}
        </nav>

        <div>
          {tab === 'profile' && (
            <section className={card} aria-labelledby="prof-h"><h2 id="prof-h" className="mb-5 font-serif text-2xl font-semibold">Profile</h2>
              <form onSubmit={saveProfile} noValidate className="grid max-w-xl gap-4 sm:grid-cols-2">
                <FormField label="Full name" htmlFor="p-name" error={pf.formState.errors.fullName?.message} className="sm:col-span-2"><input id="p-name" className={fieldClass(pf.formState.errors.fullName?.message)} {...aria('p-name', pf.formState.errors.fullName?.message)} {...pf.register('fullName')} /></FormField>
                <FormField label="Email" htmlFor="p-email" hint="Email can’t be changed in demo mode."><input id="p-email" value={user.email} readOnly className="field bg-cream" /></FormField>
                <FormField label="Mobile number" htmlFor="p-phone" error={pf.formState.errors.phone?.message}><input id="p-phone" inputMode="numeric" maxLength={10} className={fieldClass(pf.formState.errors.phone?.message)} {...aria('p-phone', pf.formState.errors.phone?.message)} {...pf.register('phone')} /></FormField>
                <div className="sm:col-span-2"><Button type="submit" loading={pf.formState.isSubmitting}>Save changes</Button></div>
              </form>
              <p className="mt-6 text-xs text-ink/55">Member since {formatDate(user.createdAt)}</p>
            </section>
          )}

          {tab === 'addresses' && (
            <section className={card} aria-labelledby="addr-h">
              <div className="mb-5 flex items-center justify-between"><h2 id="addr-h" className="font-serif text-2xl font-semibold">Saved addresses</h2>{!adding && <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add address</Button>}</div>
              {adding && (
                <form onSubmit={saveAddress} noValidate className="mb-6 grid gap-4 rounded-xl bg-cream p-4 sm:grid-cols-2">
                  {([['fullName', 'Full name'], ['phone', 'Mobile number'], ['email', 'Email'], ['line1', 'Address'], ['line2', 'Area / landmark (optional)'], ['city', 'City'], ['pincode', 'Pincode']] as const).map(([k, label]) => (
                    <FormField key={k} label={label} htmlFor={`a-${k}`} error={af.formState.errors[k]?.message} className={k === 'line1' || k === 'line2' || k === 'email' ? 'sm:col-span-2' : ''}><input id={`a-${k}`} className={fieldClass(af.formState.errors[k]?.message)} {...aria(`a-${k}`, af.formState.errors[k]?.message)} {...af.register(k)} /></FormField>
                  ))}
                  <FormField label="State" htmlFor="a-state" error={af.formState.errors.state?.message}><select id="a-state" className={fieldClass(af.formState.errors.state?.message)} {...af.register('state')}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select></FormField>
                  <FormField label="Type" htmlFor="a-type"><select id="a-type" className="field" {...af.register('type')}><option>Home</option><option>Work</option><option>Other</option></select></FormField>
                  <div className="flex gap-3 sm:col-span-2"><Button type="submit">Save address</Button><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
                </form>
              )}
              {addresses.length === 0 && !adding ? <EmptyState kind="box" title="No saved addresses" message="Save an address here or tick “Save this address” at checkout." /> : (
                <ul className="grid gap-3 sm:grid-cols-2">{addresses.map((a) => <li key={a.id} className="rounded-xl border border-[var(--border)] p-4 text-sm"><div className="mb-1 flex items-center justify-between"><span className="rounded-md bg-beige px-2 py-0.5 text-xs font-bold">{a.type}</span><button onClick={() => removeAddress(a.id)} aria-label={`Delete ${a.type} address`} className="rounded p-1.5 text-ink/50 hover:bg-beige hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div><p className="font-semibold">{a.fullName}</p><p className="mt-0.5 leading-6 text-ink/70">{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p></li>)}</ul>
              )}
            </section>
          )}

          {tab === 'orders' && (
            <section className={card} aria-labelledby="ord-h"><div className="mb-5 flex items-center justify-between"><h2 id="ord-h" className="font-serif text-2xl font-semibold">Recent orders</h2><Link to="/account/orders" className="text-sm font-semibold text-brown underline underline-offset-4">View all</Link></div>
              {orders.loading ? <Skeleton className="h-28" /> : !orders.data?.length ? <EmptyState kind="box" title="No orders yet" message="Your orders will appear here once you place one." action={{ label: 'Start shopping', to: '/products' }} /> : (
                <ul className="space-y-3">{orders.data.slice(0, 3).map((o) => <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-4 text-sm"><div><p className="font-bold">{o.id}</p><p className="text-xs text-ink/60">{formatDate(o.createdAt)} · {statusLabel(o)}</p></div><p className="font-bold">{formatINR(o.totals.total)}</p><LinkButton to={`/account/orders/${o.id}`} variant="outline" size="sm">View order</LinkButton></li>)}</ul>
              )}
            </section>
          )}

          {tab === 'wishlist' && (
            <section className={card} aria-labelledby="wl-h"><div className="mb-5 flex items-center justify-between"><h2 id="wl-h" className="font-serif text-2xl font-semibold">Wishlist</h2><Link to="/wishlist" className="text-sm font-semibold text-brown underline underline-offset-4">Open wishlist</Link></div>
              {wishProducts.length === 0 ? <EmptyState kind="heart" title="Nothing saved yet" message="Tap the heart on any product to save it." action={{ label: 'Explore products', to: '/products' }} /> : <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{wishProducts.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}</div>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
