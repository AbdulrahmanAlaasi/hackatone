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

    // Check if judge already has a Hackatone account
    const { data: existing } = await svc
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    let judgeId: string;
    let isNew = false;

    if (existing?.id) {
      judgeId = existing.id;
    } else {
      // Invite via Supabase GoTrue — creates the user + sends the email
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hackatone.alaasi.dev';

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
          redirect_to: `${siteUrl}/judge`,
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
        return NextResponse.json({ ok: false, error: 'Invite sent but no user id returned.' }, { status: 500 });
      }

      judgeId = inviteData.id;
      isNew = true;

      // Upsert a minimal profile in case the trigger hasn't fired yet
      await svc.from('profiles').upsert(
        { id: judgeId, full_name: email.split('@')[0], email },
        { onConflict: 'id', ignoreDuplicates: true },
      );
    }

    // Create the judge assignment (null submission_id = scores all submissions)
    const { error: assignErr } = await svc.from('judge_assignments').insert({
      hackathon_id: hackathonId,
      judge_id: judgeId,
      submission_id: null,
      assigned_by: organizer.id,
    });

    if (assignErr) {
      if (assignErr.code === '23505') {
        return NextResponse.json({ ok: false, error: 'This judge is already assigned to this hackathon.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: assignErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, isNew });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
