import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.stage}>
      {/* Ambient blurred lights */}
      <div className={styles.ambient1} aria-hidden />
      <div className={styles.ambient2} aria-hidden />

      {/* Corner metadata labels (showcase style) */}
      <div className={styles.corners}>
        <div className={`${styles.corner} ${styles.tl}`}>
          <span>Project</span>
          Hackatone
        </div>
        <div className={`${styles.corner} ${styles.tr}`}>
          <span>Platform</span>
          Hackathon OS
          <span style={{ marginTop: 6 }}>2026</span>
        </div>
      </div>

      {/* External-link button top-right */}
      <Link href="/signup" className={styles.extLink} aria-label="Get started">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </Link>

      {/* Center: animated logo + name */}
      <div className={styles.center}>
        <div className={styles.logoWrap}>
          <div className={styles.logoSpin}>
            <LogoIcon />
          </div>
        </div>
        <h1 className={styles.bigName}>Hackatone</h1>
      </div>

      {/* Bottom action bar */}
      <div className={styles.bottom}>
        <div>
          <Link href="/" className={styles.brand}>
            <LogoIconSmall className={styles.brandIcon} />
            Hackatone
          </Link>
          <p className={styles.tagline}>
            Run hackathons end-to-end with AI-balanced teams, QR check-in, judging, and live
            results.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/login" className={styles.actionSecondary}>
            Sign in
          </Link>
          <Link href="/signup" className={styles.actionPrimary}>
            Create organization
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}

/* Inlined H mark — lets us animate the spark independently */
function LogoIcon() {
  return (
    <svg
      className={styles.logoSvg}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hackatone logo"
    >
      <defs>
        <linearGradient id="og" x1="120" y1="120" x2="390" y2="395" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC68A" />
          <stop offset="0.55" stopColor="#FF9D4D" />
          <stop offset="1" stopColor="#E96F26" />
        </linearGradient>
        <linearGradient id="og2" x1="145" y1="170" x2="365" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D45A18" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FF8A3D" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="highlight" cx="0.32" cy="0.28" r="0.55">
          <stop offset="0" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="url(#og)" />
      <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="url(#og)" />
      <path d="M187 169C211 188 232 211 256 237C280 263 301 287 325 306" stroke="url(#og2)" strokeWidth="82" strokeLinecap="round" opacity="0.86" />
      <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="url(#og)" strokeWidth="68" strokeLinecap="round" />
      <path d="M187 337C211 318 229 301 256 301C283 301 301 318 325 337" stroke="url(#og)" strokeWidth="58" strokeLinecap="round" />

      <ellipse cx="160" cy="155" rx="80" ry="20" fill="url(#highlight)" />

      <circle cx="187" cy="172" r="19" fill="#FFF8EF" />
      <circle cx="187" cy="337" r="19" fill="#FFF8EF" />
      <circle cx="256" cy="254" r="19" fill="#FFF8EF" />
      <circle cx="325" cy="172" r="19" fill="#FFF8EF" />
      <circle cx="325" cy="337" r="19" fill="#FFF8EF" />

      <g className={styles.spark} fill="#FFD166">
        <rect x="287" y="113" width="18" height="18" rx="5" />
        <rect x="262" y="138" width="14" height="14" rx="4" />
        <rect x="241" y="164" width="12" height="12" rx="4" />
      </g>
      <path
        className={styles.sparkBig}
        d="M371 78C376.614 104.365 381.635 109.386 408 115C381.635 120.614 376.614 125.635 371 152C365.386 125.635 360.365 120.614 334 115C360.365 109.386 365.386 104.365 371 78Z"
        fill="#FFB02E"
      />
    </svg>
  );
}

function LogoIconSmall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="#fff" />
      <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="#fff" />
      <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="#fff" strokeWidth="68" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
