import { notFound } from 'next/navigation';
import { Badge, Card, Container } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { RegistrationForm } from './RegistrationForm';

export default async function PublicRegistrationPage({
  params,
}: {
  params: { hackathonSlug: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select(
      'id, title, description, location, starts_at, ends_at, registration_deadline, status, min_team_size, max_team_size',
    )
    .eq('slug', params.hackathonSlug)
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
    <main style={{ padding: '32px 0' }}>
      <Container size="form">
        <p style={{ color: 'var(--color-primary-pressed)', fontWeight: 800, margin: 0 }}>
          Hackatone
        </p>
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 800,
            margin: '12px 0 var(--space-3)',
          }}
        >
          {hackathon.title}
        </h1>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-5)',
          }}
        >
          <Badge tone={open ? 'success' : 'warning'}>
            {open ? 'Registration open' : hackathon.status.replace('_', ' ')}
          </Badge>
          {hackathon.location ? <Badge tone="info">{hackathon.location}</Badge> : null}
          {hackathon.starts_at ? (
            <Badge tone="neutral">{new Date(hackathon.starts_at).toLocaleDateString()}</Badge>
          ) : null}
        </div>
        {hackathon.description ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-lg)' }}>
            {hackathon.description}
          </p>
        ) : null}

        {closed ? (
          <Card tone="soft" style={{ marginTop: 'var(--space-6)' }}>
            <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
              Registration is closed
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              This hackathon is no longer accepting new registrations.
            </p>
          </Card>
        ) : (
          <Card style={{ marginTop: 'var(--space-6)' }}>
            <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
              Register
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              No password needed here. After organizers accept you, sign in to the Hackatone mobile
              app with the same email.
            </p>
            <RegistrationForm
              hackathonId={hackathon.id}
              hackathonSlug={params.hackathonSlug}
              hackathonTitle={hackathon.title}
              tracks={tracks ?? []}
            />
          </Card>
        )}
      </Container>
    </main>
  );
}
