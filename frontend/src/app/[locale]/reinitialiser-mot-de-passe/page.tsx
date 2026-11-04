import { getTranslations, setRequestLocale } from 'next-intl/server';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

// Page ouverte depuis le lien de l'e-mail : ?token=…&email=…
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token = '', email = '' } = await searchParams;
  const t = await getTranslations('password_reset');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">{t('reset_title')}</h1>
        </div>
        <ResetPasswordForm token={token} email={email} />
      </div>
    </div>
  );
}
