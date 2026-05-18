import { notFound } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { TokenScorePanel } from '../judge/[token]/TokenScorePanel';

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

  const { data: rawSubs } = await svc
    .from('submissions')
    .select('id, title, description, github_url, demo_url, video_url, teams(name)')
    .eq('hackathon_id', hackathon.id)
    .in('status', ['submitted', 'locked'])
    .order('created_at', { ascending: true });

  const { data: criteria } = await svc
    .from('judging_criteria')
    .select('id, name, description, weight')
    .eq('hackathon_id', hackathon.id)
    .order('sort_order', { ascending: true });

  const { data: existingScores } = await svc
    .from('scores')
    .select('submission_id, criteria_id, score, comment, is_final')
    .eq('hackathon_id', hackathon.id)
    .eq('judge_id', assignment.judge_id);

  const org = (hackathon as any).organizations as { name: string; logo_url: string | null } | null;
  const submissions = (rawSubs ?? []).map((s: any) => ({
    id: s.id as string,
    title: s.title as string,
    description: s.description as string | null,
    github_url: s.github_url as string | null,
    demo_url: s.demo_url as string | null,
    video_url: s.video_url as string | null,
    teams: Array.isArray(s.teams) ? (s.teams[0] ?? null) : s.teams,
  }));

  const judgeLabel =
    judgeProfile?.full_name && judgeProfile.full_name !== judgeProfile.email
      ? judgeProfile.full_name
      : judgeProfile?.email ?? `Judge ${judgeN}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #FF9D4D 0%, #E96F26 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 512 512" fill="none" aria-hidden>
              <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="#fff" />
              <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="#fff" />
              <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="#fff" strokeWidth="68" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            {org?.name && (
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>
                {org.name}
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', lineHeight: org?.name ? 1.3 : 1 }}>
              {hackathon.title}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', lineHeight: 1 }}>
              Judging Interface
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginTop: 3, lineHeight: 1 }}>
              {judgeLabel}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,138,61,0.12)',
            color: 'var(--color-primary-pressed)',
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 800,
          }}>
            Judge {judgeN}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 20px 100px' }}>
        {submissions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '100px 0',
            background: '#fff', borderRadius: 24,
            boxShadow: '0 2px 24px rgba(43,43,43,0.07)',
          }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px' }}>No submissions yet</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>
              Teams haven&apos;t submitted their projects yet. Check back later.
            </p>
          </div>
        ) : (
          <TokenScorePanel
            assignmentId={assignment.id}
            submissions={submissions}
            criteria={criteria ?? []}
            existingScores={existingScores ?? []}
            scoreMin={hackathon.score_min ?? 1}
            scoreMax={hackathon.score_max ?? 5}
          />
        )}
      </main>
    </div>
  );
}
