import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as {
      hackathonId: string;
      email: string;
      fullName: string;
      phone?: string | null;
      organizationOrCompany?: string | null;
      majorOrJobTitle?: string | null;
      preferredTrackId?: string | null;
      teamPreference?: string | null;
    };

    if (!input?.email || !input?.fullName || !input?.hackathonId) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const svc = createSupabaseServiceClient();
    const email = input.email.trim().toLowerCase();

    const { data: existing } = await svc
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "We couldn't find an account with that email. Switch to 'I'm new here' and we'll create one.",
        },
        { status: 404 },
      );
    }

    const { error: regErr } = await svc.from('registrations').insert({
      hackathon_id: input.hackathonId,
      user_id: existing.id,
      full_name: input.fullName,
      email,
      phone: input.phone ?? null,
      organization_or_company: input.organizationOrCompany ?? null,
      major_or_job_title: input.majorOrJobTitle ?? null,
      preferred_track_id: input.preferredTrackId ?? null,
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
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown server error' },
      { status: 500 },
    );
  }
}
