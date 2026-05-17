import { Badge, Card, EmptyState } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { TeamBalancerPanel } from './TeamBalancerPanel';

interface AcceptedParticipant {
  registration_id: string;
  user_id: string;
  full_name: string;
  email: string;
  ai_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  ai_skills: string[];
  ai_strengths: string[];
  ai_summary: string | null;
  ai_analyzed_at: string | null;
}

export default async function AiTeamsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getCurrentUserOrRedirect();
  const svc = createSupabaseServiceClient();

  const { data: hackathon } = await svc
    .from('hackathons')
    .select('id, min_team_size, max_team_size')
    .eq('id', id)
    .maybeSingle();

  // Step 1: fetch accepted registrations that have a linked user account
  const { data: regs } = await svc
    .from('registrations')
    .select('id, user_id, full_name, email')
    .eq('hackathon_id', id)
    .eq('status', 'accepted')
    .not('user_id', 'is', null);

  const regList = regs ?? [];

  // Step 2: fetch AI profile data separately for those user ids
  const userIds = regList.map((r: any) => r.user_id as string);
  let profileMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await svc
      .from('profiles')
      .select('id, ai_level, ai_skills, ai_strengths, ai_summary, ai_analyzed_at')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = p;
    }
  }

  const participants: AcceptedParticipant[] = regList.map((r: any) => {
    const p = profileMap[r.user_id] ?? {};
    return {
      registration_id: r.id,
      user_id: r.user_id,
      full_name: r.full_name,
      email: r.email,
      ai_level: p.ai_level ?? null,
      ai_skills: p.ai_skills ?? [],
      ai_strengths: p.ai_strengths ?? [],
      ai_summary: p.ai_summary ?? null,
      ai_analyzed_at: p.ai_analyzed_at ?? null,
    };
  });

  const analyzed = participants.filter((p) => p.ai_level).length;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        <strong>{participants.length}</strong> accepted participant{participants.length === 1 ? '' : 's'} ·{' '}
        <strong>{analyzed}</strong> have AI-analyzed CVs.
      </Card>

      {participants.length === 0 ? (
        <EmptyState
          title="No accepted participants yet"
          body="Once you accept some, this page will let the AI suggest balanced teams from their CVs."
        />
      ) : (
        <TeamBalancerPanel
          hackathonId={id}
          minSize={hackathon?.min_team_size ?? 2}
          maxSize={hackathon?.max_team_size ?? 5}
          participants={participants}
        />
      )}

      <Card tone="info">
        <strong>How balancing works:</strong> participants are sorted by AI-extracted level
        (expert → beginner), then snake-drafted into teams so every team gets a mix. Participants
        without CV analysis are spread evenly at the end. Click <Badge tone="primary">Apply</Badge>{' '}
        to actually create the teams.
      </Card>
    </div>
  );
}
