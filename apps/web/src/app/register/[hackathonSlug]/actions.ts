'use server';

import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { analyzeCv } from '@/lib/cv';

/**
 * Direct REST call to Supabase GoTrue admin endpoint — avoids the supabase-js
 * admin SDK which can be flaky on Cloudflare edge.
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
  } catch {}
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
 * Step 1 of registration: account + registration row.
 *
 * No CV here — that gets uploaded directly to Supabase storage by the browser
 * after sign-in, to keep the server-action payload small (Cloudflare-friendly).
 *
 * Returns the new userId so the client can sign them in.
 */
export async function submitRegistration(input: RegisterInput) {
  const svc = createSupabaseServiceClient();

  // Resolve or create the auth user
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
      if (created.error.toLowerCase().includes('already')) {
        const { data: again } = await svc
          .from('profiles')
          .select('id')
          .ilike('email', input.email)
          .maybeSingle();
        userId = again?.id ?? null;
      }
      if (!userId) return { ok: false as const, error: created.error };
    } else {
      userId = created.userId;
    }
  }
  if (!userId) return { ok: false as const, error: 'No user id resolved' };

  // Insert registration row
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

  // Profile metadata
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

  return { ok: true as const, userId };
}

/**
 * Step 2 (background): after the browser uploads the CV, this kicks off the
 * Claude analysis. The client just calls this after the upload completes.
 */
export async function startCvAnalysis(userId: string) {
  const svc = createSupabaseServiceClient();
  const { data: p } = await svc.from('profiles').select('cv_url').eq('id', userId).maybeSingle();
  if (!p?.cv_url) return { ok: false as const, error: 'CV not found' };
  scheduleBackground(analyzeCv(userId, p.cv_url));
  return { ok: true as const };
}

/**
 * Register an existing user (account already exists) — quick path, no CV.
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
