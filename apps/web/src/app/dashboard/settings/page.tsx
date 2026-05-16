import { Card, CardBody, CardTitle, Container, TopHeader } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMyOrganization } from '@/lib/auth';
import { OrgLogoForm } from './OrgLogoForm';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
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

  const { organization } = await getMyOrganization();
  let org: { id: string; name: string; logo_url: string | null } | null = null;
  if (organization) {
    const { data } = await supabase
      .from('organizations')
      .select('id, name, logo_url')
      .eq('id', organization.id)
      .maybeSingle();
    org = (data as any) ?? null;
  }

  return (
    <Container>
      <TopHeader title="Settings" subtitle="Profile and organization." />
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

        {org ? (
          <Card>
            <CardTitle>Organization logo</CardTitle>
            <CardBody style={{ marginTop: 'var(--space-3)' }}>
              <OrgLogoForm orgId={org.id} orgName={org.name} initialLogoUrl={org.logo_url} />
            </CardBody>
          </Card>
        ) : null}
      </div>
    </Container>
  );
}
