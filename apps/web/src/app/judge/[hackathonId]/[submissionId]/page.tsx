import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Icon } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
// Reuse the existing ScoreForm from the organizer-side scoring page
import { ScoreForm } from '../../../dashboard/hackathons/[id]/scoring/[submissionId]/ScoreForm';

export default async function JudgeScorePage({
  params,
}: {
  params: Promise<{ hackathonId: string; submissionId: string }>;
}) {
  const { hackathonId, submissionId } = await params;
  const { supabase, user } = await getCurrentUserOrRedirect();

  const { data: subRaw } = await supabase
    .from('submissions')
    .select('id, title, description, github_url, demo_url, video_url, ai_summary, teams(name)')
    .eq('id', submissionId)
    .eq('hackathon_id', hackathonId)
    .maybeSingle();
  if (!subRaw) notFound();
  const sub = subRaw as unknown as {
    id: string;
    title: string;
    description: string | null;
    github_url: string | null;
    demo_url: string | null;
    video_url: string | null;
    ai_summary: string | null;
    teams: { name: string } | null;
  };

  // Lazy-generate AI summary on first view
  if (!sub.ai_summary) {
    try {
      const { summarizeSubmission } = await import('@/lib/summarize');
      const s = await summarizeSubmission(submissionId);
      if (s) sub.ai_summary = s;
    } catch {}
  }

  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('id, name, description, weight')
    .eq('hackathon_id', hackathonId)
    .order('sort_order', { ascending: true });

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('score_min, score_max')
    .eq('id', hackathonId)
    .maybeSingle();

  const { data: myScores } = await supabase
    .from('scores')
    .select('criteria_id, score, comment, is_final')
    .eq('hackathon_id', hackathonId)
    .eq('submission_id', submissionId)
    .eq('judge_id', user.id);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Link
        href={`/judge/${hackathonId}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-caption)', fontWeight: 800, color: 'var(--color-primary-pressed)' }}
      >
        <Icon.ArrowLeft size={14} /> All submissions
      </Link>

      {sub.ai_summary ? (
        <Card tone="cream">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon.Sparkles size={18} />
            <strong style={{ fontSize: 'var(--font-size-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI summary for judges
            </strong>
          </div>
          <p style={{ margin: 0, lineHeight: 1.55 }}>{sub.ai_summary}</p>
        </Card>
      ) : null}

      <Card>
        <h2 style={{ margin: '0 0 12px', fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>{sub.title}</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Team: {sub.teams?.name ?? '—'}</p>
        {sub.description ? (
          <p style={{ whiteSpace: 'pre-wrap', marginTop: 'var(--space-3)' }}>{sub.description}</p>
        ) : null}
        <p style={{ marginTop: 'var(--space-3)' }}>
          {sub.github_url ? <a href={sub.github_url} target="_blank" rel="noreferrer">GitHub ↗</a> : null}
          {sub.demo_url ? <>  ·  <a href={sub.demo_url} target="_blank" rel="noreferrer">Demo ↗</a></> : null}
          {sub.video_url ? <>  ·  <a href={sub.video_url} target="_blank" rel="noreferrer">Video ↗</a></> : null}
        </p>
      </Card>

      <ScoreForm
        hackathonId={hackathonId}
        submissionId={submissionId}
        criteria={criteria ?? []}
        existing={myScores ?? []}
        scoreMin={hackathon?.score_min ?? 1}
        scoreMax={hackathon?.score_max ?? 5}
      />
    </div>
  );
}
