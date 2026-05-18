'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { ensureGeneralChatChannel } from '@/lib/chatChannels';
import { DEFAULT_JUDGING_CRITERIA } from '@hackatone/shared';

interface CreateInput {
  organization_id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  starts_at: string | null;
  ends_at: string | null;
  registration_deadline: string | null;
  submission_deadline: string | null;
  min_team_size: number;
  max_team_size: number;
  team_mode: 'organizer_assigns' | 'participant_creates' | 'team_code' | 'invite_link' | 'hybrid';
  solo_allowed: boolean;
  visibility: 'public' | 'private';
  field: string | null;
}

export async function createHackathon(input: CreateInput) {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const { data: hackathon, error } = await supabase
    .from('hackathons')
    .insert({
      ...input,
      status: input.visibility === 'public' ? 'registration_open' : 'draft',
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error || !hackathon) return { ok: false as const, error: error?.message ?? 'Insert failed' };

  // Seed default judging criteria
  const criteria = DEFAULT_JUDGING_CRITERIA.map((c, i) => ({
    hackathon_id: hackathon.id,
    name: c.name,
    weight: c.weight,
    sort_order: i + 1,
  }));
  await supabase.from('judging_criteria').insert(criteria);
  await ensureGeneralChatChannel(supabase, hackathon.id);

  revalidatePath('/dashboard/hackathons');
  return { ok: true as const, id: hackathon.id };
}
