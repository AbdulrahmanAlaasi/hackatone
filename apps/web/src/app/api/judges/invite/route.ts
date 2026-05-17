import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { hackathonId, email: rawEmail } = await req.json() as {
      hackathonId: string;
      email: string;
    };
    const email = rawEmail.trim().toLowerCase();
    if (!email || !hackathonId) {
      return NextResponse.json({ ok: false, error: 'Missing fields.' }, { status: 400 });
    }

    const { user: organizer } = await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hackatone.alaasi.dev';
    const redirectTo = `${siteUrl}/judge`;

    // Check if this email is already a judge for this hackathon
    const { data: existingProfile } = await svc
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existingProfile?.id) {
      const { data: alreadyAssigned } = await svc
        .from('judge_assignments')
        .select('id')
        .eq('hackathon_id', hackathonId)
        .eq('judge_id', existingProfile.id)
        .is('submission_id', null)
        .maybeSingle();

      if (alreadyAssigned) {
        return NextResponse.json(
          { ok: false, error: 'This judge is already assigned to this hackathon.' },
          { status: 409 },
        );
      }
    }

    let judgeId: string;

    if (existingProfile?.id) {
      // Existing account — send a magic sign-in link so they receive an email
      judgeId = existingProfile.id;
      const otpRes = await fetch(
        `${supabaseUrl}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`,
        {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, create_user: false }),
        },
      );
      if (!otpRes.ok) {
        const txt = await otpRes.text();
        return NextResponse.json(
          { ok: false, error: `Could not send sign-in link: ${txt.slice(0, 200)}` },
          { status: 400 },
        );
      }
    } else {
      // New account — send a Supabase invite email that creates the account
      const inviteRes = await fetch(`${supabaseUrl}/auth/v1/invite`, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          data: { role: 'judge' },
          redirect_to: redirectTo,
        }),
      });

      if (!inviteRes.ok) {
        const txt = await inviteRes.text();
        return NextResponse.json(
          { ok: false, error: `Could not send invite: ${txt.slice(0, 200)}` },
          { status: 400 },
        );
      }

      const inviteData = (await inviteRes.json()) as { id?: string };
      if (!inviteData.id) {
        return NextResponse.json(
          { ok: false, error: 'Invite sent but no user id returned.' },
          { status: 500 },
        );
      }

      judgeId = inviteData.id;

      // Upsert a minimal profile in case the trigger hasn't fired yet
      await svc.from('profiles').upsert(
        { id: judgeId, full_name: email.split('@')[0], email },
        { onConflict: 'id', ignoreDuplicates: true },
      );
    }

    // Create the judge assignment (null submission_id = judge scores all submissions)
    const { error: assignErr } = await svc.from('judge_assignments').insert({
      hackathon_id: hackathonId,
      judge_id: judgeId,
      submission_id: null,
      assigned_by: organizer.id,
    });

    if (assignErr) {
      if (assignErr.code === '23505') {
        return NextResponse.json(
          { ok: false, error: 'This judge is already assigned to this hackathon.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: assignErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
