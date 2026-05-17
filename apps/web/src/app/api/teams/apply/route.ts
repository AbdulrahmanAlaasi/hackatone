import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

interface TeamSpec {
  name: string;
  memberUserIds: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { hackathonId, teams, reset } = await req.json() as {
      hackathonId: string;
      teams: TeamSpec[];
      reset?: boolean;
    };

    const { user } = await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    // If reset=true, delete all existing AI-balancer-created teams for this hackathon
    // so Apply is idempotent and can be run multiple times safely.
    if (reset) {
      const { data: existingTeams } = await svc
        .from('teams')
        .select('id')
        .eq('hackathon_id', hackathonId)
        .eq('created_by', user.id);
      const ids = (existingTeams ?? []).map((t: any) => t.id);
      if (ids.length > 0) {
        await svc.from('team_members').delete().in('team_id', ids);
        await svc.from('teams').delete().in('id', ids);
      }
    }

    let created = 0;
    let lastError: string | null = null;

    for (const t of teams) {
      if (t.memberUserIds.length === 0) continue;

      const { data: team, error: teamErr } = await svc
        .from('teams')
        .insert({ hackathon_id: hackathonId, name: t.name, created_by: user.id })
        .select('id')
        .single();

      if (teamErr || !team) {
        lastError = teamErr?.message ?? 'Team insert failed';
        continue;
      }

      const memberRows = t.memberUserIds.map((uid, idx) => ({
        team_id: team.id,
        hackathon_id: hackathonId,
        user_id: uid,
        role: idx === 0 ? 'lead' : 'member',
      }));
      const { error: memberErr } = await svc.from('team_members').insert(memberRows);
      if (memberErr) {
        lastError = memberErr.message;
        // Roll back the team we just created
        await svc.from('teams').delete().eq('id', team.id);
        continue;
      }
      created += 1;
    }

    if (created === 0 && lastError) {
      return NextResponse.json({ ok: false, error: lastError }, { status: 400 });
    }
    return NextResponse.json({ ok: true, created });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
