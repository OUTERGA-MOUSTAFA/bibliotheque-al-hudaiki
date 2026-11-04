'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/navigation';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordForm() {
  const t = useTranslations('password_reset');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // locale : le lien reçu par e-mail ouvre la page dans la même langue
      await api.post('/forgot-password', { email, locale });
      setSent(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 text-center space-y-4">
        <MailCheck className="mx-auto text-brand-600" size={40} />
        <p className="text-stone-700">{t('sent', { email })}</p>
        <p className="text-sm text-stone-500">{t('sent_hint')}</p>
        <Link href="/login" className="inline-block text-sm text-brand-600 font-semibold hover:underline">{t('back_to_login')}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl">
        {loading ? <Loader2 size={16} className="animate-spin" /> : t('send_link')}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-brand-600 font-semibold hover:underline">{t('back_to_login')}</Link>
      </p>
    </form>
  );
}
