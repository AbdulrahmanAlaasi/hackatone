'use server';

import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { analyzeCv } from '@/lib/cv';

// Edge-safe base64 decode (no Buffer dependency).
function base64ToUint8Array(b64: string): Uint8Array {
  const bin = atob(b64);
  const len = bin.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Schedule background work on Cloudflare via `ctx.waitUntil` if available,
 * otherwise fall through (Node dev server / other runtimes). The promise will
 * still run; on Workers, this keeps the isolate alive past the response.
 */
async function scheduleBackground(p: Promise<unknown>) {
  try {
    const mod = await import('@cloudflare/next-on-pages');
    const ctx = (mod as any).getRequestContext?.();
    if (ctx?.ctx?.waitUntil) {
      ctx.ctx.waitUntil(p);
      return;
    }
  } catch {
    /* not on Cloudflare — fall through */
  }
  // Best-effort fire-and-forget (locally fine; on workers the response may already be sent)
  p.catch((err) => console.error('[scheduleBackground]', err));
}

export interface RegisterInput {
  hackathonId: string;
  hackathonSlug: string;
  fullName: string;
  email: string;
  password: string;
  phone: string | null;
  organizationOrCompany: string | null;
  majorOrJobTitle: string | null;
  skillLevel: string | null;
  skills: string[];
  preferredTrackId: string | null;
  githubUrl: string | null;
  teamPreference: string | null;
}

/**
 * Fast registration: auth user + CV upload + DB inserts only.
 * Returns success in a few seconds so the participant sees the success page quickly.
 *
 * The Claude Haiku CV analysis is scheduled in the background via `ctx.waitUntil`
 * so it finishes after the response is sent.
 */
export async function submitRegistration(input: RegisterInput, cvDataUrl: string) {
  const svc = createSupabaseServiceClient();

  // ------------------------------------------------------------
  // 1. Create or look up the auth user (fast path)
  // ------------------------------------------------------------
  let userId: string | null = null;

  // Try to create first; if conflict, fall back to listUsers lookup
  const { data: created, error: createErr } = await svc.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (created?.user) {
    userId = created.user.id;
  } else if (createErr) {
    const msg = (createErr.message || '').toLowerCase();
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      // existing user — look it up
      const { data: list } = await svc.auth.admin.listUsers({ page: 1, perPage: 200 });
      userId =
        list?.users.find((u) => u.email?.toLowerCase() === input.email.toLowerCase())?.id ?? null;
      if (!userId) return { ok: false as const, error: 'Account exists but could not be resolved.' };
    } else {
      return { ok: false as const, error: createErr.message };
    }
  }
  if (!userId) return { ok: false as const, error: 'No user id resolved' };

  // ------------------------------------------------------------
  // 2. Upload the CV to private bucket as `<userId>/cv.pdf`
  // ------------------------------------------------------------
  const match = cvDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { ok: false as const, error: 'Invalid CV upload' };
  const contentType = match[1]!;
  const base64Body = match[2]!;
  const cvBytes = base64ToUint8Array(base64Body);
  const path = `${userId}/cv.pdf`;

  const { error: uploadErr } = await svc.storage
    .from('cvs')
    .upload(path, cvBytes, { contentType, upsert: true });
  if (uploadErr) return { ok: false as const, error: `CV upload failed: ${uploadErr.message}` };

  const { data: signed } = await svc.storage.from('cvs').createSignedUrl(path, 60 * 60 * 24 * 365);
  const cvUrl = signed?.signedUrl ?? null;

  // ------------------------------------------------------------
  // 3. Update profile + insert registration (parallel)
  // ------------------------------------------------------------
  const [profileRes, regRes] = await Promise.all([
    svc
      .from('profiles')
      .update({
        cv_url: cvUrl,
        phone: input.phone,
        organization_or_company: input.organizationOrCompany,
        major_or_job_title: input.majorOrJobTitle,
        skill_level: input.skillLevel,
        skills: input.skills,
        github_url: input.githubUrl,
      })
      .eq('id', userId),
    svc.from('registrations').insert({
      hackathon_id: input.hackathonId,
      user_id: userId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      organization_or_company: input.organizationOrCompany,
      major_or_job_title: input.majorOrJobTitle,
      skill_level: input.skillLevel,
      skills: input.skills,
      preferred_track_id: input.preferredTrackId,
      github_url: input.githubUrl,
      team_preference: input.teamPreference,
      status: 'pending',
    }),
  ]);

  if (regRes.error) {
    if (regRes.error.code === '23505') {
      return { ok: false as const, error: 'This email is already registered for this hackathon.' };
    }
    return { ok: false as const, error: regRes.error.message };
  }
  // profileRes errors are non-fatal — registration still succeeded
  if (profileRes.error) console.warn('[register] profile update warning:', profileRes.error.message);

  // ------------------------------------------------------------
  // 4. Schedule the CV analysis in the BACKGROUND
  //    The response returns immediately; Claude Haiku runs after.
  // ------------------------------------------------------------
  if (cvUrl) {
    await scheduleBackground(analyzeCv(userId, cvUrl));
  }

  return { ok: true as const };
}

/**
 * Allow the success page to poll for analysis completion / re-trigger if needed.
 */
export async function getAnalysisStatus(email: string) {
  const svc = createSupabaseServiceClient();
  const { data: list } = await svc.auth.admin.listUsers({ page: 1, perPage: 200 });
  const u = list?.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
  if (!u) return { state: 'missing' as const };
  const { data: p } = await svc
    .from('profiles')
    .select('cv_url, ai_level, ai_skills, ai_summary, ai_analyzed_at')
    .eq('id', u.id)
    .maybeSingle();
  if (!p) return { state: 'missing' as const };
  if (p.ai_analyzed_at) {
    return {
      state: 'done' as const,
      level: p.ai_level,
      skills: p.ai_skills,
      summary: p.ai_summary,
    };
  }
  // If no analysis after a while and CV exists, re-kick
  if (p.cv_url) {
    await scheduleBackground(analyzeCv(u.id, p.cv_url));
    return { state: 'pending' as const };
  }
  return { state: 'no_cv' as const };
}
