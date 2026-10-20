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
  identifier: z.string().trim().min(1, 'Enter your email or mobile number.').refine((v) => /^\S+@\S+\.\S+$/.test(v) || /^[6-9]\d{9}$/.test(v), 'Enter a valid email or 10-digit mobile number.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  usePageMeta('Log in', 'Log in to your YNOT account to track orders and manage your wishlist.');
  const { user, signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const state = loc.state as { from?: string; reason?: string } | null;
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { remember: true } });
  if (user) return <Navigate to={state?.from ?? '/account'} replace />;

  const onSubmit = async (v: Values) => {
    setFormError('');
    try { await signIn(v.identifier, v.password, v.remember); toast.success('Welcome back to YNOT.'); nav(state?.from ?? '/account', { replace: true }); }
    catch (e) { setFormError(e instanceof Error ? e.message : 'Could not log in. Try again.'); }
  };
  return (
    <AuthShell title="Welcome back" subtitle="Log in to track orders and keep your wishlist across visits." side={{ heading: 'More than menswear.', text: 'Your orders, saved addresses and wishlist, all in one place.' }}>
      {state?.reason && <p role="status" className="mb-4 rounded-lg bg-beige/60 px-3.5 py-2.5 text-sm text-cocoa">{state.reason}</p>}
      {formError && <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">{formError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Email or mobile number" htmlFor="identifier" error={errors.identifier?.message} required>
          <input id="identifier" autoComplete="username" className={fieldClass(errors.identifier?.message)} {...aria('identifier', errors.identifier?.message)} {...register('identifier')} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="current-password" error={errors.password?.message} {...aria('password', errors.password?.message)} {...register('password')} />
        </FormField>
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[#6B4226]" {...register('remember')} />Remember me</label>
          <Link to="/forgot-password" className="font-semibold text-brown hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" block loading={isSubmitting}>Log in</Button>
      </form>
      <SocialLogin onSelect={() => toast.info('Connect Supabase OAuth providers to enable this sign-in method.')} />
      <p className="mt-6 text-center text-sm text-ink/70">New to YNOT? <Link to="/signup" state={state} className="font-semibold text-brown underline underline-offset-4">Create an account</Link></p>
      <p className="mt-4 rounded-lg bg-cream p-3 text-xs leading-5 text-ink/60">Demo mode: accounts are stored on this device only and passwords are never saved or checked. Real authentication arrives when Supabase Auth is connected.</p>
    </AuthShell>
  );
}
