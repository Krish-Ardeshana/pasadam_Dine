import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Caveat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-luxury',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AR_DINE — AR Smart Restaurant Platform',
  description:
    'Multi-restaurant dining operations, interactive 3D AR menu visualization, and QR dining engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${playfair.variable} ${plusJakarta.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#FBFBF9] text-[#1C1917]">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
