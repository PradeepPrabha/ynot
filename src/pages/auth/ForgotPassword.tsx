import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthShell from '@/components/auth/AuthShell';
import { FormField, aria, fieldClass } from '@/components/ui/FormField';
import { Button, LinkButton } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { usePageMeta } from '@/hooks/usePageMeta';

const schema = z.object({ email: z.string().trim().email('Enter a valid email address.') });
type Values = z.infer<typeof schema>;

export default function ForgotPassword() {
  usePageMeta('Reset password', 'Request a password reset link for your YNOT account.');
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const onSubmit = async (v: Values) => { setErr(''); try { await authService.requestPasswordReset(v.email); setSent(v.email); } catch { setErr('We could not send the reset link. Please try again.'); } };
  return (
    <AuthShell title={sent ? 'Check your inbox' : 'Forgot your password?'} subtitle={sent ? 'Follow the link in the email to choose a new password.' : 'Enter your email and we will send you a link to reset it.'} side={{ heading: 'We’ve got you.', text: 'Reset your password in a minute and get back to shopping.' }}>
      {sent ? (
        <div className="text-center" role="status">
          <MailCheck className="mx-auto h-14 w-14 text-success" aria-hidden />
          <p className="mt-4 text-sm leading-6 text-ink/75">If an account exists for <strong>{sent}</strong>, a reset link is on its way. It can take a few minutes to arrive.</p>
          <p className="mt-3 rounded-lg bg-cream p-3 text-xs leading-5 text-ink/60">Demo mode: no email is sent. With Supabase Auth connected, this calls <code>resetPasswordForEmail</code>.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><LinkButton to="/login" block>Back to log in</LinkButton><Button variant="outline" block onClick={() => setSent(null)}>Use a different email</Button></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {err && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">{err}</p>}
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required><input id="email" type="email" autoComplete="email" className={fieldClass(errors.email?.message)} {...aria('email', errors.email?.message)} {...register('email')} /></FormField>
          <Button type="submit" block loading={isSubmitting}>Send reset link</Button>
          <p className="text-center text-sm text-ink/70">Remembered it? <Link to="/login" className="font-semibold text-brown underline underline-offset-4">Log in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
