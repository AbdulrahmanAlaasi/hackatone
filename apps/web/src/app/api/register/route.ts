import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'edge';

async function createAuthUser(email: string, password: string, fullName: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const r = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    return { ok: false as const, error: `auth/${r.status}: ${txt.slice(0, 200)}` };
  }
  const j = (await r.json()) as { id?: string };
  if (!j.id) return { ok: false as const, error: 'No user id returned' };
  return { ok: true as const, userId: j.id };
}

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as {
      hackathonId: string;
      fullName: string;
      email: string;
      password: string;
      phone?: string | null;
      organizationOrCompany?: string | null;
      majorOrJobTitle?: string | null;
      skillLevel?: string | null;
      skills?: string[];
      preferredTrackId?: string | null;
      githubUrl?: string | null;
      teamPreference?: string | null;
    };

    if (!input?.email || !input?.password || !input?.fullName || !input?.hackathonId) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const svc = createSupabaseServiceClient();
    const email = input.email.trim().toLowerCase();

    // Resolve or create the auth user
    let userId: string | null = null;
    const { data: existingProfile } = await svc
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      const created = await createAuthUser(email, input.password, input.fullName);
      if (!created.ok) {
        if (created.error.toLowerCase().includes('already')) {
          const { data: again } = await svc
            .from('profiles')
            .select('id')
            .ilike('email', email)
            .maybeSingle();
          userId = again?.id ?? null;
        }
        if (!userId) {
          return NextResponse.json({ ok: false, error: created.error }, { status: 400 });
        }
      } else {
        userId = created.userId;
      }
    }
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'No user id resolved' }, { status: 500 });
    }

    // Insert registration row
    const { error: regErr } = await svc.from('registrations').insert({
      hackathon_id: input.hackathonId,
      user_id: userId,
      full_name: input.fullName,
      email,
      phone: input.phone ?? null,
      organization_or_company: input.organizationOrCompany ?? null,
      major_or_job_title: input.majorOrJobTitle ?? null,
      skill_level: input.skillLevel ?? null,
      skills: input.skills ?? [],
      preferred_track_id: input.preferredTrackId ?? null,
      github_url: input.githubUrl ?? null,
      team_preference: input.teamPreference ?? null,
      status: 'pending',
    });
    if (regErr) {
      if (regErr.code === '23505') {
        return NextResponse.json(
          { ok: false, error: 'You are already registered for this hackathon.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: regErr.message }, { status: 500 });
    }

    // Best-effort profile metadata update (non-blocking)
    await svc
      .from('profiles')
      .update({
        phone: input.phone ?? null,
        organization_or_company: input.organizationOrCompany ?? null,
        major_or_job_title: input.majorOrJobTitle ?? null,
        skill_level: input.skillLevel ?? null,
        skills: input.skills ?? [],
        github_url: input.githubUrl ?? null,
      })
      .eq('id', userId);

    return NextResponse.json({ ok: true, userId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown server error' },
      { status: 500 },
    );
  }
}
