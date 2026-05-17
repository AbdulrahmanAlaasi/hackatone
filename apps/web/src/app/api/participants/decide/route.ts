import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { hackathonId, registrationId, decision, note } = await req.json() as {
      hackathonId: string;
      registrationId: string;
      decision: 'accepted' | 'rejected' | 'waitlisted' | 'pending';
      note?: string;
    };

    const { user } = await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    const { error } = await svc
      .from('registrations')
      .update({
        status: decision,
        decision_note: note ?? null,
        decided_by: decision === 'pending' ? null : user.id,
        decided_at: decision === 'pending' ? null : new Date().toISOString(),
      })
      .eq('id', registrationId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    await svc.from('audit_events').insert({
      hackathon_id: hackathonId,
      actor_id: user.id,
      action: `registration.${decision}`,
      entity_type: 'registration',
      entity_id: registrationId,
      metadata: { note },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
