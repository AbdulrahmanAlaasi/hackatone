import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hackatone',
  description: 'Run hackathons end-to-end: registration, check-in, teams, submissions, judging.',
  icons: {
    icon: '/hackatone_icon.svg',
    apple: '/hackatone_app_icon.svg',
  },
};

export const runtime = 'edge';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
