'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function createAnnouncement(hackathonId: string, title: string, body: string) {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({ hackathon_id: hackathonId, title, body, created_by: user.id })
    .select('id')
    .single();
  if (error || !announcement) return { ok: false as const, error: error?.message ?? 'Insert failed' };

  // Fan-out notification rows to accepted participants (in_app only — email/push are future scope).
  // Uses service role so it can write rows for other users.
  const svc = createSupabaseServiceClient();
  const { data: recipients } = await svc
    .from('registrations')
    .select('user_id')
    .eq('hackathon_id', hackathonId)
    .eq('status', 'accepted')
    .not('user_id', 'is', null);

  if (recipients && recipients.length > 0) {
    await svc.from('notifications').insert(
      recipients.map((r) => ({
        user_id: r.user_id!,
        hackathon_id: hackathonId,
        channel: 'in_app',
        title,
        body,
      })),
    );
  }

  revalidatePath(`/dashboard/hackathons/${hackathonId}/announcements`);
  return { ok: true as const };
}
