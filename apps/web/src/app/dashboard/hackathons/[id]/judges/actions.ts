'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export async function assignJudge(hackathonId: string, email: string) {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (!profile) {
    return { ok: false as const, error: 'No Hackatone account found for that email. The judge must sign up first.' };
  }

  // assignment with submission_id null = judge can score all submissions
  const { error } = await supabase
    .from('judge_assignments')
    .insert({
      hackathon_id: hackathonId,
      judge_id: profile.id,
      submission_id: null,
      assigned_by: user.id,
    });

  if (error) {
    if (error.code === '23505') return { ok: false as const, error: 'Already assigned.' };
    return { ok: false as const, error: error.message };
  }

  revalidatePath(`/dashboard/hackathons/${hackathonId}/judges`);
  return { ok: true as const };
}

export async function removeJudge(hackathonId: string, assignmentId: string) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase.from('judge_assignments').delete().eq('id', assignmentId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/judges`);
  return { ok: true as const };
}
