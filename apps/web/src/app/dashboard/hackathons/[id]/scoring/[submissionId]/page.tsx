import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { ScoreForm } from './ScoreForm';

export default async function ScoreSubmissionPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = await params;
  const { supabase, user } = await getCurrentUserOrRedirect();

  const { data: sub } = await supabase
    .from('submissions')
    .select('id, title, description, github_url, demo_url, video_url, teams(name)')
    .eq('id', submissionId)
    .eq('hackathon_id', id)
    .maybeSingle();
  if (!sub) notFound();

  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('id, name, description, weight')
    .eq('hackathon_id', id)
    .order('sort_order', { ascending: true });

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('score_min, score_max')
    .eq('id', id)
    .maybeSingle();

  const { data: myScores } = await supabase
    .from('scores')
    .select('criteria_id, score, comment, is_final')
    .eq('hackathon_id', id)
    .eq('submission_id', submissionId)
    .eq('judge_id', user.id);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <Link
          href={`/dashboard/hackathons/${id}/scoring`}
          style={{ fontSize: 'var(--font-size-caption)' }}
        >
          ← All submissions
        </Link>
        <h2 style={{ margin: '8px 0 12px', fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>{sub.title}</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Team: {(sub.teams as any)?.name ?? '—'}</p>
        {sub.description ? <p style={{ whiteSpace: 'pre-wrap' }}>{sub.description}</p> : null}
        <p style={{ marginTop: 'var(--space-3)' }}>
          {sub.github_url ? <a href={sub.github_url} target="_blank" rel="noreferrer">GitHub ↗</a> : null}
          {sub.demo_url ? <>  ·  <a href={sub.demo_url} target="_blank" rel="noreferrer">Demo ↗</a></> : null}
          {sub.video_url ? <>  ·  <a href={sub.video_url} target="_blank" rel="noreferrer">Video ↗</a></> : null}
        </p>
      </Card>

      <ScoreForm
        hackathonId={id}
        submissionId={submissionId}
        criteria={criteria ?? []}
        existing={myScores ?? []}
        scoreMin={hackathon?.score_min ?? 1}
        scoreMax={hackathon?.score_max ?? 5}
      />
    </div>
  );
}
