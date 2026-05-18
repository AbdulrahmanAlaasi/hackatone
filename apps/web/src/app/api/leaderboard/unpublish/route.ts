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

    const { error } = await svc
      .from('hackathons')
      .update({ leaderboard_published: false })
      .eq('id', hackathonId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
