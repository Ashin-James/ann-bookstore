import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { StoreProvider } from '@/contexts/store-context';
import { LanguageProvider } from '@/contexts/language-context';
import { AuthProvider } from '@/contexts/auth-context';
import CartDrawer from '@/components/cart-drawer';
import ReadingCompanionDrawer from '@/components/reading-companion-drawer';
import AuthModal from '@/components/auth-modal';
import CookieBanner from '@/components/cookie-banner';
import { ToastProvider } from '@/components/account/account-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://anns-bookstore.demo'),
  title: {
    default: 'Ann — Stories That Stay',
    template: '%s | Ann’s Bookstore',
  },
  description: 'Discover thoughtful stories, essays, and books by Ann.',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/?lang=en',
      'es': '/?lang=es',
      'fr': '/?lang=fr',
      'de': '/?lang=de',
      'pt-BR': '/?lang=pt-BR',
      'it': '/?lang=it',
      'hi': '/?lang=hi',
      'ml': '/?lang=ml',
      'ta': '/?lang=ta',
      'ar': '/?lang=ar',
      'zh-Hans': '/?lang=zh-Hans',
      'ja': '/?lang=ja',
      'ko': '/?lang=ko',
      'ru': '/?lang=ru',
      'x-default': '/',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <AuthProvider>
          <LanguageProvider>
            <StoreProvider>
              <ToastProvider>
                <div className="demo-banner">A DESIGN DEMO · SAMPLE TITLES AND PRICES · NO REAL PAYMENTS</div>
                <SiteHeader />
                <main>{children}</main>
                <SiteFooter />
                <CartDrawer />
                <ReadingCompanionDrawer />
                <AuthModal />
                <CookieBanner />
              </ToastProvider>
            </StoreProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
