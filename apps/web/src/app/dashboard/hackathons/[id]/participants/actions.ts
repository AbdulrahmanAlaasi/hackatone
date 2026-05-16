'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

async function audit(
  hackathonId: string,
  actorId: string,
  action: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  const svc = createSupabaseServiceClient();
  await svc
    .from('audit_events')
    .insert({ hackathon_id: hackathonId, actor_id: actorId, action, entity_type: 'registration', entity_id: entityId, metadata });
}

export async function decideRegistration(
  hackathonId: string,
  registrationId: string,
  decision: 'accepted' | 'rejected' | 'waitlisted' | 'pending',
  note?: string,
) {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from('registrations')
    .update({
      status: decision,
      decision_note: note ?? null,
      decided_by: decision === 'pending' ? null : user.id,
      decided_at: decision === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', registrationId);
  if (error) return { ok: false as const, error: error.message };
  await audit(hackathonId, user.id, `registration.${decision}`, registrationId, { note });
  revalidatePath(`/dashboard/hackathons/${hackathonId}/participants`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/participants/${registrationId}`);
  return { ok: true as const };
}

export async function checkInByToken(hackathonId: string, qrToken: string) {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const token = qrToken.trim();
  if (!token) return { ok: false as const, error: 'No token provided.' };

  const { data: reg, error } = await supabase
    .from('registrations')
    .select('id, full_name, email, status, checked_in_at, hackathon_id')
    .eq('qr_token', token)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!reg) return { ok: false as const, error: 'Token not recognized.' };
  if (reg.hackathon_id !== hackathonId)
    return { ok: false as const, error: 'This QR belongs to a different hackathon.' };
  if (reg.status !== 'accepted')
    return { ok: false as const, error: `Cannot check in — registration is ${reg.status}.` };
  if (reg.checked_in_at)
    return { ok: true as const, alreadyCheckedIn: true, name: reg.full_name, registrationId: reg.id };

  const { error: updErr } = await supabase
    .from('registrations')
    .update({ checked_in_at: new Date().toISOString(), checked_in_by: user.id })
    .eq('id', reg.id);
  if (updErr) return { ok: false as const, error: updErr.message };

  await audit(hackathonId, user.id, 'registration.checked_in', reg.id, { via: 'qr_token' });
  revalidatePath(`/dashboard/hackathons/${hackathonId}/check-in`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/participants`);
  return { ok: true as const, name: reg.full_name, registrationId: reg.id };
}

export async function checkInById(hackathonId: string, registrationId: string) {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from('registrations')
    .update({ checked_in_at: new Date().toISOString(), checked_in_by: user.id })
    .eq('id', registrationId)
    .eq('hackathon_id', hackathonId);
  if (error) return { ok: false as const, error: error.message };
  await audit(hackathonId, user.id, 'registration.checked_in', registrationId, { via: 'manual' });
  revalidatePath(`/dashboard/hackathons/${hackathonId}/check-in`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/participants`);
  return { ok: true as const };
}

export async function undoCheckIn(hackathonId: string, registrationId: string) {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from('registrations')
    .update({ checked_in_at: null, checked_in_by: null })
    .eq('id', registrationId)
    .eq('hackathon_id', hackathonId);
  if (error) return { ok: false as const, error: error.message };
  await audit(hackathonId, user.id, 'registration.check_in_undone', registrationId);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/check-in`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/participants`);
  return { ok: true as const };
}
