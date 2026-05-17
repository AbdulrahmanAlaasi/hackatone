import { Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { InviteJudgeForm, RemoveJudgeButton } from './client';

export default async function JudgesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getCurrentUserOrRedirect();
  const svc = createSupabaseServiceClient();

  const { data: assignments } = await svc
    .from('judge_assignments')
    .select('id, profiles(id, full_name, email)')
    .eq('hackathon_id', id)
    .is('submission_id', null);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <h3 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
          Invite a judge
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Enter the judge&apos;s email and click <strong>Send invite</strong>. They&apos;ll receive an email
          with a link to set up their account and access the judging interface. If they already have a
          Hackatone account they&apos;ll be added immediately.
        </p>
        <InviteJudgeForm hackathonId={id} />
      </Card>

      {(assignments?.length ?? 0) === 0 ? (
        <EmptyState title="No judges assigned" body="Invite a judge by email above to enable scoring." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {assignments!.map((a: any) => (
              <Tr key={a.id}>
                <Td><strong>{a.profiles?.full_name ?? '—'}</strong></Td>
                <Td>{a.profiles?.email ?? '—'}</Td>
                <Td><RemoveJudgeButton hackathonId={id} assignmentId={a.id} /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
