import { Card, Container } from '@/components/ui';

export default async function RegistrationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ hackathon?: string }>;
}) {
  const { hackathon } = await searchParams;
  return (
    <main style={{ padding: '64px 0' }}>
      <Container size="form">
        <Card tone="soft">
          <h1 style={{ marginTop: 0, fontSize: 'var(--font-size-h1)', fontWeight: 800 }}>
            You&apos;re registered 🎉
          </h1>
          <p style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-body-lg)' }}>
            We received your registration{hackathon ? ` for ${hackathon}` : ''}.
            The organizers will review it and let you know.
          </p>
          <h2 style={{ fontSize: 'var(--font-size-h3)', marginTop: 'var(--space-6)' }}>
            Next: open the Hackatone mobile app
          </h2>
          <ol style={{ paddingLeft: '1.2em', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            <li>Download Hackatone for iOS or Android (Expo Go for now).</li>
            <li>Sign in using <strong>the same email</strong> you registered with.</li>
            <li>Once accepted, the hackathon will appear in your app with your QR code.</li>
          </ol>
        </Card>
      </Container>
    </main>
  );
}
