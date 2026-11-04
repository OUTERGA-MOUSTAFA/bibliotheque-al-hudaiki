'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api';

type ApiError = { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }; request?: unknown };

export default function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login, completeTwoFactor } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // Étape 2FA
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  const redirectAfterLogin = (roles: string[] = []) => {
    toast.success(t('login_success'));
    router.push(roles.includes('admin') ? '/admin' : '/compte');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.two_factor && data.challenge) {
        // Mot de passe correct, mais il faut encore le code de l'application
        setChallenge(data.challenge);
        return;
      }
      redirectAfterLogin(data.roles);
    } catch (error) {
      const err = error as ApiError;
      if (err.response?.status === 422 || err.response?.status === 401) {
        const apiErrors = err.response.data?.errors || {};
        setErrors({
          email: apiErrors.email?.[0],
          password: apiErrors.password?.[0],
          general: err.response.data?.message || t('invalid_credentials'),
        });
      } else if (err.request) {
        setErrors({ general: t('server_unreachable') });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;
    setErrors({});
    setLoading(true);

    try {
      const data = await completeTwoFactor(challenge, useRecovery ? { recovery_code: code.trim() } : { code: code.replace(/\s/g, '') });
      redirectAfterLogin(data.roles);
    } catch (error) {
      setErrors({ general: apiErrorMessage(error, t('invalid_code')) });
    } finally {
      setLoading(false);
    }
  };

  const errorBox = errors.general && (
    <div className="flex items-start gap-2 p-3 bg-coral-50 border border-coral-200 rounded-xl text-sm text-coral-700">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <span>{errors.general}</span>
    </div>
  );

  if (challenge) {
    return (
      <form onSubmit={handleTwoFactor} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="text-brand-600" />
          </div>
          <h2 className="font-bold text-stone-900">{t('two_factor_title')}</h2>
          <p className="text-sm text-stone-600 mt-1">
            {useRecovery ? t('two_factor_recovery_hint') : t('two_factor_hint')}
          </p>
        </div>

        {errorBox}

        <div className="space-y-2">
          <Label htmlFor="code">{useRecovery ? t('recovery_code') : t('auth_code')}</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode={useRecovery ? 'text' : 'numeric'}
            autoComplete="one-time-code"
            autoFocus
            required
            dir="ltr"
            className="text-center tracking-[0.3em] font-mono"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl">
          {loading ? <Loader2 size={16} className="animate-spin" /> : t('verify')}
        </Button>

        <div className="flex justify-between text-sm">
          <button type="button" onClick={() => { setUseRecovery(!useRecovery); setCode(''); setErrors({}); }} className="text-brand-600 font-semibold hover:underline">
            {useRecovery ? t('use_auth_code') : t('use_recovery_code')}
          </button>
          <button type="button" onClick={() => { setChallenge(null); setCode(''); setErrors({}); }} className="text-stone-500 hover:underline">
            {t('back')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-5">
      {errorBox}

      <div className="space-y-2">
        <Label htmlFor="email" className={errors.email ? 'text-coral-600' : ''}>{t('email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'border-coral-500 focus-visible:ring-coral-500' : ''}
          required
          disabled={loading}
        />
        {errors.email && <p className="text-xs text-coral-600 font-medium">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="password" className={errors.password ? 'text-coral-600' : ''}>{t('password')}</Label>
          <Link href="/mot-de-passe-oublie" className="text-xs text-brand-600 font-semibold hover:underline">
            {t('forgot_password')}
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? 'border-coral-500 focus-visible:ring-coral-500' : ''}
          required
          disabled={loading}
        />
        {errors.password && <p className="text-xs text-coral-600 font-medium">{errors.password}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl">
        {loading ? <Loader2 size={16} className="animate-spin" /> : t('sign_in')}
      </Button>

      <p className="text-center text-sm text-stone-600">
        {t('no_account')}{' '}
        <Link href="/register" className="text-brand-600 font-semibold hover:underline">{t('sign_up')}</Link>
      </p>
    </form>
  );
}
