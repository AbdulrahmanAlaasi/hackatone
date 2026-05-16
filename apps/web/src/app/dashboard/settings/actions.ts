'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export async function updateOrgLogo(orgId: string, logoUrl: string | null) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from('organizations')
    .update({ logo_url: logoUrl })
    .eq('id', orgId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/dashboard', 'layout');
  return { ok: true as const };
}
