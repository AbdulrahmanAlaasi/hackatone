import { Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { AssignJudgeForm, RemoveJudgeButton } from './client';

export default async function JudgesPage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: assignments } = await supabase
    .from('judge_assignments')
    .select('id, submission_id, profiles(id, full_name, email)')
    .eq('hackathon_id', params.id)
    .is('submission_id', null);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <h3 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
          Assign a judge
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          The judge must already have a Hackatone account (any sign-up works). They'll score every
          submission in this hackathon.
        </p>
        <AssignJudgeForm hackathonId={params.id} />
      </Card>

      {(assignments?.length ?? 0) === 0 ? (
        <EmptyState title="No judges assigned" body="Add a judge by email to enable scoring." />
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
                <Td><RemoveJudgeButton hackathonId={params.id} assignmentId={a.id} /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
