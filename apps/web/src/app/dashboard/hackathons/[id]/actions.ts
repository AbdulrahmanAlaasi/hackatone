'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export async function updateHackathon(id: string, patch: Record<string, unknown>) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase.from('hackathons').update(patch).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${id}`);
  return { ok: true as const };
}

// ---------- Tracks ----------
export async function addTrack(hackathonId: string, name: string, description: string) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from('hackathon_tracks')
    .insert({ hackathon_id: hackathonId, name, description: description || null });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/tracks`);
  return { ok: true as const };
}

export async function deleteTrack(hackathonId: string, trackId: string) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase.from('hackathon_tracks').delete().eq('id', trackId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/tracks`);
  return { ok: true as const };
}

// ---------- Judging criteria ----------
export async function addCriterion(
  hackathonId: string,
  input: { name: string; description: string; weight: number; sort_order: number },
) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase.from('judging_criteria').insert({
    hackathon_id: hackathonId,
    name: input.name,
    description: input.description || null,
    weight: input.weight,
    sort_order: input.sort_order,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/criteria`);
  return { ok: true as const };
}

export async function updateCriterion(
  hackathonId: string,
  id: string,
  patch: { name?: string; description?: string | null; weight?: number; sort_order?: number },
) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase.from('judging_criteria').update(patch).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/criteria`);
  return { ok: true as const };
}

export async function deleteCriterion(hackathonId: string, id: string) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase.from('judging_criteria').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/criteria`);
  return { ok: true as const };
}
