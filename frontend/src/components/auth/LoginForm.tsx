'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // 👈 ZIDNA HADI

export default function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 👇 State jdid l'les erreurs dial les champs
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
      const data = await login(email, password);
      toast.success("Connexion réussie !");
      if (data.roles && data.roles.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/compte');
      }
      router.refresh();
    } catch (err: any) {
      // 🚨 Hna fin kaytle3 l'erreur
      if (err.response?.status === 422 || err.response?.status === 401) {
        // Erreurs dial validation (Laravel)
        const apiErrors = err.response.data.errors || {};
        setErrors({
          email: apiErrors.email?.[0],
          password: apiErrors.password?.[0],
          general: err.response.data.message || 'Identifiants incorrects'
        });
        toast.error("Erreur de connexion", {
          description: "Vérifiez vos identifiants.",
        });
      } else if (err.request) {
        // L'Backend mtfi wla CORS
        setErrors({ general: 'Impossible de contacter le serveur.' });
        toast.error("Erreur serveur", {
          description: "Vérifiez que Laravel est lancé.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 space-y-5">

      {/* Erreur Générale (Toast msta3mla hit l'fo9, walakin nzido hna ila bghiti) */}
      {errors.general && (
        <div className="flex items-start gap-2 p-3 bg-coral-50 border border-coral-200 rounded-xl text-sm text-coral-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className={errors.email ? "text-coral-600" : ""}>{t('email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? "border-coral-500 focus-visible:ring-coral-500" : ""}
          required
          disabled={loading}
        />
        {/* 👇 Erreur dial Email ta7t l'champs */}
        {errors.email && <p className="text-xs text-coral-600 font-medium">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={errors.password ? "text-coral-600" : ""}>{t('password')}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? "border-coral-500 focus-visible:ring-coral-500" : ""}
          required
          disabled={loading}
        />
        {errors.password && <p className="text-xs text-coral-600 font-medium">{errors.password}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 bg-brand-600 hover:bg-brand-700 rounded-xl">
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Chargement...</> : t('sign_in')}
      </Button>

      <p className="text-center text-sm text-stone-600">
        {t('no_account')}{' '}
        <Link href="/register" className="text-brand-600 font-semibold hover:underline">{t('sign_up')}</Link>
      </p>
    </form>
  );
}