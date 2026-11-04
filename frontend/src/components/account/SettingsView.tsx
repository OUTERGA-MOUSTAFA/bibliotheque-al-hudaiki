'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Download, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TwoFactorSettings from '@/components/account/TwoFactorSettings';

const card = 'bg-white rounded-2xl shadow-soft border border-stone-200 p-6';

function ProfileForm() {
  const t = useTranslations('settings');
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    email: user?.email ?? '',
    telephone: user?.telephone ?? '',
    adresse: user?.adresse ?? '',
    etablissement: user?.etablissement ?? '',
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/profile', form);
      updateUser(data.user);
      toast.success(t('saved'));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', required = false) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}{required && ' *'}</Label>
      <Input id={key} type={type} required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <form onSubmit={save} className={card}>
      <h2 className="font-bold text-stone-900 mb-4">{t('profile')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {field('prenom', t('prenom'), 'text', true)}
        {field('nom', t('nom'), 'text', true)}
        {field('email', t('email'), 'email', true)}
        {field('telephone', t('telephone'), 'tel', true)}
        {field('adresse', t('adresse'))}
        {field('etablissement', t('etablissement'))}
      </div>
      <Button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
        {saving ? <Loader2 size={16} className="animate-spin" /> : t('save')}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const t = useTranslations('settings');
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', form);
      setForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success(t('password_changed'));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className={card}>
      <h2 className="font-bold text-stone-900 mb-4">{t('password_section')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {(['current_password', 'password', 'password_confirmation'] as const).map((key) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{t(key)}</Label>
            <Input
              id={key}
              type="password"
              required
              minLength={key === 'current_password' ? undefined : 8}
              autoComplete={key === 'current_password' ? 'current-password' : 'new-password'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
        {saving ? <Loader2 size={16} className="animate-spin" /> : t('change_password')}
      </Button>
    </form>
  );
}

function PrivacySection() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const { isAdmin } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const exportData = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes-donnees-al-hudaiki-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await api.delete('/me', { data: { password } });
      auth.clear();
      toast.success(t('account_deleted'));
      // Rechargement complet : tous les composants oublient l'utilisateur supprimé
      window.location.assign(`/${locale}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className={card}>
      <h2 className="font-bold text-stone-900 mb-1">{t('privacy_title')}</h2>
      <p className="text-sm text-stone-600 mb-4">
        {t('privacy_hint')}{' '}
        <Link href="/confidentialite" className="text-brand-600 font-semibold hover:underline">{t('privacy_link')}</Link>
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={exportData} disabled={exporting}>
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {t('export')}
        </Button>
        {!isAdmin && !confirmDelete && (
          <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-coral-600 hover:bg-coral-50 border-coral-200">
            <Trash2 size={16} /> {t('delete_account')}
          </Button>
        )}
      </div>

      {confirmDelete && (
        <form onSubmit={deleteAccount} className="mt-4 p-4 rounded-xl bg-coral-50 border border-coral-200 space-y-3 max-w-md">
          <p className="text-sm text-coral-800 font-medium">{t('delete_warning')}</p>
          <Label htmlFor="delete-password">{t('current_password')}</Label>
          <Input id="delete-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white" />
          <div className="flex gap-2">
            <Button type="submit" disabled={deleting} className="bg-coral-600 hover:bg-coral-700 text-white rounded-xl">
              {deleting ? <Loader2 size={16} className="animate-spin" /> : t('delete_confirm')}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setConfirmDelete(false); setPassword(''); }}>{t('cancel')}</Button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function SettingsView() {
  const t = useTranslations('settings');
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <div>
        <Link href="/compte" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-700 mb-3">
          <ArrowLeft size={14} className="rtl:hidden" /><ArrowRight size={14} className="ltr:hidden" /> {t('back')}
        </Link>
        <h1 className="text-3xl font-bold text-stone-900">{t('title')}</h1>
      </div>
      <ProfileForm />
      <PasswordForm />
      <TwoFactorSettings />
      <PrivacySection />
    </div>
  );
}
