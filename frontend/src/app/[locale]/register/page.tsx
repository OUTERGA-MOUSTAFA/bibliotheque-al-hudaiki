import RegisterForm from '@/components/auth/RegisterForm';
import { getTranslations } from 'next-intl/server';

export default async function RegisterPage() {
  const t = await getTranslations('auth');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {t('register_title')}
          </h1>
          <p className="text-stone-600">{t('register_subtitle')}</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}