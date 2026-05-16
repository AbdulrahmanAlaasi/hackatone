import Link from 'next/link';
import { Button, Container, Display, Eyebrow, Hero } from '@/components/ui';

export default function HomePage() {
  return (
    <main>
      <Hero tone="sunrise">
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
          One warm workspace for registration, QR check-in, teams, submissions, judging,
          and live results — with AI-balanced teams from participant CVs.
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
      </Hero>

      <Container>
        <section
          style={{
            padding: '96px 0',
            textAlign: 'center',
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          <Eyebrow>For organizers</Eyebrow>
          <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 800, margin: '8px 0 16px' }}>
            From idea to leaderboard in one workspace.
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-lg)', lineHeight: 1.65 }}>
            Spin up a hackathon, share a registration QR, review participants, manage teams,
            collect submissions, and publish results — without juggling five tools.
          </p>
        </section>
      </Container>
    </main>
  );
}
