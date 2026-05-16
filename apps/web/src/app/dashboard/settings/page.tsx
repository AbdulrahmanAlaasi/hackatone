import { Card, CardBody, CardTitle, TopHeader } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, organization_or_company, major_or_job_title')
    .eq('id', user!.id)
    .maybeSingle();
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('role, organizations(name, slug)')
    .eq('user_id', user!.id);

  return (
    <>
      <TopHeader title="Settings" subtitle="Profile and organization membership." />
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <Card>
          <CardTitle>Profile</CardTitle>
          <CardBody style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-2)' }}>
            <div><strong>Name:</strong> {profile?.full_name ?? '—'}</div>
            <div><strong>Email:</strong> {profile?.email ?? user?.email}</div>
            <div><strong>Title:</strong> {profile?.major_or_job_title ?? '—'}</div>
            <div><strong>Org:</strong> {profile?.organization_or_company ?? '—'}</div>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Memberships</CardTitle>
          <CardBody style={{ marginTop: 'var(--space-3)' }}>
            {(memberships?.length ?? 0) === 0 ? (
              <p>No organization memberships yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                {memberships!.map((m, i) => (
                  <li key={i}>
                    {(m.organizations as any)?.name} — <em>{m.role}</em>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
