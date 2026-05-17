import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { hackathonId, assignmentId } = await req.json() as {
      hackathonId: string;
      assignmentId: string;
    };

    await getCurrentUserOrRedirect();
    const svc = createSupabaseServiceClient();

    const { error } = await svc
      .from('judge_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('hackathon_id', hackathonId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
