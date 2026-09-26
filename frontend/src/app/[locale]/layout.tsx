import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Cairo, Tajawal, IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../globals.css';
import { Link, usePathname, useRouter } from '@/navigation';

// Latin (FR/EN)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
});

// Arabic principal — Cairo (modern, clean)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

// Arabic alternative — Tajawal
const tajawal = Tajawal({
  subsets: ['arabic'],
  variable: '--font-arabic-alt',
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
});

// Arabic tech — IBM Plex Sans Arabic (style kima f l'image)
const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic-tech',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

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
  if (!routing.locales.includes(locale as any)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isArabic = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`
        ${inter.variable}
        ${cairo.variable}
        ${tajawal.variable}
        ${ibmArabic.variable}
        ${isArabic ? 'font-arabic' : 'font-latin'}
      `}
    >
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}