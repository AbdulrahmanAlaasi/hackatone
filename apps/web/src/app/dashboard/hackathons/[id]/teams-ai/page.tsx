import { Badge, Card, EmptyState } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
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
  const { supabase } = await getCurrentUserOrRedirect();

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, min_team_size, max_team_size')
    .eq('id', id)
    .maybeSingle();

  const { data: rows } = await supabase
    .from('registrations')
    .select('id, user_id, full_name, email, profiles(ai_level, ai_skills, ai_strengths, ai_summary, ai_analyzed_at)')
    .eq('hackathon_id', id)
    .eq('status', 'accepted')
    .not('user_id', 'is', null);

  const participants: AcceptedParticipant[] = (rows ?? []).map((r: any) => ({
    registration_id: r.id,
    user_id: r.user_id,
    full_name: r.full_name,
    email: r.email,
    ai_level: r.profiles?.ai_level ?? null,
    ai_skills: r.profiles?.ai_skills ?? [],
    ai_strengths: r.profiles?.ai_strengths ?? [],
    ai_summary: r.profiles?.ai_summary ?? null,
    ai_analyzed_at: r.profiles?.ai_analyzed_at ?? null,
  }));

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
