import { notFound } from 'next/navigation';
import { Card, StatCard } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { EditHackathonForm } from './EditHackathonForm';

export default async function HackathonOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!hackathon) notFound();

  const { data: stats } = await supabase
    .from('hackathon_dashboard_stats')
    .select('*')
    .eq('hackathon_id', id)
    .maybeSingle();

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <section
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <StatCard label="Registrations" value={Number(stats?.registrations_count ?? 0)} />
        <StatCard label="Accepted" value={Number(stats?.accepted_count ?? 0)} />
        <StatCard label="Checked in" value={Number(stats?.checked_in_count ?? 0)} />
        <StatCard label="Teams" value={Number(stats?.teams_count ?? 0)} />
        <StatCard label="Submissions" value={Number(stats?.submissions_count ?? 0)} />
      </section>

      <Card>
        <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>Details</h2>
        <EditHackathonForm hackathon={hackathon as any} />
      </Card>
    </div>
  );
}
