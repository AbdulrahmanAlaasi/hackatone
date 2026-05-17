import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      {/* Soft ambient orbs in the background */}
      <div className={styles.orb1} aria-hidden />
      <div className={styles.orb2} aria-hidden />

      <div className={styles.shell}>
        <Link href="/" className={styles.brand} aria-label="Home">
          <BrandMark />
          <span className={styles.brandText}>Hackatone</span>
        </Link>

        <div className={styles.card}>{children}</div>
      </div>
    </main>
  );
}

function BrandMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="auth-og" x1="120" y1="120" x2="390" y2="395" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF9D4D" />
          <stop offset="1" stopColor="#E96F26" />
        </linearGradient>
      </defs>
      <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="url(#auth-og)" />
      <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="url(#auth-og)" />
      <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="url(#auth-og)" strokeWidth="68" strokeLinecap="round" />
    </svg>
  );
}
