'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Send, MailCheck, CheckCircle2, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Etape = 'formulaire' | 'code' | 'envoye';
const FORM_VIDE = { nom: '', email: '', sujet: '', message: '' };
const DELAI_RENVOI = 60;

/**
 * Formulaire de contact en 3 étapes :
 *  1. le visiteur écrit son message
 *  2. il saisit le code à 6 chiffres reçu par e-mail (prouve que l'adresse existe et lui appartient)
 *  3. confirmation : le message est transmis à la bibliothèque
 */
export default function ContactForm() {
  const t = useTranslations('contact');
  const [etape, setEtape] = useState<Etape>('formulaire');
  const [formData, setFormData] = useState(FORM_VIDE);
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreurCode, setErreurCode] = useState('');
  const [attente, setAttente] = useState(0); // secondes avant de pouvoir redemander un code
  const codeRef = useRef<HTMLInputElement>(null);

  // Compte à rebours du bouton « renvoyer le code »
  useEffect(() => {
    if (attente <= 0) return;
    const id = window.setTimeout(() => setAttente((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [attente]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string }>('/contact', formData);
      setToken(data.token);
      setCode('');
      setErreurCode('');
      setAttente(DELAI_RENVOI);
      setEtape('code');
      window.setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  };

  const verifier = async (valeur: string) => {
    if (valeur.length !== 6) return;
    setLoading(true);
    setErreurCode('');
    try {
      await api.post('/contact/verify', { token, code: valeur });
      setEtape('envoye');
      setFormData(FORM_VIDE);
    } catch (err) {
      setErreurCode(apiErrorMessage(err, t('code_error')));
      setCode('');
      codeRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const renvoyer = async () => {
    setLoading(true);
    try {
      await api.post('/contact/resend', { token });
      toast.success(t('code_resent'));
      setErreurCode('');
      setCode('');
      setAttente(DELAI_RENVOI);
      codeRef.current?.focus();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  };

  const carte = 'bg-white p-8 rounded-3xl shadow-soft border border-stone-200';

  // ── Étape 3 : envoyé ──
  if (etape === 'envoye') {
    return (
      <div className={`${carte} text-center space-y-4`} role="status">
        <CheckCircle2 className="mx-auto text-brand-600" size={56} />
        <h2 className="text-2xl font-bold text-stone-900">{t('sent_title')}</h2>
        <p className="text-stone-600">{t('success')}</p>
        <Button variant="outline" onClick={() => setEtape('formulaire')} className="rounded-xl">{t('new_message')}</Button>
      </div>
    );
  }

  // ── Étape 2 : code reçu par e-mail ──
  if (etape === 'code') {
    return (
      <div className={`${carte} space-y-6`}>
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
            <MailCheck className="text-brand-600" size={30} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">{t('code_title')}</h2>
          <p className="text-stone-600">
            {t('code_sent_to')} <strong dir="ltr" className="text-stone-900">{formData.email}</strong>
          </p>
          <p className="text-sm text-stone-500">{t('code_hint')}</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); verifier(code); }} className="space-y-3">
          <Label htmlFor="code" className="sr-only">{t('code_label')}</Label>
          <input
            id="code"
            ref={codeRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            dir="ltr"
            value={code}
            aria-invalid={!!erreurCode}
            aria-describedby={erreurCode ? 'code-erreur' : undefined}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              if (v.length === 6) verifier(v); // validation automatique au 6e chiffre
            }}
            placeholder="••••••"
            className={`w-full h-16 text-center text-3xl font-bold tracking-[0.6em] rounded-2xl border-2 bg-stone-50 focus:outline-none focus:ring-4 transition
              ${erreurCode ? 'border-coral-400 focus:ring-coral-100' : 'border-stone-200 focus:border-brand-500 focus:ring-brand-100'}`}
          />
          {erreurCode && <p id="code-erreur" className="text-sm text-coral-600 text-center" role="alert">{erreurCode}</p>}

          <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-brand-600 hover:bg-brand-700 text-white h-12 rounded-xl text-base">
            {loading ? <Loader2 className="animate-spin" size={20} /> : t('code_verify')}
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button type="button" onClick={() => setEtape('formulaire')} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-brand-700 font-medium">
            <ArrowLeft size={16} className="rtl:hidden" /><ArrowRight size={16} className="ltr:hidden" /> {t('change_email')}
          </button>
          <button type="button" onClick={renvoyer} disabled={loading || attente > 0}
            className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline disabled:text-stone-400 disabled:no-underline disabled:cursor-not-allowed">
            <RotateCw size={15} /> {attente > 0 ? t('resend_in', { seconds: attente }) : t('resend')}
          </button>
        </div>
      </div>
    );
  }

  // ── Étape 1 : formulaire ──
  return (
    <form onSubmit={envoyer} className={`${carte} space-y-6`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nom">{t('form_name')}</Label>
          <Input id="nom" required maxLength={255} placeholder={t('form_name_placeholder')} value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('form_email')}</Label>
          <Input id="email" type="email" required maxLength={255} autoComplete="email" placeholder={t('form_email_placeholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} dir="ltr" />
          <p className="text-xs text-stone-500">{t('email_will_be_verified')}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sujet">{t('form_subject')}</Label>
        <Input id="sujet" required maxLength={255} placeholder={t('form_subject_placeholder')} value={formData.sujet} onChange={(e) => setFormData({ ...formData, sujet: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('form_message')}</Label>
        <textarea
          id="message"
          required
          rows={6}
          maxLength={2000}
          placeholder={t('form_message_placeholder')}
          className="w-full border border-stone-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-stone-50"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white h-12 rounded-xl text-base">
        {loading ? <Loader2 className="animate-spin me-2" size={20} /> : <Send size={20} className="me-2" />}
        {loading ? t('form_submitting') : t('form_submit')}
      </Button>
    </form>
  );
}
