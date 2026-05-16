import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardBody, CardTitle, StatCard, TopHeader } from '@/components/ui';
import Link from 'next/link';

export default async function DashboardOverviewPage() {
  const supabase = await createSupabaseServerClient();

  // Note: hackathons RLS restricts to org members, so users with no org see nothing.
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

  return (
    <>
      <TopHeader
        title="Overview"
        subtitle="Your hackathons at a glance."
      />

      <section
        style={{
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
          <Card>
            <CardTitle>No hackathons yet</CardTitle>
            <CardBody style={{ marginTop: 'var(--space-3)' }}>
              <Link href="/dashboard/hackathons">Create your first hackathon →</Link>
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
              <Card key={h.id}>
                <CardTitle>{h.title}</CardTitle>
                <CardBody style={{ marginTop: 'var(--space-2)' }}>
                  {h.status} · {h.starts_at ? new Date(h.starts_at).toLocaleDateString() : 'no date'}
                  <br />
                  <Link href={`/dashboard/hackathons/${h.id}`}>Open →</Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
