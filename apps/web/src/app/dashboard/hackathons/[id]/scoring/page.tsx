import Link from 'next/link';
import { Badge, Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export default async function ScoringIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getCurrentUserOrRedirect();
  const svc = createSupabaseServiceClient();

  const { data: submissions } = await svc
    .from('submissions')
    .select('id, title, status, teams(name)')
    .eq('hackathon_id', id)
    .in('status', ['submitted', 'locked']);

  const { data: criteria } = await svc
    .from('judging_criteria')
    .select('id')
    .eq('hackathon_id', id);

  const { data: allScores } = await svc
    .from('scores')
    .select('submission_id, judge_id, criteria_id, score, is_final')
    .eq('hackathon_id', id);

  const { data: assignments } = await svc
    .from('judge_assignments')
    .select('judge_id')
    .eq('hackathon_id', id)
    .is('submission_id', null);

  const totalCriteria = criteria?.length ?? 0;
  const judgeCount = assignments?.length ?? 0;

  // Per submission: how many judges have fully scored it + weighted total
  type SubStats = { judgesWhoScored: Set<string>; finalJudges: Set<string>; weightedTotal: number; scoreCount: number };
  const subStats = new Map<string, SubStats>();
  (allScores ?? []).forEach((s: any) => {
    const cur = subStats.get(s.submission_id) ?? { judgesWhoScored: new Set(), finalJudges: new Set(), weightedTotal: 0, scoreCount: 0 };
    cur.judgesWhoScored.add(s.judge_id);
    if (s.is_final) cur.finalJudges.add(s.judge_id);
    cur.weightedTotal += Number(s.score);
    cur.scoreCount++;
    subStats.set(s.submission_id, cur);
  });

  const list = submissions ?? [];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        <strong>{list.length}</strong> submitted project{list.length === 1 ? '' : 's'} &nbsp;·&nbsp;
        <strong>{judgeCount}</strong> judge{judgeCount === 1 ? '' : 's'} &nbsp;·&nbsp;
        <strong>{totalCriteria}</strong> criteria each
      </Card>

      {list.length === 0 ? (
        <EmptyState title="No projects to score yet" body="Submissions will appear here as teams submit." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Submission</Th>
              <Th>Team</Th>
              <Th>Judges scored</Th>
              <Th>Finalized</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {list.map((s: any) => {
              const stats = subStats.get(s.id);
              const scored = stats?.judgesWhoScored.size ?? 0;
              const finalized = stats?.finalJudges.size ?? 0;
              const allFinalized = judgeCount > 0 && finalized >= judgeCount;
              return (
                <Tr key={s.id}>
                  <Td><strong>{s.title}</strong></Td>
                  <Td>{Array.isArray(s.teams) ? (s.teams[0]?.name ?? '—') : (s.teams?.name ?? '—')}</Td>
                  <Td>
                    <Badge tone={scored === judgeCount && judgeCount > 0 ? 'success' : scored > 0 ? 'info' : 'neutral'}>
                      {scored} / {judgeCount}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={allFinalized ? 'success' : finalized > 0 ? 'info' : 'neutral'}>
                      {finalized} / {judgeCount}
                    </Badge>
                  </Td>
                  <Td>
                    <Link href={`/dashboard/hackathons/${id}/scoring/${s.id}`} style={{ fontWeight: 700, color: 'var(--color-primary-pressed)' }}>
                      View scores →
                    </Link>
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
