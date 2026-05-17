'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

interface TeamSpec {
  name: string;
  memberUserIds: string[];
}

/**
 * Create teams from the AI-suggested layout and assign members.
 * - Uses the service client so we can set arbitrary team_members rows.
 * - Skips users who are already on a team in this hackathon.
 */
export async function applyBalancedTeams(hackathonId: string, teams: TeamSpec[]) {
  const { user } = await getCurrentUserOrRedirect();
  const svc = createSupabaseServiceClient();

  let created = 0;
  let lastError: string | null = null;
  for (const t of teams) {
    if (t.memberUserIds.length === 0) continue;

    // Filter out anyone already on a team for this hackathon
    const { data: existing } = await svc
      .from('team_members')
      .select('user_id')
      .eq('hackathon_id', hackathonId)
      .in('user_id', t.memberUserIds);
    const taken = new Set((existing ?? []).map((r: any) => r.user_id));
    const fresh = t.memberUserIds.filter((u) => !taken.has(u));
    if (fresh.length === 0) continue;

    const { data: team, error: teamErr } = await svc
      .from('teams')
      .insert({
        hackathon_id: hackathonId,
        name: t.name,
        created_by: user.id,
      })
      .select('id')
      .single();
    if (teamErr || !team) {
      lastError = teamErr?.message ?? 'Team insert failed';
      continue;
    }

    const memberRows = fresh.map((uid, idx) => ({
      team_id: team.id,
      hackathon_id: hackathonId,
      user_id: uid,
      role: idx === 0 ? 'lead' : 'member',
    }));
    await svc.from('team_members').insert(memberRows);

    created += 1;
  }

  revalidatePath(`/dashboard/hackathons/${hackathonId}/teams-ai`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}`);
  if (created === 0 && lastError) return { ok: false as const, error: lastError };
  return { ok: true as const, created };
}
