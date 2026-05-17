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
    const { hackathonId, teams } = await req.json() as {
      hackathonId: string;
      teams: TeamSpec[];
    };

    const { user } = await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    let created = 0;
    let lastError: string | null = null;

    for (const t of teams) {
      if (t.memberUserIds.length === 0) continue;

      // Skip users already on a team in this hackathon
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
        .insert({ hackathon_id: hackathonId, name: t.name, created_by: user.id })
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

    if (created === 0 && lastError) {
      return NextResponse.json({ ok: false, error: lastError }, { status: 400 });
    }
    return NextResponse.json({ ok: true, created });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
