import { notFound } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { JudgePanelLayout } from '@/components/judge/JudgePanelLayout';

export const dynamic = 'force-dynamic';

export default async function JudgeAliasPage({
  params,
}: {
  params: Promise<{ hackathonSlug: string; judgeAlias: string }>;
}) {
  const { hackathonSlug, judgeAlias } = await params;

  const match = /^judge(\d+)$/i.exec(judgeAlias);
  if (!match) notFound();
  const judgeN = parseInt(match[1]!, 10);
  if (judgeN < 1) notFound();

  const svc = createSupabaseServiceClient();

  const { data: hackathon } = await svc
    .from('hackathons')
    .select('id, title, score_min, score_max, organizations(name, logo_url)')
    .eq('slug', hackathonSlug)
    .maybeSingle();
  if (!hackathon) notFound();

  const { data: assignments } = await svc
    .from('judge_assignments')
    .select('id, judge_id')
    .eq('hackathon_id', hackathon.id)
    .is('submission_id', null)
    .order('created_at', { ascending: true });

  const assignment = (assignments ?? [])[judgeN - 1];
  if (!assignment) notFound();

  const { data: judgeProfile } = await svc
    .from('profiles')
    .select('full_name, email')
    .eq('id', assignment.judge_id)
    .maybeSingle();

  const { data: teams } = await svc
    .from('teams')
    .select('id, name')
    .eq('hackathon_id', hackathon.id)
    .order('name', { ascending: true });

  const { data: subs } = await svc
    .from('submissions')
    .select('id, title, status, team_id')
    .eq('hackathon_id', hackathon.id);

  const { data: criteria } = await svc
    .from('judging_criteria')
    .select('id')
    .eq('hackathon_id', hackathon.id);

  const { data: myScores } = await svc
    .from('scores')
    .select('submission_id, criteria_id, is_final')
    .eq('hackathon_id', hackathon.id)
    .eq('judge_id', assignment.judge_id);

  const org = (hackathon as any).organizations as { name: string; logo_url: string | null } | null;
  const judgeLabel =
    judgeProfile?.full_name && judgeProfile.full_name !== judgeProfile.email
      ? judgeProfile.full_name
      : judgeProfile?.email ?? `Judge ${judgeN}`;
  const firstName = judgeLabel.split(/[\s@]/)[0] ?? judgeLabel;

  const subByTeam = new Map((subs ?? []).map((s: any) => [s.team_id, s]));
  const totalCriteria = criteria?.length ?? 0;

  const scoresBySubmission = new Map<string, { count: number; finalized: boolean }>();
  (myScores ?? []).forEach((s: any) => {
    const cur = scoresBySubmission.get(s.submission_id) ?? { count: 0, finalized: false };
    cur.count++;
    if (s.is_final) cur.finalized = true;
    scoresBySubmission.set(s.submission_id, cur);
  });

  return (
    <JudgePanelLayout
      orgName={org?.name ?? null}
      hackathonTitle={hackathon.title}
      judgeLabel={judgeLabel}
      judgeNumber={judgeN}
      firstName={firstName}
      teams={teams ?? []}
      subByTeam={subByTeam}
      totalCriteria={totalCriteria}
      scoresBySubmission={scoresBySubmission}
      basePath={`/${hackathonSlug}/${judgeAlias}`}
    />
  );
}
