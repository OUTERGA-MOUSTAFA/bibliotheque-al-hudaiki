'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/compte');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-5"
    >
      {error && (
        <div className="flex items-start gap-2 p-3 bg-coral-50 border border-coral-200 rounded-xl text-sm text-coral-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="vous@exemple.com"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">{t('password')}</Label>
          <a href="#" className="text-xs text-brand-600 hover:underline">
            {t('forgot_password')}
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            ...
          </>
        ) : (
          t('sign_in')
        )}
      </Button>

      <p className="text-center text-sm text-stone-600">
        {t('no_account')}{' '}
        <Link href="/register" className="text-brand-600 font-semibold hover:underline">
          {t('sign_up')}
        </Link>
      </p>

      {/* Comptes test */}
      <div className="pt-4 border-t border-stone-200 text-xs text-stone-500 space-y-1">
        <p className="font-semibold">🧪 Comptes test:</p>
        <p>👑 admin@alhudaiki.ma / password</p>
        <p>👤 lecteur@test.ma / password</p>
      </div>
    </form>
  );
}