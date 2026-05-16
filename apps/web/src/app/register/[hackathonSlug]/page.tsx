import { notFound } from 'next/navigation';
import { Badge, Card, Container, Display, Eyebrow, Hero } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { RegistrationForm } from './RegistrationForm';

export default async function PublicRegistrationPage({
  params,
}: {
  params: Promise<{ hackathonSlug: string }>;
}) {
  const { hackathonSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select(
      'id, title, description, location, starts_at, ends_at, registration_deadline, status, min_team_size, max_team_size',
    )
    .eq('slug', hackathonSlug)
    .maybeSingle();

  if (!hackathon) notFound();

  const { data: tracks } = await supabase
    .from('hackathon_tracks')
    .select('id, name, description')
    .eq('hackathon_id', hackathon.id)
    .order('created_at', { ascending: true });

  const open = hackathon.status === 'registration_open';
  const closed = !open && hackathon.status !== 'draft';

  return (
    <main>
      <Hero tone="peach">
        <Eyebrow>You&apos;re invited</Eyebrow>
        <Display>{hackathon.title}</Display>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            marginTop: 'var(--space-4)',
          }}
        >
          <Badge tone={open ? 'success' : 'warning'}>
            {open ? '✓ Registration open' : hackathon.status.replace('_', ' ')}
          </Badge>
          {hackathon.location ? <Badge tone="neutral">📍 {hackathon.location}</Badge> : null}
          {hackathon.starts_at ? (
            <Badge tone="neutral">📅 {new Date(hackathon.starts_at).toLocaleDateString()}</Badge>
          ) : null}
        </div>
        {hackathon.description ? (
          <p
            style={{
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-body-lg)',
              maxWidth: 640,
              marginTop: 'var(--space-5)',
            }}
          >
            {hackathon.description}
          </p>
        ) : null}
      </Hero>

      <Container size="form">
        <div style={{ marginTop: 'var(--space-8)' }}>
          {closed ? (
            <Card tone="cream">
              <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>
                Registration is closed
              </h2>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                This hackathon is no longer accepting new registrations.
              </p>
            </Card>
          ) : (
            <Card>
              <Eyebrow>Quick form</Eyebrow>
              <h2 style={{ marginTop: 6, fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>
                Save your spot
              </h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                No password needed here. After organizers accept you, sign into the Hackatone mobile
                app with the same email to get your check-in QR.
              </p>
              <RegistrationForm
                hackathonId={hackathon.id}
                hackathonSlug={hackathonSlug}
                hackathonTitle={hackathon.title}
                tracks={tracks ?? []}
              />
            </Card>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <Card tone="sky">
            <strong>What happens next?</strong>
            <ol
              style={{
                paddingLeft: '1.2em',
                marginTop: 'var(--space-2)',
                marginBottom: 0,
                color: 'var(--color-text)',
                lineHeight: 1.8,
              }}
            >
              <li>Submit this form.</li>
              <li>Organizers review &amp; accept you.</li>
              <li>Download Hackatone mobile (Expo Go for now).</li>
              <li>Sign in with the same email — your QR appears.</li>
            </ol>
          </Card>
        </div>
      </Container>
    </main>
  );
}
