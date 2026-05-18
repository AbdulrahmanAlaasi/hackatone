import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      hackathonId: string;
      registrationId?: string;
      token?: string;    // QR token from participant app
      undo?: boolean;
    };
    const { hackathonId, registrationId, token, undo } = body;

    if (!hackathonId || (!registrationId && !token)) {
      return NextResponse.json({ ok: false, error: 'Missing fields.' }, { status: 400 });
    }

    const { user } = await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    // Token-based lookup (QR scan)
    if (token) {
      const qr = token.trim();
      if (!qr) return NextResponse.json({ ok: false, error: 'Empty token.' }, { status: 400 });

      const { data: reg } = await svc
        .from('registrations')
        .select('id, full_name, status, checked_in_at, hackathon_id')
        .eq('qr_token', qr)
        .maybeSingle();

      if (!reg) return NextResponse.json({ ok: false, error: 'Token not recognized.' }, { status: 404 });
      if (reg.hackathon_id !== hackathonId) {
        return NextResponse.json({ ok: false, error: 'QR belongs to a different hackathon.' }, { status: 400 });
      }
      if (reg.status !== 'accepted') {
        return NextResponse.json({ ok: false, error: `Cannot check in — registration is ${reg.status}.` }, { status: 400 });
      }
      if (reg.checked_in_at) {
        return NextResponse.json({ ok: true, alreadyCheckedIn: true, name: reg.full_name });
      }

      const { error } = await svc
        .from('registrations')
        .update({ checked_in_at: new Date().toISOString(), checked_in_by: user.id })
        .eq('id', reg.id);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

      await svc.from('audit_events').insert({
        hackathon_id: hackathonId,
        actor_id: user.id,
        action: 'registration.checked_in',
        entity_type: 'registration',
        entity_id: reg.id,
        metadata: { via: 'qr_token' },
      });

      return NextResponse.json({ ok: true, name: reg.full_name });
    }

    // ID-based check-in / undo
    const { error } = await svc
      .from('registrations')
      .update(
        undo
          ? { checked_in_at: null, checked_in_by: null }
          : { checked_in_at: new Date().toISOString(), checked_in_by: user.id },
      )
      .eq('id', registrationId!)
      .eq('hackathon_id', hackathonId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    await svc.from('audit_events').insert({
      hackathon_id: hackathonId,
      actor_id: user.id,
      action: undo ? 'registration.check_in_undone' : 'registration.checked_in',
      entity_type: 'registration',
      entity_id: registrationId!,
      metadata: { via: 'manual' },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
