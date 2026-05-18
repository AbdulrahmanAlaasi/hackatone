import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { TokenScorePanel } from '@/components/judge/TokenScorePanel';
import { JudgeHeader } from '@/components/judge/JudgePanelLayout';

export const dynamic = 'force-dynamic';

export default async function JudgeScoringPage({
  params,
}: {
  params: Promise<{ hackathonSlug: string; token: string; submissionId: string }>;
}) {
  const { hackathonSlug, token, submissionId } = await params;
  const svc = createSupabaseServiceClient();

  const { data: hackathon } = await svc
    .from('hackathons')
    .select('id, title, score_min, score_max, organizations(name, logo_url)')
    .eq('slug', hackathonSlug)
    .maybeSingle();
  if (!hackathon) notFound();

  const { data: assignment } = await svc
    .from('judge_assignments')
    .select('id, judge_id')
    .eq('id', token)
    .eq('hackathon_id', hackathon.id)
    .is('submission_id', null)
    .maybeSingle();
  if (!assignment) notFound();

  const { data: allAssignments } = await svc
    .from('judge_assignments')
    .select('id')
    .eq('hackathon_id', hackathon.id)
    .is('submission_id', null)
    .order('created_at', { ascending: true });
  const judgeNumber = (allAssignments ?? []).findIndex((a) => a.id === assignment.id) + 1;

  const { data: judgeProfile } = await svc
    .from('profiles')
    .select('full_name, email')
    .eq('id', assignment.judge_id)
    .maybeSingle();

  const { data: subRaw } = await svc
    .from('submissions')
    .select('id, title, description, github_url, demo_url, video_url, status, teams(name)')
    .eq('id', submissionId)
    .eq('hackathon_id', hackathon.id)
    .maybeSingle();
  if (!subRaw || !['submitted', 'locked'].includes((subRaw as any).status)) notFound();

  const { data: criteria } = await svc
    .from('judging_criteria')
    .select('id, name, description, weight')
    .eq('hackathon_id', hackathon.id)
    .order('sort_order', { ascending: true });

  const { data: existingScores } = await svc
    .from('scores')
    .select('submission_id, criteria_id, score, comment, is_final')
    .eq('hackathon_id', hackathon.id)
    .eq('judge_id', assignment.judge_id)
    .eq('submission_id', submissionId);

  const org = (hackathon as any).organizations as { name: string; logo_url: string | null } | null;
  const sub = subRaw as any;
  const submission = {
    id: sub.id as string,
    title: sub.title as string,
    description: sub.description as string | null,
    github_url: sub.github_url as string | null,
    demo_url: sub.demo_url as string | null,
    video_url: sub.video_url as string | null,
    teams: Array.isArray(sub.teams) ? (sub.teams[0] ?? null) : sub.teams,
  };

  const judgeLabel =
    judgeProfile?.full_name && judgeProfile.full_name !== judgeProfile.email
      ? judgeProfile.full_name
      : judgeProfile?.email ?? `Judge ${judgeNumber}`;

  const backHref = `/${hackathonSlug}/judge/${token}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <JudgeHeader judgeNumber={judgeNumber} judgeLabel={judgeLabel} />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 24px 100px' }}>
        <Link
          href={backHref}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: 24 }}
        >
          ← Back to judging panel
        </Link>

        <TokenScorePanel
          assignmentId={assignment.id}
          submissions={[submission]}
          criteria={criteria ?? []}
          existingScores={existingScores ?? []}
          scoreMin={hackathon.score_min ?? 1}
          scoreMax={hackathon.score_max ?? 5}
        />
      </main>
    </div>
  );
}
