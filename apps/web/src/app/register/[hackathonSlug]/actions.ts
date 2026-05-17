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

export async function submitRegistration(input: RegisterInput, cvDataUrl: string) {
  const svc = createSupabaseServiceClient();

  // ------------------------------------------------------------
  // 1. Create or look up the auth user
  // ------------------------------------------------------------
  let userId: string | null = null;
  // listUsers paginates; check by email directly
  const { data: existingList } = await svc.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = existingList?.users.find(
    (u) => u.email?.toLowerCase() === input.email.toLowerCase(),
  );

  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await svc.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });
    if (createErr || !created.user) {
      return { ok: false as const, error: createErr?.message ?? 'Could not create account' };
    }
    userId = created.user.id;
  }

  if (!userId) return { ok: false as const, error: 'No user id resolved' };

  // ------------------------------------------------------------
  // 2. Upload the CV to private bucket as `<userId>/cv.pdf`
  // ------------------------------------------------------------
  // cvDataUrl is "data:application/pdf;base64,...." — split it.
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

  // Signed URL valid for 1 year — used by AI analysis and by organizer review.
  const { data: signed } = await svc.storage.from('cvs').createSignedUrl(path, 60 * 60 * 24 * 365);
  const cvUrl = signed?.signedUrl ?? null;

  // ------------------------------------------------------------
  // 3. Update profile with CV url + profile fields
  // ------------------------------------------------------------
  await svc
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
    .eq('id', userId);

  // ------------------------------------------------------------
  // 4. Insert registration (link_registration trigger will fill user_id by email, but we set it too)
  // ------------------------------------------------------------
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
      return { ok: false as const, error: 'This email is already registered for this hackathon.' };
    }
    return { ok: false as const, error: regErr.message };
  }

  // ------------------------------------------------------------
  // 5. Kick off CV analysis (blocking — Claude Haiku is fast enough)
  // ------------------------------------------------------------
  if (cvUrl) {
    await analyzeCv(userId, cvUrl);
  }

  return { ok: true as const };
}
