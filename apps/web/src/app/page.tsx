import Link from 'next/link';
import { Button, Card, CardBody, CardTitle, Container } from '@/components/ui';

export default function HomePage() {
  return (
    <main>
      <section style={{ padding: '64px 0 32px' }}>
        <Container>
          <div style={{ maxWidth: 720 }}>
            <p
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-primary-pressed)',
                fontWeight: 800,
                margin: 0,
              }}
            >
              Hackatone
            </p>
            <h1
              style={{
                fontSize: 'var(--font-size-display)',
                fontWeight: 800,
                lineHeight: 1.08,
                margin: '12px 0 16px',
              }}
            >
              Run friendly, well-organized hackathons.
            </h1>
            <p style={{ fontSize: 'var(--font-size-body-lg)', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
              Create events, share a registration QR, check participants in, manage teams,
              collect submissions, and judge projects — all in one warm, focused workspace.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link href="/signup"><Button>Start an organization</Button></Link>
              <Link href="/login"><Button variant="secondary">Sign in</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <section style={{ padding: '24px 0 64px' }}>
        <Container>
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}
          >
            {[
              { t: 'Public registration QR', b: 'Share one link. Participants register in seconds.' },
              { t: 'Smooth check-in', b: 'Scan participant QR or search by name.' },
              { t: 'Teams + submissions', b: 'Mobile-friendly submission flow with live updates.' },
              { t: 'Judging + leaderboard', b: 'Configurable criteria, fair tiebreakers, publish results.' },
            ].map((f) => (
              <Card key={f.t}>
                <CardTitle>{f.t}</CardTitle>
                <CardBody style={{ marginTop: 'var(--space-2)' }}>{f.b}</CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
