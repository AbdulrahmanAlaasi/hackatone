import Link from 'next/link';
import { Badge, Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export default async function ScoringIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUserOrRedirect();

  // Show all submitted projects + how many criteria the current judge has scored
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, title, status, teams(name)')
    .eq('hackathon_id', id)
    .in('status', ['submitted', 'locked']);

  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('id')
    .eq('hackathon_id', id);

  const { data: myScores } = await supabase
    .from('scores')
    .select('submission_id, criteria_id')
    .eq('hackathon_id', id)
    .eq('judge_id', user.id);

  const totalCriteria = criteria?.length ?? 0;
  const progressBySubmission = new Map<string, number>();
  (myScores ?? []).forEach((s) => {
    progressBySubmission.set(s.submission_id, (progressBySubmission.get(s.submission_id) ?? 0) + 1);
  });

  const list = submissions ?? [];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        Judges see <strong>{list.length}</strong> submitted project{list.length === 1 ? '' : 's'}.
        Scoring uses {totalCriteria} criteria.
      </Card>

      {list.length === 0 ? (
        <EmptyState title="No projects to score yet" body="Submissions will appear here as teams submit." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Submission</Th>
              <Th>Team</Th>
              <Th>Your progress</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {list.map((s: any) => {
              const done = progressBySubmission.get(s.id) ?? 0;
              const complete = totalCriteria > 0 && done >= totalCriteria;
              return (
                <Tr key={s.id}>
                  <Td><strong>{s.title}</strong></Td>
                  <Td>{s.teams?.name ?? '—'}</Td>
                  <Td>
                    <Badge tone={complete ? 'success' : done > 0 ? 'info' : 'neutral'}>
                      {done} / {totalCriteria}
                    </Badge>
                  </Td>
                  <Td>
                    <Link href={`/dashboard/hackathons/${id}/scoring/${s.id}`}>Score →</Link>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
