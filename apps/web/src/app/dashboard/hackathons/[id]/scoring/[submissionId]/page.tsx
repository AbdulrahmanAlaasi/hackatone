import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, Icon } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export default async function ScoreSubmissionPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = await params;
  await getCurrentUserOrRedirect();
  const svc = createSupabaseServiceClient();

  const { data: subRaw } = await svc
    .from('submissions')
    .select('id, title, description, github_url, demo_url, video_url, ai_summary, teams(name)')
    .eq('id', submissionId)
    .eq('hackathon_id', id)
    .maybeSingle();
  if (!subRaw) notFound();

  const sub = subRaw as any;
  const teamName = Array.isArray(sub.teams) ? (sub.teams[0]?.name ?? '—') : (sub.teams?.name ?? '—');

  // AI summary (cached)
  if (!sub.ai_summary) {
    try {
      const { summarizeSubmission } = await import('@/lib/summarize');
      const s = await summarizeSubmission(submissionId);
      if (s) sub.ai_summary = s;
    } catch {
      /* ignore */
    }
  }

  const { data: criteria } = await svc
    .from('judging_criteria')
    .select('id, name, description, weight')
    .eq('hackathon_id', id)
    .order('sort_order', { ascending: true });

  const { data: hackathon } = await svc
    .from('hackathons')
    .select('score_min, score_max')
    .eq('id', id)
    .maybeSingle();

  // All assignments (to know judge order and names)
  const { data: assignments } = await svc
    .from('judge_assignments')
    .select('id, judge_id')
    .eq('hackathon_id', id)
    .is('submission_id', null)
    .order('created_at', { ascending: true });

  const judgeIds = (assignments ?? []).map((a: any) => a.judge_id as string);

  const { data: profiles } = judgeIds.length
    ? await svc.from('profiles').select('id, full_name, email').in('id', judgeIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // All final scores for this submission
  const { data: allScores } = await svc
    .from('scores')
    .select('judge_id, criteria_id, score, comment, is_final')
    .eq('hackathon_id', id)
    .eq('submission_id', submissionId);

  // scoreMap[judgeId][criteriaId] = { score, comment, is_final }
  type ScoreEntry = { score: number; comment: string | null; is_final: boolean };
  const scoreMap = new Map<string, Map<string, ScoreEntry>>();
  (allScores ?? []).forEach((s: any) => {
    if (!scoreMap.has(s.judge_id)) scoreMap.set(s.judge_id, new Map());
    scoreMap.get(s.judge_id)!.set(s.criteria_id, { score: s.score, comment: s.comment, is_final: s.is_final });
  });

  const criList = criteria ?? [];
  const scoreMin = hackathon?.score_max ?? 1;
  const scoreMax = hackathon?.score_max ?? 5;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {sub.ai_summary ? (
        <Card tone="cream">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon.Sparkles size={18} />
            <strong style={{ fontSize: 'var(--font-size-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI summary
            </strong>
          </div>
          <p style={{ margin: 0, lineHeight: 1.55 }}>{sub.ai_summary}</p>
        </Card>
      ) : null}

      <Card>
        <Link href={`/dashboard/hackathons/${id}/scoring`} style={{ fontSize: 'var(--font-size-caption)' }}>
          ← All submissions
        </Link>
        <h2 style={{ margin: '8px 0 4px', fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>{sub.title}</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '0 0 12px' }}>Team: {teamName}</p>
        {sub.description ? <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>{sub.description}</p> : null}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {sub.github_url ? <a href={sub.github_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--color-primary-pressed)' }}>GitHub ↗</a> : null}
          {sub.demo_url ? <a href={sub.demo_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--color-primary-pressed)' }}>Demo ↗</a> : null}
          {sub.video_url ? <a href={sub.video_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--color-primary-pressed)' }}>Video ↗</a> : null}
        </div>
      </Card>

      {judgeIds.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No judges assigned to this hackathon yet.</p>
        </Card>
      ) : criList.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No judging criteria defined yet.</p>
        </Card>
      ) : (
        <Card>
          <h3 style={{ marginTop: 0, fontWeight: 800, fontSize: 'var(--font-size-h3)' }}>
            Judge scores (range {scoreMin}–{scoreMax})
          </h3>

          {/* Grid: rows = judges, columns = criteria */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border)', fontWeight: 800, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                    Judge
                  </th>
                  {criList.map((c: any) => (
                    <th key={c.id} style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '2px solid var(--color-border)', fontWeight: 800, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {c.name}
                      <div style={{ fontWeight: 400, fontSize: 11, color: 'var(--color-text-muted)' }}>×{c.weight}</div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '2px solid var(--color-border)', fontWeight: 800, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {(assignments ?? []).map((a: any, idx: number) => {
                  const profile = profileMap.get(a.judge_id);
                  const judgeLabel = profile?.full_name && profile.full_name !== profile.email
                    ? profile.full_name
                    : profile?.email ?? `Judge ${idx + 1}`;
                  const judgeScores = scoreMap.get(a.judge_id);
                  const allFinal = criList.every((c: any) => judgeScores?.get(c.id)?.is_final);
                  const anyScore = criList.some((c: any) => judgeScores?.has(c.id));

                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        <div>{judgeLabel}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 400 }}>Judge {idx + 1}</div>
                      </td>
                      {criList.map((c: any) => {
                        const entry = judgeScores?.get(c.id);
                        return (
                          <td key={c.id} style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {entry ? (
                              <div>
                                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-pressed)' }}>
                                  {entry.score}
                                </span>
                                {entry.comment && (
                                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, maxWidth: 120, wordBreak: 'break-word' }}>
                                    {entry.comment}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>—</span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {allFinal && anyScore
                          ? <Badge tone="success">Final</Badge>
                          : anyScore
                          ? <Badge tone="info">Draft</Badge>
                          : <Badge tone="neutral">Pending</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--color-surface-soft)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, fontSize: 13 }}>Average</td>
                  {criList.map((c: any) => {
                    const vals = (allScores ?? [])
                      .filter((s: any) => s.criteria_id === c.id)
                      .map((s: any) => Number(s.score));
                    const avg = vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : null;
                    return (
                      <td key={c.id} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800 }}>
                        {avg != null ? avg.toFixed(1) : '—'}
                      </td>
                    );
                  })}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
