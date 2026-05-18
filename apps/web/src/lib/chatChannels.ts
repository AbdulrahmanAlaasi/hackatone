import type { SupabaseClient } from '@supabase/supabase-js';

export async function ensureGeneralChatChannel(supabase: SupabaseClient, hackathonId: string) {
  const { data: existing, error: readError } = await supabase
    .from('chat_channels')
    .select('id')
    .eq('hackathon_id', hackathonId)
    .eq('scope', 'hackathon')
    .is('team_id', null)
    .maybeSingle();

  if (readError && readError.code !== 'PGRST116') return readError;
  if (existing) return null;

  const { error } = await supabase.from('chat_channels').insert({
    hackathon_id: hackathonId,
    team_id: null,
    scope: 'hackathon',
    name: 'General',
  });

  return error ?? null;
}
