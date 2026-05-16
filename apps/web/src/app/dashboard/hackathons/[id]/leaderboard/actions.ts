'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export async function recomputeAndPublish(hackathonId: string) {
  const { supabase } = await getCurrentUserOrRedirect();

  // Pull final scores joined with weights to compute totals
  const { data: scores, error } = await supabase
    .from('scores')
    .select('submission_id, score, criteria_id, judging_criteria(weight, name)')
    .eq('hackathon_id', hackathonId)
    .eq('is_final', true);
  if (error) return { ok: false as const, error: error.message };

  // Aggregate per submission: total weighted score + impact (criterion named "Impact / usefulness")
  type Agg = { total: number; impactValues: number[] };
  const agg = new Map<string, Agg>();
  (scores ?? []).forEach((s: any) => {
    const weight = Number(s.judging_criteria?.weight ?? 1);
    const name = String(s.judging_criteria?.name ?? '').toLowerCase();
    const cur = agg.get(s.submission_id) ?? { total: 0, impactValues: [] };
    cur.total += Number(s.score) * weight;
    if (name.includes('impact')) cur.impactValues.push(Number(s.score));
    agg.set(s.submission_id, cur);
  });

  const ranked = Array.from(agg.entries())
    .map(([submission_id, a]) => ({
      submission_id,
      total: a.total,
      impact: a.impactValues.length
        ? a.impactValues.reduce((x, y) => x + y, 0) / a.impactValues.length
        : null,
    }))
    .sort((x, y) => {
      if (y.total !== x.total) return y.total - x.total;
      // tiebreaker: higher impact
      const xi = x.impact ?? -1;
      const yi = y.impact ?? -1;
      return yi - xi;
    });

  const now = new Date().toISOString();
  const rows = ranked.map((r, i) => ({
    hackathon_id: hackathonId,
    submission_id: r.submission_id,
    total_score: r.total,
    impact_score: r.impact,
    rank: i + 1,
    is_winner: i === 0,
    published_at: now,
  }));

  if (rows.length > 0) {
    const { error: upsertErr } = await supabase
      .from('leaderboard_results')
      .upsert(rows, { onConflict: 'hackathon_id,submission_id' });
    if (upsertErr) return { ok: false as const, error: upsertErr.message };
  }

  const { error: pubErr } = await supabase
    .from('hackathons')
    .update({ leaderboard_published: true })
    .eq('id', hackathonId);
  if (pubErr) return { ok: false as const, error: pubErr.message };

  revalidatePath(`/dashboard/hackathons/${hackathonId}/leaderboard`);
  return { ok: true as const, count: rows.length };
}

export async function unpublish(hackathonId: string) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from('hackathons')
    .update({ leaderboard_published: false })
    .eq('id', hackathonId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/hackathons/${hackathonId}/leaderboard`);
  return { ok: true as const };
}
