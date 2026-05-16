import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hackatone',
  description: 'Run hackathons end-to-end: registration, check-in, teams, submissions, judging.',
};

export const runtime = 'edge';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
