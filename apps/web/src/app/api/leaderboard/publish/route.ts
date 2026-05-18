import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { hackathonId } = await req.json() as { hackathonId: string };
    if (!hackathonId) return NextResponse.json({ ok: false, error: 'Missing hackathonId.' }, { status: 400 });

    await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    // Pull all final scores with criteria weights (service client bypasses RLS)
    const { data: scores, error } = await svc
      .from('scores')
      .select('submission_id, score, criteria_id, judging_criteria(weight, name)')
      .eq('hackathon_id', hackathonId)
      .eq('is_final', true);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

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
        return (y.impact ?? -1) - (x.impact ?? -1);
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
      const { error: upsertErr } = await svc
        .from('leaderboard_results')
        .upsert(rows, { onConflict: 'hackathon_id,submission_id' });
      if (upsertErr) return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }

    const { error: pubErr } = await svc
      .from('hackathons')
      .update({ leaderboard_published: true })
      .eq('id', hackathonId);
    if (pubErr) return NextResponse.json({ ok: false, error: pubErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
