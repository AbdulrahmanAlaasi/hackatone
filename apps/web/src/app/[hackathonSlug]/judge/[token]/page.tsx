import { notFound } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { TokenScorePanel } from './TokenScorePanel';

export const dynamic = 'force-dynamic';

export default async function JudgeAccessPage({
  params,
}: {
  params: Promise<{ hackathonSlug: string; token: string }>;
}) {
  const { hackathonSlug, token } = await params;
  const svc = createSupabaseServiceClient();

  // Resolve hackathon by slug
  const { data: hackathon } = await svc
    .from('hackathons')
    .select('id, title, score_min, score_max, organizations(name, logo_url)')
    .eq('slug', hackathonSlug)
    .maybeSingle();
  if (!hackathon) notFound();

  // Validate judge token (assignment ID)
  const { data: assignment } = await svc
    .from('judge_assignments')
    .select('id, judge_id')
    .eq('id', token)
    .eq('hackathon_id', hackathon.id)
    .is('submission_id', null)
    .maybeSingle();
  if (!assignment) notFound();

  // Judge profile (for display only)
  const { data: judgeProfile } = await svc
    .from('profiles')
    .select('full_name, email')
    .eq('id', assignment.judge_id)
    .maybeSingle();

  // All submitted/locked submissions with team info
  const { data: rawSubs } = await svc
    .from('submissions')
    .select('id, title, description, github_url, demo_url, video_url, teams(name)')
    .eq('hackathon_id', hackathon.id)
    .in('status', ['submitted', 'locked'])
    .order('created_at', { ascending: true });

  // Judging criteria ordered by sort_order
  const { data: criteria } = await svc
    .from('judging_criteria')
    .select('id, name, description, weight')
    .eq('hackathon_id', hackathon.id)
    .order('sort_order', { ascending: true });

  // Existing scores by this judge
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
  })) as Array<{
    id: string;
    title: string;
    description: string | null;
    github_url: string | null;
    demo_url: string | null;
    video_url: string | null;
    teams: { name: string } | null;
  }>;

  const judgeLabel =
    judgeProfile?.full_name && judgeProfile.full_name !== judgeProfile.email
      ? judgeProfile.full_name
      : judgeProfile?.email ?? 'Judge';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sticky header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="30" height="30" viewBox="0 0 512 512" fill="none" aria-hidden>
            <defs>
              <linearGradient id="jat-g" x1="120" y1="120" x2="390" y2="395" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FF9D4D" />
                <stop offset="1" stopColor="#E96F26" />
              </linearGradient>
            </defs>
            <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="url(#jat-g)" />
            <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="url(#jat-g)" />
            <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="url(#jat-g)" strokeWidth="68" strokeLinecap="round" />
          </svg>
          <div>
            {org?.name && (
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary-pressed)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {org.name}
              </div>
            )}
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
              {hackathon.title}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
            Judging Interface
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {judgeLabel}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 18, fontWeight: 700 }}>No submissions yet</p>
            <p style={{ fontSize: 14 }}>Teams haven&apos;t submitted their projects yet. Check back later.</p>
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
