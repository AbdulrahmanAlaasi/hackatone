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

    // Get hackathon slug for the access URL
    const { data: hackathon } = await svc
      .from('hackathons')
      .select('slug')
      .eq('id', hackathonId)
      .maybeSingle();
    if (!hackathon) {
      return NextResponse.json({ ok: false, error: 'Hackathon not found.' }, { status: 404 });
    }

    // Check if already assigned
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

    // Resolve or create a shadow user (no invite email — judge accesses via token link)
    let judgeId: string;

    if (existingProfile?.id) {
      judgeId = existingProfile.id;
    } else {
      // Create shadow user via GoTrue admin (email_confirm=true, random password — no email sent)
      const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: randomPassword,
          email_confirm: true,
          user_metadata: { role: 'judge' },
        }),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        // User might already exist in auth but not profiles — try to get them
        if (txt.includes('already')) {
          const { data: retry } = await svc
            .from('profiles')
            .select('id')
            .ilike('email', email)
            .maybeSingle();
          if (retry?.id) {
            judgeId = retry.id;
          } else {
            return NextResponse.json({ ok: false, error: `Could not create judge account: ${txt.slice(0, 200)}` }, { status: 400 });
          }
        } else {
          return NextResponse.json({ ok: false, error: `Could not create judge account: ${txt.slice(0, 200)}` }, { status: 400 });
        }
      } else {
        const userData = (await createRes.json()) as { id?: string };
        if (!userData.id) {
          return NextResponse.json({ ok: false, error: 'No user id returned.' }, { status: 500 });
        }
        judgeId = userData.id;

        // Upsert minimal profile (trigger may not have fired yet)
        await svc.from('profiles').upsert(
          { id: judgeId, full_name: email.split('@')[0], email },
          { onConflict: 'id', ignoreDuplicates: true },
        );
      }
    }

    // Create judge assignment — the assignment ID becomes the access token
    const { data: assignment, error: assignErr } = await svc
      .from('judge_assignments')
      .insert({
        hackathon_id: hackathonId,
        judge_id: judgeId,
        submission_id: null,
        assigned_by: organizer.id,
      })
      .select('id')
      .single();

    if (assignErr) {
      if (assignErr.code === '23505') {
        return NextResponse.json(
          { ok: false, error: 'This judge is already assigned to this hackathon.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: assignErr.message }, { status: 500 });
    }

    const accessLink = `${siteUrl}/${hackathon.slug}/judge/${assignment.id}`;
    return NextResponse.json({ ok: true, link: accessLink });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
