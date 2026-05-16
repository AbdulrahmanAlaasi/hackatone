import Link from 'next/link';
import {
  Button,
  Container,
  Display,
  Eyebrow,
  Hero,
  Icon,
} from '@/components/ui';
import styles from './page.module.css';

const FEATURES = [
  {
    Icon: Icon.QrCode,
    title: 'Public registration QR',
    body: 'Share one link or scannable code. Participants register in under a minute.',
  },
  {
    Icon: Icon.Sparkles,
    title: 'AI team balancer',
    body: 'Participants upload a CV; we extract skills and suggest fair, balanced teams.',
  },
  {
    Icon: Icon.Trophy,
    title: 'Judging & leaderboard',
    body: 'Configurable criteria, fair tiebreakers, publish results to the public page.',
  },
];

export default function HomePage() {
  return (
    <main>
      <Hero tone="sunrise" className={styles.heroWrap}>
        {/* Decorative motion layers — pure CSS, respect reduced-motion */}
        <div className={styles.blob} aria-hidden />
        <div className={styles.ringWrap} aria-hidden>
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          </svg>
        </div>

        <div className={styles.heroContent}>
          <Eyebrow light>Hackatone</Eyebrow>
          <Display light>
            Run friendly, well-organized hackathons.
          </Display>
          <p
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: 'var(--font-size-body-lg)',
              margin: '20px 0 32px',
              maxWidth: 640,
              lineHeight: 1.55,
            }}
          >
            One warm workspace for registration, QR check-in, teams, submissions, judging, and
            live results — with AI-balanced teams from participant CVs.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <Button style={{ background: '#fff', color: 'var(--color-primary-pressed)' }}>
                Create an organization
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                }}
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </Hero>

      <Container>
        <section style={{ padding: '96px 0 64px' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <Eyebrow>For organizers</Eyebrow>
            <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 800, margin: '8px 0 16px' }}>
              From idea to leaderboard in one workspace.
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-lg)', lineHeight: 1.65 }}>
              Stop juggling forms, spreadsheets, and group chats. Hackatone is a single workspace
              tuned for the rhythm of running a hackathon.
            </p>
          </div>

          <div className={styles.featureRow}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.feature}>
                <div className={styles.featureIcon}>
                  <f.Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-12)', textAlign: 'center' }}>
            <Link href="/signup">
              <Button>Create an organization</Button>
            </Link>
            <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
              Already on Hackatone? <Link href="/login">Sign in to your organization →</Link>
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
