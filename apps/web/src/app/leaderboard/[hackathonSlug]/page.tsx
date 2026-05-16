import { notFound } from 'next/navigation';
import {
  Badge,
  Card,
  Container,
  Display,
  Eyebrow,
  Hero,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@/components/ui';
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
      <main>
        <Hero tone="cream">
          <Eyebrow>Stay tuned</Eyebrow>
          <Display>{hackathon.title}</Display>
        </Hero>
        <Container size="form">
          <Card tone="cream" style={{ marginTop: 'var(--space-8)' }}>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              The leaderboard hasn&apos;t been published yet. Check back after the organizers announce
              results.
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

  const winners = (rows ?? []).slice(0, 3);

  return (
    <main>
      <Hero tone="sunrise">
        <Eyebrow light>Final results</Eyebrow>
        <Display light>{hackathon.title}</Display>
        <p style={{ color: 'rgba(255,255,255,0.95)', marginTop: 'var(--space-3)' }}>
          Congratulations to every team that shipped 🎉
        </p>
      </Hero>

      <Container>
        {/* Podium */}
        {winners.length > 0 ? (
          <section
            style={{
              marginTop: 'var(--space-8)',
              display: 'grid',
              gap: 'var(--space-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            {winners.map((r: any, i) => {
              const tone = (['cream', 'peach', 'sky'] as const)[i];
              const medal = ['🥇', '🥈', '🥉'][i];
              return (
                <Card key={r.submissions?.title} tone={tone}>
                  <div style={{ fontSize: 36 }}>{medal}</div>
                  <p style={{ fontSize: 'var(--font-size-h3)', fontWeight: 800, margin: '8px 0 4px' }}>
                    {r.submissions?.title}
                  </p>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                    {r.submissions?.teams?.name ?? '—'}
                  </p>
                  <p style={{ marginTop: 'var(--space-3)', fontWeight: 700 }}>
                    Score: {Number(r.total_score).toFixed(2)}
                  </p>
                </Card>
              );
            })}
          </section>
        ) : null}

        <section style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Full leaderboard
          </h2>
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
        </section>
      </Container>
    </main>
  );
}
