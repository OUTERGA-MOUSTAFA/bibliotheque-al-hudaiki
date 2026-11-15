import { setRequestLocale } from 'next-intl/server';
import VerifyFromLink from '@/components/contact/VerifyFromLink';

// Lien reçu par e-mail : /contact/verifier?token=…&code=123456
export default async function ContactVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; code?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token = '', code = '' } = await searchParams;

  return (
    <div className="bg-cream min-h-[70vh] py-20 px-4">
      <VerifyFromLink token={token} code={code} />
    </div>
  );
}
