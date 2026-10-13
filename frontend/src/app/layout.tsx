import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';

export const metadata: Metadata = {
  title: 'PRASADAM DINE — AR Smart Restaurant Platform',
  description:
    'Multi-restaurant dining operations, interactive 3D AR menu visualization, and QR dining engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#EDE1CF] text-[#1C120C]">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
