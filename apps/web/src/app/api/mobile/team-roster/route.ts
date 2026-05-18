import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'edge';

type RegistrationRow = {
  user_id: string | null;
  full_name: string | null;
  email: string | null;
};

type MemberRow = {
  user_id: string;
  role: string;
  profiles: { full_name: string | null; email: string | null } | Array<{ full_name: string | null; email: string | null }> | null;
};

function profileFromRelation(value: MemberRow['profiles']) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const { hackathonId } = (await req.json()) as { hackathonId?: string };
    if (!token || !hackathonId) {
      return NextResponse.json({ ok: false, error: 'Missing token or hackathonId' }, { status: 400 });
    }

    const svc = createSupabaseServiceClient();
    const { data: authData, error: authError } = await svc.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: mine } = await svc
      .from('team_members')
      .select('team_id, teams(id, name, join_code)')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', authData.user.id)
      .maybeSingle();

    const team = (mine as any)?.teams ?? null;
    const teamId = (mine as any)?.team_id as string | undefined;
    if (!teamId || !team) {
      return NextResponse.json({ ok: true, team: null, members: [] });
    }

    const [{ data: memberRows }, { data: registrationRows }] = await Promise.all([
      svc
        .from('team_members')
        .select('user_id, role, profiles(full_name, email)')
        .eq('team_id', teamId)
        .order('role', { ascending: true }),
      svc
        .from('registrations')
        .select('user_id, full_name, email')
        .eq('hackathon_id', hackathonId),
    ]);

    const registrationsByUser = new Map(
      ((registrationRows ?? []) as RegistrationRow[])
        .filter((row) => row.user_id)
        .map((row) => [row.user_id as string, row]),
    );

    const members = ((memberRows ?? []) as unknown as MemberRow[]).map((member) => {
      const registration = registrationsByUser.get(member.user_id);
      const profile = profileFromRelation(member.profiles);
      return {
        user_id: member.user_id,
        role: member.role,
        full_name: profile?.full_name ?? registration?.full_name ?? 'Team member',
        email: profile?.email ?? registration?.email ?? '',
      };
    });

    return NextResponse.json({ ok: true, team, members });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown server error' },
      { status: 500 },
    );
  }
}
