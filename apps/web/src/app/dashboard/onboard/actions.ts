'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export async function createOrganization(input: { name: string; slug: string }) {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name: input.name, slug: input.slug, owner_id: user.id })
    .select('id')
    .single();

  if (error || !org) return { ok: false as const, error: error?.message ?? 'Could not create organization' };

  const { error: memberErr } = await supabase
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: user.id, role: 'organization_owner' });

  if (memberErr) return { ok: false as const, error: memberErr.message };

  revalidatePath('/dashboard');
  return { ok: true as const, id: org.id };
}
