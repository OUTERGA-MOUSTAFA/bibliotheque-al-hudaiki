import { getTranslations, setRequestLocale } from 'next-intl/server';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('password_reset');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">{t('forgot_title')}</h1>
          <p className="text-stone-600">{t('forgot_subtitle')}</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
