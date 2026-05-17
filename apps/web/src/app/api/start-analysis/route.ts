import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { analyzeCv } from '@/lib/cv';

export const runtime = 'edge';

async function scheduleBackground(p: Promise<unknown>) {
  try {
    const mod: any = await import('@cloudflare/next-on-pages').catch(() => null);
    const ctx = mod?.getRequestContext?.();
    if (ctx?.ctx?.waitUntil) {
      ctx.ctx.waitUntil(p);
      return;
    }
  } catch {}
  p.catch((err) => console.error('[scheduleBackground]', err));
}

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as { userId: string };
    if (!userId) return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 });

    const svc = createSupabaseServiceClient();
    const { data: p } = await svc
      .from('profiles')
      .select('cv_url')
      .eq('id', userId)
      .maybeSingle();
    if (!p?.cv_url) {
      return NextResponse.json({ ok: false, error: 'CV not found' }, { status: 404 });
    }
    scheduleBackground(analyzeCv(userId, p.cv_url));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown server error' },
      { status: 500 },
    );
  }
}
