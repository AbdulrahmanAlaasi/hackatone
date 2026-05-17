import Link from 'next/link';
import type { ReactNode } from 'react';
import { Display, Eyebrow } from '@/components/ui';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.split}>
      {/* Left: warm brand panel — visible on tablet+ */}
      <aside className={styles.brand}>
        <div className={styles.rings}>
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className={styles.blob} />

        <div className={styles.brandTop}>
          <Eyebrow light>Hackatone</Eyebrow>
          <Display light>
            Warm hackathons,
            <br />
            done right.
          </Display>
          <p className={styles.brandTagline}>
            Registration, QR check-in, AI-balanced teams, judging, and live results — all in one
            calm workspace.
          </p>
        </div>

        <p className={styles.brandFooter}>© Hackatone · Made for organizers who&apos;d rather focus on the event.</p>
      </aside>

      {/* Right: focused form panel */}
      <main className={styles.form}>
        <div className={styles.formInner}>
          <Link href="/" className={styles.back}>
            ← Back to home
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
