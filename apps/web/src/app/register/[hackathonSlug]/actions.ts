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
 * Direct REST call to Supabase GoTrue admin endpoint to create a user.
 * Avoids the supabase-js admin SDK which has been flaky on Cloudflare edge.
 */
async function createAuthUser(email: string, password: string, fullName: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const r = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    return { ok: false as const, error: `auth/${r.status}: ${txt.slice(0, 200)}` };
  }
  const j = (await r.json()) as { id?: string };
  if (!j.id) return { ok: false as const, error: 'No user id returned' };
  return { ok: true as const, userId: j.id };
}

async function scheduleBackground(p: Promise<unknown>) {
  try {
    const mod: any = await import('@cloudflare/next-on-pages').catch(() => null);
    const ctx = mod?.getRequestContext?.();
    if (ctx?.ctx?.waitUntil) {
      ctx.ctx.waitUntil(p);
      return;
    }
  } catch {
    /* not on Cloudflare */
  }
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
 * Lean registration: creates account + inserts registration row, then schedules
 * CV upload + AI analysis in the background. Returns in 2-5 seconds.
 */
export async function submitRegistration(input: RegisterInput, cvDataUrl: string) {
  const svc = createSupabaseServiceClient();

  // ----------------------------------------------------------
  // 1. Resolve user (existing by email, or create new)
  // ----------------------------------------------------------
  let userId: string | null = null;

  const { data: existingProfile } = await svc
    .from('profiles')
    .select('id')
    .ilike('email', input.email)
    .maybeSingle();

  if (existingProfile?.id) {
    userId = existingProfile.id;
  } else {
    const created = await createAuthUser(input.email, input.password, input.fullName);
    if (!created.ok) {
      // If it's a "user already registered" race, try profile lookup once more
      if (created.error.toLowerCase().includes('already')) {
        const { data: again } = await svc.from('profiles').select('id').ilike('email', input.email).maybeSingle();
        userId = again?.id ?? null;
      }
      if (!userId) return { ok: false as const, error: created.error };
    } else {
      userId = created.userId;
    }
  }
  if (!userId) return { ok: false as const, error: 'No user id resolved' };

  // ----------------------------------------------------------
  // 2. Insert registration row IMMEDIATELY (so it's saved even
  //    if the CV upload or AI fails)
  // ----------------------------------------------------------
  const { error: regErr } = await svc.from('registrations').insert({
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
  });
  if (regErr) {
    if (regErr.code === '23505') {
      return { ok: false as const, error: 'You are already registered for this hackathon.' };
    }
    return { ok: false as const, error: regErr.message };
  }

  // ----------------------------------------------------------
  // 3. Update profile fields (non-blocking — non-critical)
  // ----------------------------------------------------------
  await svc
    .from('profiles')
    .update({
      phone: input.phone,
      organization_or_company: input.organizationOrCompany,
      major_or_job_title: input.majorOrJobTitle,
      skill_level: input.skillLevel,
      skills: input.skills,
      github_url: input.githubUrl,
    })
    .eq('id', userId);

  // ----------------------------------------------------------
  // 4. CV upload + AI analysis happen in the BACKGROUND.
  //    Even if the worker dies after the response, the success
  //    page's polling will re-trigger analysis via the cv_url.
  // ----------------------------------------------------------
  scheduleBackground(uploadAndAnalyze(userId, cvDataUrl));

  return { ok: true as const };
}

/**
 * Background task: parse CV data URL → upload to storage → analyze with Claude.
 * Best-effort. If it fails, the success page polling will retry analysis.
 */
async function uploadAndAnalyze(userId: string, cvDataUrl: string) {
  try {
    const svc = createSupabaseServiceClient();
    const match = cvDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return;
    const contentType = match[1]!;
    const base64Body = match[2]!;
    const cvBytes = base64ToUint8Array(base64Body);
    const path = `${userId}/cv.pdf`;

    const { error: uploadErr } = await svc.storage
      .from('cvs')
      .upload(path, cvBytes, { contentType, upsert: true });
    if (uploadErr) {
      console.error('[uploadAndAnalyze] upload', uploadErr.message);
      return;
    }

    const { data: signed } = await svc.storage.from('cvs').createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!signed?.signedUrl) return;

    await svc.from('profiles').update({ cv_url: signed.signedUrl }).eq('id', userId);
    await analyzeCv(userId, signed.signedUrl);
  } catch (err) {
    console.error('[uploadAndAnalyze] error', err);
  }
}

/**
 * Register an existing Hackatone user (account already created elsewhere).
 */
export async function registerExistingUser(input: {
  hackathonId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  organizationOrCompany?: string | null;
  majorOrJobTitle?: string | null;
  preferredTrackId?: string | null;
  teamPreference?: string | null;
}) {
  const svc = createSupabaseServiceClient();
  const { data: existing } = await svc
    .from('profiles')
    .select('id')
    .ilike('email', input.email)
    .maybeSingle();
  if (!existing) {
    return {
      ok: false as const,
      error:
        "We couldn't find an account with that email. Switch to ‘I'm new here’ and we'll create one.",
    };
  }

  const { error: regErr } = await svc.from('registrations').insert({
    hackathon_id: input.hackathonId,
    user_id: existing.id,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    organization_or_company: input.organizationOrCompany ?? null,
    major_or_job_title: input.majorOrJobTitle ?? null,
    preferred_track_id: input.preferredTrackId ?? null,
    team_preference: input.teamPreference ?? null,
    status: 'pending',
  });
  if (regErr) {
    if (regErr.code === '23505') {
      return { ok: false as const, error: 'You are already registered for this hackathon.' };
    }
    return { ok: false as const, error: regErr.message };
  }
  return { ok: true as const };
}

export async function getAnalysisStatus(email: string) {
  const svc = createSupabaseServiceClient();
  const { data: p } = await svc
    .from('profiles')
    .select('id, cv_url, ai_level, ai_skills, ai_summary, ai_analyzed_at')
    .ilike('email', email)
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
  if (p.cv_url) {
    scheduleBackground(analyzeCv(p.id, p.cv_url));
    return { state: 'pending' as const };
  }
  return { state: 'no_cv' as const };
}
