'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', password_confirmation: '',
    date_naissance: '', adresse: '', telephone: '', cin: '',
    numero_massar: '', etablissement: '',
  });

  // 👇 State l'les erreurs
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentement, setConsentement] = useState(false);

  const update = (key: string, value: string) => {
    setFormData((s) => ({ ...s, [key]: value }));
    // Mlli kaykteb, kaymse7 l'erreur dial dak l'champs
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const isMajeur = (() => {
    if (!formData.date_naissance) return false;

    const birthDate = new Date(`${formData.date_naissance}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return false;

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const beforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());

    if (beforeBirthday) age--;

    return age >= 18;
  })();
  const isEtudiant = formData.etablissement.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await register({ ...formData, consentement });
      toast.success(t('register_success'));
      router.push('/compte');
      router.refresh();
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
      if (err.response?.status === 422) {
        const apiErrors = err.response.data?.errors ?? {};
        const formattedErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key][0];
        });
        setErrors(formattedErrors);
        toast.error(t('validation_error'), { description: t('validation_hint') });
      } else {
        toast.error(t('server_error'), { description: err.response?.data?.message || t('server_unreachable') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-6">

      {/* Identité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.nom ? "text-coral-600" : ""}>{t('nom')} *</Label>
          <Input
            value={formData.nom}
            onChange={(e) => update('nom', e.target.value)}
            className={errors.nom ? "border-coral-500 focus-visible:ring-coral-500" : ""}
            required
          />
          {errors.nom && <p className="text-xs text-coral-600">{errors.nom}</p>}
        </div>

        <div className="space-y-2">
          <Label className={errors.prenom ? "text-coral-600" : ""}>{t('prenom')} *</Label>
          <Input
            value={formData.prenom}
            onChange={(e) => update('prenom', e.target.value)}
            className={errors.prenom ? "border-coral-500 focus-visible:ring-coral-500" : ""}
            required
          />
          {errors.prenom && <p className="text-xs text-coral-600">{errors.prenom}</p>}
        </div>

        <div className="space-y-2">
          <Label className={errors.date_naissance ? "text-coral-600" : ""}>{t('date_naissance')} *</Label>
          <Input
            type="date"
            value={formData.date_naissance}
            onChange={(e) => update('date_naissance', e.target.value)}
            className={errors.date_naissance ? "border-coral-500 focus-visible:ring-coral-500" : ""}
            required
          />
          {errors.date_naissance && <p className="text-xs text-coral-600">{errors.date_naissance}</p>}
        </div>

        <div className="space-y-2">
          <Label className={errors.telephone ? "text-coral-600" : ""}>{t('telephone')} *</Label>
          <Input
            type="tel"
            value={formData.telephone}
            onChange={(e) => update('telephone', e.target.value)}
            className={errors.telephone ? "border-coral-500 focus-visible:ring-coral-500" : ""}
            required
          />
          {errors.telephone && <p className="text-xs text-coral-600">{errors.telephone}</p>}
        </div>
      </div>

      {/* Pièces d'identité : le CIN est exigé par l'API pour les majeurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cin" className={errors.cin ? "text-coral-600" : ""}>
            {t('cin')} {isMajeur ? '*' : <span className="text-stone-400 font-normal">({t('optional')})</span>}
          </Label>
          <Input
            id="cin"
            value={formData.cin}
            onChange={(e) => update('cin', e.target.value.toUpperCase())}
            className={errors.cin ? "border-coral-500 focus-visible:ring-coral-500" : ""}
            required={isMajeur}
            maxLength={20}
            autoComplete="off"
          />
          {errors.cin
            ? <p className="text-xs text-coral-600">{errors.cin}</p>
            : isMajeur && <p className="text-xs text-stone-500">{t('cin_hint')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresse" className={errors.adresse ? "text-coral-600" : ""}>
            {t('adresse')} <span className="text-stone-400 font-normal">({t('optional')})</span>
          </Label>
          <Input id="adresse" value={formData.adresse} onChange={(e) => update('adresse', e.target.value)} maxLength={500} autoComplete="street-address" />
          {errors.adresse && <p className="text-xs text-coral-600">{errors.adresse}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="etablissement" className={errors.etablissement ? "text-coral-600" : ""}>
            {t('etablissement')} <span className="text-stone-400 font-normal">({t('optional')})</span>
          </Label>
          <Input id="etablissement" value={formData.etablissement} onChange={(e) => update('etablissement', e.target.value)} maxLength={255} />
          {errors.etablissement && <p className="text-xs text-coral-600">{errors.etablissement}</p>}
        </div>

        {/* Le numéro Massar ne concerne que les élèves : affiché quand un établissement est saisi */}
        {isEtudiant && (
          <div className="space-y-2">
            <Label htmlFor="numero_massar" className={errors.numero_massar ? "text-coral-600" : ""}>
              {t('numero_massar')} <span className="text-stone-400 font-normal">({t('optional')})</span>
            </Label>
            <Input
              id="numero_massar"
              value={formData.numero_massar}
              onChange={(e) => update('numero_massar', e.target.value.toUpperCase())}
              className={errors.numero_massar ? "border-coral-500 focus-visible:ring-coral-500" : ""}
              maxLength={20}
              autoComplete="off"
            />
            {errors.numero_massar && <p className="text-xs text-coral-600">{errors.numero_massar}</p>}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className={errors.email ? "text-coral-600" : ""}>{t('email')} *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            className={errors.email ? "border-coral-500 focus-visible:ring-coral-500" : ""}
            required
          />
          {errors.email && <p className="text-xs text-coral-600">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={errors.password ? "text-coral-600" : ""}>{t('password')} *</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => update('password', e.target.value)}
              className={errors.password ? "border-coral-500 focus-visible:ring-coral-500" : ""}
              required minLength={8}
            />
            {errors.password && <p className="text-xs text-coral-600">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label className={errors.password_confirmation ? "text-coral-600" : ""}>{t('password_confirm')} *</Label>
            <Input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => update('password_confirmation', e.target.value)}
              className={errors.password_confirmation ? "border-coral-500 focus-visible:ring-coral-500" : ""}
              required
            />
            {errors.password_confirmation && <p className="text-xs text-coral-600">{errors.password_confirmation}</p>}
          </div>
        </div>
      </div>

      {/* Loi 09-08 : consentement explicite, avec lien vers la politique de confidentialité */}
      <div className="space-y-1">
        <label className="flex items-start gap-3 text-sm text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={consentement}
            onChange={(e) => {
              setConsentement(e.target.checked);
              if (errors.consentement) setErrors((prev) => ({ ...prev, consentement: '' }));
            }}
            required
            className="mt-0.5 h-4 w-4 accent-brand-600 shrink-0"
          />
          <span>
            {t('consent')}{' '}
            <Link href="/confidentialite" target="_blank" className="text-brand-600 font-semibold hover:underline">
              {t('consent_link')}
            </Link>
          </span>
        </label>
        {errors.consentement && <p className="text-xs text-coral-600">{errors.consentement}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl">
        {loading ? <Loader2 size={16} className="animate-spin" /> : t('sign_up')}
      </Button>
    </form>
  );
}