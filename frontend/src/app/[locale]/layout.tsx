import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { IBM_Plex_Sans_Arabic, Reem_Kufi } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../globals.css';
import { Toaster } from '@/components/ui/sonner';

// Titres : Reem Kufi, un kufi géométrique (angles et losanges proches des motifs amazighs),
// dessiné pour l'arabe ET le latin : la même voix dans les deux langues.
const reemKufi = Reem_Kufi({
  subsets: ['arabic', 'latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-reem-kufi',
  display: 'swap',
});

// Texte courant : IBM Plex Sans Arabic, lisible en arabe comme en français
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
});

// Titre et description de l'onglet dans la langue de la page
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: { default: t('title'), template: `%s — ${t('title')}` },
    description: t('description'),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${reemKufi.variable} ${plexArabic.variable} font-body`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-cream text-night antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
