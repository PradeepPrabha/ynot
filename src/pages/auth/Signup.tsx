import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthShell, { SocialLogin } from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';
import { FormField, aria, fieldClass } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { usePageMeta } from '@/hooks/usePageMeta';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  password: z.string().min(8, 'Use at least 8 characters.').regex(/[A-Za-z]/, 'Include at least one letter.').regex(/\d/, 'Include at least one number.'),
  confirm: z.string(),
  terms: z.boolean().refine((v) => v, 'Please accept the terms to continue.'),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match.' });
type Values = z.infer<typeof schema>;

export default function Signup() {
  usePageMeta('Create account', 'Create your YNOT account for faster checkout, order tracking and a saved wishlist.');
  const { user, signUp } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const from = (loc.state as { from?: string } | null)?.from;
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { terms: false } });
  if (user) return <Navigate to={from ?? '/account'} replace />;

  const onSubmit = async (v: Values) => {
    setFormError('');
    try { await signUp({ fullName: v.fullName, email: v.email, phone: v.phone, password: v.password }); toast.success('Your account is ready. Welcome to YNOT.'); nav(from ?? '/account', { replace: true }); }
    catch (e) { setFormError(e instanceof Error ? e.message : 'Could not create your account.'); }
  };
  const f = (id: keyof Values) => ({ ...aria(id, errors[id]?.message), ...register(id as never) });
  return (
    <AuthShell title="Create your account" subtitle="Faster checkout, order tracking and a wishlist that follows you." side={{ heading: 'Join the style movement.', text: 'Create an account and get 10% off your first order with WELCOME10.' }}>
      {formError && <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">{formError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message} required><input id="fullName" autoComplete="name" className={fieldClass(errors.fullName?.message)} {...f('fullName')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required><input id="email" type="email" autoComplete="email" className={fieldClass(errors.email?.message)} {...f('email')} /></FormField>
          <FormField label="Mobile number" htmlFor="phone" error={errors.phone?.message} required><input id="phone" inputMode="numeric" maxLength={10} autoComplete="tel-national" className={fieldClass(errors.phone?.message)} {...f('phone')} /></FormField>
        </div>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters with a letter and a number." required><PasswordInput id="password" autoComplete="new-password" error={errors.password?.message} {...f('password')} /></FormField>
        <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm?.message} required><PasswordInput id="confirm" autoComplete="new-password" error={errors.confirm?.message} {...f('confirm')} /></FormField>
        <div>
          <label className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#6B4226]" {...aria('terms', errors.terms?.message)} {...register('terms')} /><span>I agree to the <Link to="/pages/terms" className="font-semibold text-brown underline">Terms &amp; Conditions</Link> and <Link to="/pages/privacy" className="font-semibold text-brown underline">Privacy Policy</Link>.</span></label>
          {errors.terms && <p id="terms-error" role="alert" className="mt-1 text-xs font-medium text-red-700">{errors.terms.message}</p>}
        </div>
        <Button type="submit" block loading={isSubmitting}>Create account</Button>
      </form>
      <SocialLogin onSelect={() => toast.info('Connect Supabase OAuth providers to enable this sign-up method.')} />
      <p className="mt-6 text-center text-sm text-ink/70">Already have an account? <Link to="/login" state={loc.state} className="font-semibold text-brown underline underline-offset-4">Log in</Link></p>
      <p className="mt-4 rounded-lg bg-cream p-3 text-xs leading-5 text-ink/60">Demo mode: your profile is saved on this device only. Your password is never stored.</p>
    </AuthShell>
  );
}
