import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';

export async function getCurrentUserOrRedirect() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

export async function getMyOrganization() {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const { data } = await supabase
    .from('organization_members')
    .select('role, organization_id, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    membership: data ?? null,
    organization: (data?.organizations as { id: string; name: string; slug: string } | undefined) ?? null,
  };
}
