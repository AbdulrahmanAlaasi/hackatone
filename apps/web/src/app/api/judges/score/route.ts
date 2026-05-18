import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { assignmentId, submissionId, scores } = await req.json() as {
      assignmentId: string;
      submissionId: string;
      scores: Array<{ criteriaId: string; score: number; comment: string | null; isFinal: boolean }>;
    };

    if (!assignmentId || !submissionId || !scores?.length) {
      return NextResponse.json({ ok: false, error: 'Missing fields.' }, { status: 400 });
    }

    const svc = createSupabaseServiceClient();

    // Validate the assignment token
    const { data: assignment } = await svc
      .from('judge_assignments')
      .select('hackathon_id, judge_id')
      .eq('id', assignmentId)
      .is('submission_id', null)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ ok: false, error: 'Invalid judge access token.' }, { status: 401 });
    }

    // Verify submission belongs to this hackathon
    const { data: submission } = await svc
      .from('submissions')
      .select('id')
      .eq('id', submissionId)
      .eq('hackathon_id', assignment.hackathon_id)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ ok: false, error: 'Submission not found.' }, { status: 404 });
    }

    const payload = scores.map((s) => ({
      hackathon_id: assignment.hackathon_id,
      submission_id: submissionId,
      judge_id: assignment.judge_id,
      criteria_id: s.criteriaId,
      score: s.score,
      comment: s.comment ?? null,
      is_final: s.isFinal,
    }));

    const { error } = await svc
      .from('scores')
      .upsert(payload, { onConflict: 'submission_id,judge_id,criteria_id' });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
