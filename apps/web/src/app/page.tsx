import Link from 'next/link';
import {
  ActionTile,
  Button,
  Container,
  Display,
  Eyebrow,
  Hero,
} from '@/components/ui';

export default function HomePage() {
  return (
    <main>
      <Hero tone="sunrise">
        <Eyebrow light>Hackatone</Eyebrow>
        <Display light>
          Run friendly,
          <br />
          well-organized hackathons.
        </Display>
        <p
          style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: 'var(--font-size-body-lg)',
            margin: '20px 0 28px',
            maxWidth: 640,
          }}
        >
          One warm workspace for registration, QR check-in, teams, submissions,
          judging, and live results. Built for organizers who&apos;d rather focus on the event
          than the spreadsheets.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link href="/signup">
            <Button style={{ background: '#fff', color: 'var(--color-primary-pressed)' }}>
              Start an organization
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="secondary"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Sign in
            </Button>
          </Link>
        </div>
      </Hero>

      <section style={{ padding: '64px 0' }}>
        <Container>
          <Eyebrow>What&apos;s inside</Eyebrow>
          <h2 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 800, margin: '8px 0 32px' }}>
            Everything to run a hackathon end-to-end.
          </h2>
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <ActionTile
              href="/signup"
              tone="sunrise"
              icon="📲"
              title="Registration QR"
              subtitle="Share one link, fill seats fast."
            />
            <ActionTile
              href="/signup"
              tone="peach"
              icon="✅"
              title="Smooth check-in"
              subtitle="Scan QR or search manually."
            />
            <ActionTile
              href="/signup"
              tone="mint"
              icon="🤝"
              title="Teams & submissions"
              subtitle="Mobile-first project flow."
            />
            <ActionTile
              href="/signup"
              tone="sky"
              icon="🏆"
              title="Judging & leaderboard"
              subtitle="Fair tiebreakers, publish results."
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
