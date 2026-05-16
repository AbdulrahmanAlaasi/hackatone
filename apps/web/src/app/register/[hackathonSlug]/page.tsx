import { notFound } from 'next/navigation';
import { Badge, Card, Container } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Full registration form lands in Prompt 5. This shell renders the public
// hackathon details that the form will sit on top of.
export default async function PublicRegistrationPage({
  params,
}: {
  params: { hackathonSlug: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, description, location, starts_at, ends_at, registration_deadline, status')
    .eq('slug', params.hackathonSlug)
    .maybeSingle();

  if (!hackathon) notFound();

  const open = hackathon.status === 'registration_open';

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
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
          <Badge tone={open ? 'success' : 'warning'}>
            {open ? 'Registration open' : hackathon.status}
          </Badge>
          {hackathon.location ? <Badge tone="info">{hackathon.location}</Badge> : null}
        </div>
        {hackathon.description ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-lg)' }}>
            {hackathon.description}
          </p>
        ) : null}
        <Card style={{ marginTop: 'var(--space-6)' }}>
          <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
            Register
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Registration form lands in Prompt 5. For now this page proves the public route resolves
            by hackathon slug.
          </p>
        </Card>
      </Container>
    </main>
  );
}
