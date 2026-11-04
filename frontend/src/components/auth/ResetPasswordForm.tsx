'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useRouter } from '@/navigation';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const t = useTranslations('password_reset');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  // Lien incomplet (copié à moitié, ou page ouverte sans passer par l'e-mail)
  if (!token || !email) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 text-center space-y-4">
        <p className="text-stone-700">{t('invalid_link')}</p>
        <Link href="/mot-de-passe-oublie" className="inline-block text-sm text-brand-600 font-semibold hover:underline">{t('request_new')}</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmation) {
      toast.error(t('mismatch'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset-password', { token, email, password, password_confirmation: confirmation });
      toast.success(t('done'));
      router.push('/login');
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-6">
      <p className="text-sm text-stone-600">{t('for_account')} <strong dir="ltr">{email}</strong></p>
      <div className="space-y-2">
        <Label htmlFor="password">{t('new_password')}</Label>
        <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        <p className="text-xs text-stone-500">{t('min_length')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_confirmation">{t('confirm_password')}</Label>
        <Input id="password_confirmation" type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} disabled={loading} />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl">
        {loading ? <Loader2 size={16} className="animate-spin" /> : t('save')}
      </Button>
    </form>
  );
}
