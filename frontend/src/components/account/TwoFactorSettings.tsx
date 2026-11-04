'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ShieldOff, KeyRound, Copy } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'loading' | 'off' | 'password' | 'scan' | 'on';

export default function TwoFactorSettings() {
  const t = useTranslations('twofa');
  const [step, setStep] = useState<Step>('loading');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [qr, setQr] = useState<{ svg: string; secret: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  // Action en attente du mot de passe : activer, désactiver ou régénérer les codes
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | 'codes'>('enable');

  useEffect(() => {
    api.get('/two-factor')
      .then(({ data }) => setStep(data.enabled ? 'on' : 'off'))
      .catch(() => setStep('off'));
  }, []);

  const askPassword = (action: 'enable' | 'disable' | 'codes') => {
    setPendingAction(action);
    setPassword('');
    setStep('password');
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (pendingAction === 'enable') {
        const { data } = await api.post('/two-factor/enable', { password });
        setQr({ svg: data.qr_code_svg, secret: data.secret });
        setCode('');
        setStep('scan');
      } else if (pendingAction === 'disable') {
        await api.post('/two-factor/disable', { password });
        setRecoveryCodes([]);
        toast.success(t('disabled'));
        setStep('off');
      } else {
        const { data } = await api.post('/two-factor/recovery-codes', { password });
        setRecoveryCodes(data.recovery_codes);
        setStep('on');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setBusy(false);
      setPassword('');
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/two-factor/confirm', { code: code.replace(/\s/g, '') });
      setRecoveryCodes(data.recovery_codes);
      setQr(null);
      toast.success(t('enabled'));
      setStep('on');
    } catch (err) {
      toast.error(apiErrorMessage(err, t('invalid_code')));
    } finally {
      setBusy(false);
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      toast.success(t('copied'));
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${step === 'on' ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-500'}`}>
          {step === 'on' ? <ShieldCheck size={22} /> : <ShieldOff size={22} />}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-stone-900">{t('title')}</h2>
          <p className="text-sm text-stone-600">{t('description')}</p>
        </div>
        {step === 'on' && <span className="text-xs font-bold px-2 py-1 rounded-full bg-brand-50 text-brand-700 shrink-0">{t('status_on')}</span>}
      </div>

      {step === 'loading' && <Loader2 className="animate-spin text-brand-600" />}

      {step === 'off' && (
        <Button onClick={() => askPassword('enable')} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
          {t('enable')}
        </Button>
      )}

      {step === 'password' && (
        <form onSubmit={submitPassword} className="space-y-3 max-w-sm">
          <Label htmlFor="2fa-password">{t('confirm_password')}</Label>
          <Input id="2fa-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
              {busy ? <Loader2 size={16} className="animate-spin" /> : t('continue')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(pendingAction === 'enable' ? 'off' : 'on')}>{t('cancel')}</Button>
          </div>
        </form>
      )}

      {step === 'scan' && qr && (
        <form onSubmit={confirm} className="space-y-4">
          <ol className="text-sm text-stone-700 list-decimal ps-5 space-y-1">
            <li>{t('step_install')}</li>
            <li>{t('step_scan')}</li>
            <li>{t('step_code')}</li>
          </ol>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* SVG généré par notre propre backend (Fortify / BaconQrCode) */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 shrink-0" dangerouslySetInnerHTML={{ __html: qr.svg }} />
            <div className="space-y-3 flex-1 w-full">
              <div>
                <p className="text-xs text-stone-500 mb-1">{t('manual_key')}</p>
                <code className="block text-sm font-mono bg-sand rounded-lg px-3 py-2 break-all" dir="ltr">{qr.secret}</code>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="2fa-code">{t('code_label')}</Label>
                <Input id="2fa-code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" required dir="ltr" className="font-mono tracking-[0.3em] text-center max-w-[12rem]" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={busy} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : t('activate')}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setQr(null); setStep('off'); }}>{t('cancel')}</Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {step === 'on' && (
        <div className="space-y-4">
          {recoveryCodes.length > 0 && (
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-stone-900 mb-1">{t('recovery_title')}</p>
              <p className="text-xs text-stone-600 mb-3">{t('recovery_hint')}</p>
              <ul className="grid grid-cols-2 gap-1 font-mono text-sm mb-3" dir="ltr">
                {recoveryCodes.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <Button type="button" size="sm" variant="outline" onClick={copyCodes}><Copy size={14} /> {t('copy')}</Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => askPassword('codes')}><KeyRound size={16} /> {t('new_codes')}</Button>
            <Button variant="outline" onClick={() => askPassword('disable')} className="text-coral-600 hover:bg-coral-50">{t('disable')}</Button>
          </div>
        </div>
      )}
    </section>
  );
}
