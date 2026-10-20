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
  title: 'Ann — Stories That Stay',
  description: 'Discover thoughtful stories, essays, and books by Ann.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <LanguageProvider>
          <AuthProvider>
            <StoreProvider>
              <div className="demo-banner">A DESIGN DEMO · SAMPLE TITLES AND PRICES · NO REAL PAYMENTS</div>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
              <CartDrawer />
              <ReadingCompanionDrawer />
              <AuthModal />
              <CookieBanner />
            </StoreProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
