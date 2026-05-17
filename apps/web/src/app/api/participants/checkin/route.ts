import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { hackathonId, registrationId, undo } = await req.json() as {
      hackathonId: string;
      registrationId: string;
      undo?: boolean;
    };

    const { user } = await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    const { error } = await svc
      .from('registrations')
      .update(
        undo
          ? { checked_in_at: null, checked_in_by: null }
          : { checked_in_at: new Date().toISOString(), checked_in_by: user.id },
      )
      .eq('id', registrationId)
      .eq('hackathon_id', hackathonId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    await svc.from('audit_events').insert({
      hackathon_id: hackathonId,
      actor_id: user.id,
      action: undo ? 'registration.check_in_undone' : 'registration.checked_in',
      entity_type: 'registration',
      entity_id: registrationId,
      metadata: { via: 'manual' },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
