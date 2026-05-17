import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Badge,
  Card,
  EmptyState,
  Eyebrow,
  Icon,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export default async function JudgeHackathonPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await params;
  const { supabase, user } = await getCurrentUserOrRedirect();

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, organizations(name, logo_url)')
    .eq('id', hackathonId)
    .maybeSingle();
  if (!hackathon) notFound();

  // Submissions in this hackathon
  const { data: subs } = await supabase
    .from('submissions')
    .select('id, title, status, teams(name)')
    .eq('hackathon_id', hackathonId)
    .in('status', ['submitted', 'locked']);

  // What criteria exist + how many I've scored per submission
  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('id')
    .eq('hackathon_id', hackathonId);
  const totalCriteria = criteria?.length ?? 0;

  const { data: myScores } = await supabase
    .from('scores')
    .select('submission_id, criteria_id, is_final')
    .eq('hackathon_id', hackathonId)
    .eq('judge_id', user.id);

  const doneFinalBySub = new Map<string, number>();
  for (const s of myScores ?? []) {
    if (s.is_final) {
      doneFinalBySub.set(s.submission_id, (doneFinalBySub.get(s.submission_id) ?? 0) + 1);
    }
  }

  const list = (subs ?? []) as unknown as Array<{ id: string; title: string; status: string; teams: { name: string } | null }>;
  const completed = list.filter((s) => (doneFinalBySub.get(s.id) ?? 0) >= totalCriteria && totalCriteria > 0).length;

  const org = (hackathon as any).organizations as { name: string; logo_url: string | null } | null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <Link
        href="/judge"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-caption)', fontWeight: 800, color: 'var(--color-primary-pressed)' }}
      >
        <Icon.ArrowLeft size={14} /> All hackathons
      </Link>

      <div>
        {org ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {org.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo_url} alt={org.name} style={{ width: 28, height: 28, borderRadius: 8 }} />
            ) : null}
            <span style={{ fontSize: 'var(--font-size-caption)', fontWeight: 800, color: 'var(--color-primary-pressed)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {org.name}
            </span>
          </div>
        ) : null}
        <Eyebrow>Hackathon</Eyebrow>
        <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 800, margin: '4px 0 0' }}>{hackathon.title}</h1>
      </div>

      <Card tone="cream">
        Scored <strong>{completed}</strong> of <strong>{list.length}</strong> submissions with all {totalCriteria} criteria.
      </Card>

      {list.length === 0 ? (
        <EmptyState title="Nothing to score yet" body="Submissions will appear here as teams submit." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Project</Th>
              <Th>Team</Th>
              <Th>Your progress</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {list.map((s) => {
              const done = doneFinalBySub.get(s.id) ?? 0;
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
                    <Link href={`/judge/${hackathonId}/${s.id}`} style={{ fontWeight: 800, color: 'var(--color-primary-pressed)' }}>
                      {complete ? 'Review' : 'Score'} →
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
