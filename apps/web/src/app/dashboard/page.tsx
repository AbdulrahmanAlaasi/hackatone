import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Container,
  Display,
  Eyebrow,
  StatCard,
} from '@/components/ui';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function firstName(email: string | undefined, fullName: string | null | undefined) {
  if (fullName) return fullName.split(' ')[0] ?? 'there';
  if (!email) return 'there';
  const local = email.split('@')[0] ?? email;
  const stem = local.split('.')[0] ?? local;
  return stem.replace(/^\w/, (c) => c.toUpperCase());
}

export default async function DashboardOverviewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .maybeSingle();

  const { data: hackathons } = await supabase
    .from('hackathons')
    .select('id, title, slug, status, starts_at')
    .order('starts_at', { ascending: false })
    .limit(5);

  const { data: stats } = await supabase.from('hackathon_dashboard_stats').select('*');

  const totals = (stats ?? []).reduce(
    (acc, s) => ({
      registrations: acc.registrations + Number(s.registrations_count ?? 0),
      accepted: acc.accepted + Number(s.accepted_count ?? 0),
      checkedIn: acc.checkedIn + Number(s.checked_in_count ?? 0),
      submissions: acc.submissions + Number(s.submissions_count ?? 0),
    }),
    { registrations: 0, accepted: 0, checkedIn: 0, submissions: 0 },
  );

  const name = firstName(user?.email, profile?.full_name);

  return (
    <Container>
      {/* Warm hero — sits inside the dashboard shell */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FFB066 0%, #FF8A3D 50%, #F26F23 100%)',
          color: '#fff',
          borderRadius: 32,
          padding: 'var(--space-8)',
          marginTop: 'var(--space-6)',
        }}
      >
        <Eyebrow light>{greeting()}</Eyebrow>
        <Display light>
          {name}, here&apos;s your overview.
        </Display>
        <p style={{ color: 'rgba(255,255,255,0.95)', maxWidth: 540, marginTop: 16 }}>
          {(hackathons?.length ?? 0) > 0
            ? `You're running ${hackathons!.length} hackathon${hackathons!.length === 1 ? '' : 's'}.`
            : 'No hackathons yet. Spin one up to get rolling.'}
        </p>
        <div style={{ marginTop: 'var(--space-5)' }}>
          <Link href="/dashboard/hackathons/new">
            <Button style={{ background: '#fff', color: 'var(--color-primary-pressed)' }}>
              + New hackathon
            </Button>
          </Link>
        </div>
      </section>

      <section
        style={{
          marginTop: 'var(--space-8)',
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <StatCard label="Registrations" value={totals.registrations} />
        <StatCard label="Accepted" value={totals.accepted} />
        <StatCard label="Checked in" value={totals.checkedIn} />
        <StatCard label="Submissions" value={totals.submissions} />
      </section>

      <section style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
          Recent hackathons
        </h2>
        {(hackathons?.length ?? 0) === 0 ? (
          <Card tone="cream">
            <CardTitle>No hackathons yet</CardTitle>
            <CardBody style={{ marginTop: 'var(--space-3)' }}>
              <Link href="/dashboard/hackathons/new">Create your first hackathon →</Link>
            </CardBody>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-3)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {hackathons!.map((h) => (
              <Link
                key={h.id}
                href={`/dashboard/hackathons/${h.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: 'var(--color-surface-soft)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    🚀
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CardTitle>{h.title}</CardTitle>
                    <p
                      style={{
                        margin: '6px 0 8px',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-caption)',
                      }}
                    >
                      {h.starts_at ? new Date(h.starts_at).toLocaleDateString() : 'no start date'}
                    </p>
                    <Badge tone={h.status === 'active' ? 'success' : 'info'}>{h.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
