'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', password_confirmation: '',
    date_naissance: '', adresse: '', telephone: '', cin: '',
    numero_massar: '', etablissement: '',
  });

  const update = (key: string, value: string) =>
    setFormData((s) => ({ ...s, [key]: value }));

  // Calcul majorité
  const isMajeur = (() => {
    if (!formData.date_naissance) return false;
    const age = Math.floor(
      (Date.now() - new Date(formData.date_naissance).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );
    return age >= 18;
  })();

  const isEtudiant = formData.etablissement.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      router.push('/compte');
      router.refresh();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        const first = Object.values(data.errors)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError(data?.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-6"
    >
      {error && (
        <div className="flex items-start gap-2 p-3 bg-coral-50 border border-coral-200 rounded-xl text-sm text-coral-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Identité */}
      <div>
        <h3 className="font-semibold text-stone-900 mb-3">الهوية / Identité</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('nom')} *</Label>
            <Input value={formData.nom} onChange={(e) => update('nom', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t('prenom')} *</Label>
            <Input value={formData.prenom} onChange={(e) => update('prenom', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t('date_naissance')} *</Label>
            <Input type="date" value={formData.date_naissance} onChange={(e) => update('date_naissance', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t('telephone')} *</Label>
            <Input type="tel" value={formData.telephone} onChange={(e) => update('telephone', e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-2">
        <Label>{t('adresse')}</Label>
        <Input value={formData.adresse} onChange={(e) => update('adresse', e.target.value)} />
      </div>

      {/* Conditionnel: CIN si majeur */}
      {isMajeur && (
        <div className="space-y-2 p-4 bg-gold-50 border border-gold-200 rounded-xl">
          <Label className="text-gold-800">⭐ {t('cin')} (مطلوب للبالغين) *</Label>
          <Input value={formData.cin} onChange={(e) => update('cin', e.target.value)} required />
        </div>
      )}

      {/* Établissement (optionnel) */}
      <div className="space-y-2">
        <Label>{t('etablissement')}</Label>
        <Input
          value={formData.etablissement}
          onChange={(e) => update('etablissement', e.target.value)}
          placeholder="Lycée, université, etc."
        />
      </div>

      {/* N° Massar si étudiant */}
      {isEtudiant && (
        <div className="space-y-2 p-4 bg-sky-50 border border-sky-200 rounded-xl">
          <Label className="text-sky-800">🎓 {t('numero_massar')} *</Label>
          <Input value={formData.numero_massar} onChange={(e) => update('numero_massar', e.target.value)} />
        </div>
      )}

      {/* Compte */}
      <div>
        <h3 className="font-semibold text-stone-900 mb-3">الحساب / Compte</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('email')} *</Label>
            <Input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('password')} *</Label>
              <Input type="password" value={formData.password} onChange={(e) => update('password', e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label>{t('password_confirm')} *</Label>
              <Input type="password" value={formData.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} required />
            </div>
          </div>
        </div>
      </div>

      {/* Consentement */}
      <label className="flex items-start gap-3 p-4 bg-sand rounded-xl cursor-pointer">
        <input type="checkbox" required className="mt-1 accent-brand-600" />
        <span className="text-xs text-stone-600 leading-relaxed">
          {t('consent')}{' '}
          <a href="#" className="text-brand-600 underline">سياسة الخصوصية</a>
        </span>
      </label>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin mr-2" /> ...</>
        ) : (
          t('sign_up')
        )}
      </Button>

      <p className="text-center text-sm text-stone-600">
        {t('have_account')}{' '}
        <Link href="/login" className="text-brand-600 font-semibold hover:underline">
          {t('sign_in')}
        </Link>
      </p>
    </form>
  );
}