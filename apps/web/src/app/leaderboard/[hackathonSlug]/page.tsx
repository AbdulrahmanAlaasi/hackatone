import { notFound } from 'next/navigation';
import { Badge, Card, Container, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PublicLeaderboardPage({
  params,
}: {
  params: Promise<{ hackathonSlug: string }>;
}) {
  const { hackathonSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, slug, leaderboard_published')
    .eq('slug', hackathonSlug)
    .maybeSingle();
  if (!hackathon) notFound();

  if (!hackathon.leaderboard_published) {
    return (
      <main style={{ padding: '64px 0' }}>
        <Container size="form">
          <Card tone="soft">
            <h1 style={{ marginTop: 0, fontSize: 'var(--font-size-h1)' }}>{hackathon.title}</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              The leaderboard hasn&apos;t been published yet. Check back after the organizers announce results.
            </p>
          </Card>
        </Container>
      </main>
    );
  }

  const { data: rows } = await supabase
    .from('leaderboard_results')
    .select('rank, total_score, impact_score, is_winner, submissions(title, teams(name))')
    .eq('hackathon_id', hackathon.id)
    .order('rank', { ascending: true });

  return (
    <main style={{ padding: '48px 0' }}>
      <Container>
        <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          {hackathon.title}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>Final leaderboard.</p>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Table>
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Project</Th>
                <Th>Team</Th>
                <Th>Score</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {(rows ?? []).map((r: any) => (
                <Tr key={r.submissions?.title}>
                  <Td><strong>{r.rank}</strong></Td>
                  <Td>{r.submissions?.title}</Td>
                  <Td>{r.submissions?.teams?.name ?? '—'}</Td>
                  <Td>{Number(r.total_score).toFixed(2)}</Td>
                  <Td>{r.is_winner ? <Badge tone="primary">Winner</Badge> : null}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </Container>
    </main>
  );
}
