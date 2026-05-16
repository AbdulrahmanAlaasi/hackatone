'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export async function saveScores(
  hackathonId: string,
  submissionId: string,
  scores: Array<{ criteriaId: string; score: number; comment: string | null; isFinal: boolean }>,
) {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const payload = scores.map((s) => ({
    hackathon_id: hackathonId,
    submission_id: submissionId,
    judge_id: user.id,
    criteria_id: s.criteriaId,
    score: s.score,
    comment: s.comment,
    is_final: s.isFinal,
  }));

  const { error } = await supabase
    .from('scores')
    .upsert(payload, { onConflict: 'submission_id,judge_id,criteria_id' });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath(`/dashboard/hackathons/${hackathonId}/scoring`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/scoring/${submissionId}`);
  revalidatePath(`/dashboard/hackathons/${hackathonId}/leaderboard`);
  return { ok: true as const };
}
