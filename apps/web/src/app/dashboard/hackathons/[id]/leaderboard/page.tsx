import { Badge, Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { PublishButton } from './PublishButton';

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, slug, leaderboard_published')
    .eq('id', params.id)
    .maybeSingle();

  const { data: rows } = await supabase
    .from('leaderboard_results')
    .select('rank, total_score, impact_score, is_winner, submissions(id, title, teams(name))')
    .eq('hackathon_id', params.id)
    .order('rank', { ascending: true });

  const list = rows ?? [];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone={hackathon?.leaderboard_published ? 'soft' : 'info'}>
        {hackathon?.leaderboard_published ? (
          <>
            Leaderboard is <strong>published</strong>. Participants and the public can see it.
          </>
        ) : (
          <>
            Leaderboard is <strong>hidden</strong>. Recompute and publish when judging is done.
          </>
        )}
      </Card>

      <PublishButton hackathonId={params.id} published={!!hackathon?.leaderboard_published} slug={hackathon?.slug ?? ''} />

      {list.length === 0 ? (
        <EmptyState
          title="No results yet"
          body='Once judges submit final scores, click "Recompute & publish".'
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Project</Th>
              <Th>Team</Th>
              <Th>Total</Th>
              <Th>Impact</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {list.map((r: any) => (
              <Tr key={r.submissions?.id}>
                <Td><strong>{r.rank}</strong></Td>
                <Td>{r.submissions?.title ?? '—'}</Td>
                <Td>{r.submissions?.teams?.name ?? '—'}</Td>
                <Td>{Number(r.total_score).toFixed(2)}</Td>
                <Td>{r.impact_score == null ? '—' : Number(r.impact_score).toFixed(2)}</Td>
                <Td>{r.is_winner ? <Badge tone="primary">Winner</Badge> : null}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
