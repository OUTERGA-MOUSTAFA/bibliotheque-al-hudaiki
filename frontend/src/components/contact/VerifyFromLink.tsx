'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Link } from '@/navigation';
import { api, apiErrorMessage } from '@/lib/api';

// Ouverte depuis le bouton « Confirmer mon adresse » de l'e-mail : valide le message automatiquement
export default function VerifyFromLink({ token, code }: { token: string; code: string }) {
  const t = useTranslations('contact');
  const lienValide = !!token && /^\d{6}$/.test(code);
  const [etat, setEtat] = useState<'attente' | 'ok' | 'erreur'>(lienValide ? 'attente' : 'erreur');
  const [message, setMessage] = useState(lienValide ? '' : t('link_invalid'));
  const dejaEnvoye = useRef(false);

  useEffect(() => {
    // Un seul appel, même si React monte le composant deux fois en développement
    if (!lienValide || dejaEnvoye.current) return;
    dejaEnvoye.current = true;
    api.post('/contact/verify', { token, code })
      .then(() => setEtat('ok'))
      .catch((err) => {
        setMessage(apiErrorMessage(err, t('code_error')));
        setEtat('erreur');
      });
  }, [lienValide, token, code, t]);

  return (
    <div className="bg-white p-10 rounded-3xl shadow-soft border border-stone-200 text-center space-y-4 max-w-lg mx-auto" role="status" aria-live="polite">
      {etat === 'attente' && (
        <>
          <Loader2 className="mx-auto animate-spin text-brand-600" size={48} />
          <p className="text-stone-600">{t('verifying')}</p>
        </>
      )}
      {etat === 'ok' && (
        <>
          <CheckCircle2 className="mx-auto text-brand-600" size={56} />
          <h1 className="text-2xl font-bold text-stone-900">{t('sent_title')}</h1>
          <p className="text-stone-600">{t('success')}</p>
          <Link href="/" className="inline-flex items-center h-11 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition">
            {t('back_home')}
          </Link>
        </>
      )}
      {etat === 'erreur' && (
        <>
          <XCircle className="mx-auto text-coral-500" size={56} />
          <h1 className="text-xl font-bold text-stone-900">{t('verify_failed')}</h1>
          <p className="text-stone-600">{message}</p>
          <Link href="/contact" className="inline-flex items-center h-11 px-6 rounded-xl border border-stone-300 hover:border-brand-400 font-semibold transition">
            {t('back_to_form')}
          </Link>
        </>
      )}
    </div>
  );
}
