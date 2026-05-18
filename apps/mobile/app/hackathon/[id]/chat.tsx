import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H1, Muted, P, Screen } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/auth/AuthProvider';
import { tokens } from '../../../src/theme';

type Message = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
};

type Channel = { id: string; name: string; scope: 'team' | 'hackathon'; team_id: string | null };

function normalizeMessages(rows: any[] | null): Message[] {
  return (rows ?? []).map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? (row.profiles[0] ?? null) : (row.profiles ?? null),
  }));
}

function channelLabel(channel: Channel) {
  return channel.scope === 'hackathon' ? 'General' : channel.name;
}

function channelDescription(channel: Channel) {
  return channel.scope === 'hackathon' ? 'Everyone in this hackathon' : 'Your team only';
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  // Load channels: team channels for this user + hackathon-wide channel if enabled.
  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data: hackathon } = await supabase
        .from('hackathons')
        .select('chat_enabled')
        .eq('id', id)
        .maybeSingle();

      const { data: myTm } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('hackathon_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      const teamId = myTm?.team_id;
      const orFilters: string[] = [];
      if (hackathon?.chat_enabled) orFilters.push(`scope.eq.hackathon`);
      if (teamId) orFilters.push(`and(scope.eq.team,team_id.eq.${teamId})`);

      const query = supabase
        .from('chat_channels')
        .select('id, name, scope, team_id')
        .eq('hackathon_id', id);

      const { data } = orFilters.length
        ? await query.or(orFilters.join(','))
        : await query.eq('scope', 'team').eq('team_id', teamId ?? '00000000-0000-0000-0000-000000000000');

      // Dedupe: at most one channel per (scope, team_id), guarding against any
      // stale dupes from before migration 0009 was applied.
      const rawList = (data ?? []) as Channel[];
      const seen = new Set<string>();
      const list: Channel[] = [];
      for (const c of rawList) {
        const key = `${c.scope}:${c.team_id ?? 'all'}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ id: c.id, name: c.name, scope: c.scope, team_id: c.team_id });
      }
      list.sort((a, b) => {
        if (a.scope !== b.scope) return a.scope === 'hackathon' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setChannels(list);
      const preferred = list.find((c) => c.scope === 'hackathon') ?? list[0];
      if (preferred && !activeId) setActiveId(preferred.id);
    })();
  }, [id, user]);

  // Load messages + realtime
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('id, body, sender_id, created_at, profiles(full_name)')
        .eq('channel_id', activeId)
        .order('created_at', { ascending: true })
        .limit(200);
      setMessages(normalizeMessages(data));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    })();

    const sub = supabase
      .channel(`chat:${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeId}` },
        (payload) => {
          const m = payload.new as any as Message;
          setMessages((prev) => [...prev, m]);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [activeId]);

  const send = useCallback(async () => {
    if (!user || !activeId || !text.trim()) return;
    setSending(true);
    const body = text.trim();
    setText('');
    const { error } = await supabase
      .from('chat_messages')
      .insert({ channel_id: activeId, hackathon_id: id, sender_id: user.id, body });
    setSending(false);
    if (error) setText(body);
  }, [user, activeId, text, id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Screen>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>Chat</H1>

          {channels.length === 0 ? (
            <Card>
              <P>
                No chat channels available yet. Join or create a team, or wait for the organizer to
                enable hackathon-wide chat.
              </P>
            </Card>
          ) : (
            <>
              <View style={{ gap: tokens.space[2], marginBottom: tokens.space[4] }}>
                {channels.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setActiveId(c.id)}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: tokens.space[3],
                        paddingHorizontal: tokens.space[4],
                        paddingVertical: tokens.space[3],
                        borderRadius: tokens.radius.lg,
                        borderWidth: 1,
                        borderColor: activeId === c.id ? tokens.color.primary : tokens.color.border,
                        backgroundColor: activeId === c.id ? '#FFF1DE' : tokens.color.surface,
                        transform: pressed ? [{ scale: 0.99 }] : [],
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        backgroundColor: c.scope === 'hackathon' ? tokens.color.success : tokens.color.primary,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <P style={{ fontWeight: '900', lineHeight: 20 }}>{channelLabel(c)}</P>
                      <Muted>{channelDescription(c)}</Muted>
                    </View>
                    <P
                      style={{
                        color: activeId === c.id ? tokens.color.primaryPressed : tokens.color.textMuted,
                        fontWeight: '900',
                        fontSize: tokens.font.size.caption,
                      }}
                    >
                      {activeId === c.id ? 'Open' : ''}
                    </P>
                  </Pressable>
                ))}
              </View>

              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                ItemSeparatorComponent={() => <View style={{ height: tokens.space[2] }} />}
                contentContainerStyle={{ paddingBottom: tokens.space[3] }}
                style={{ flex: 1 }}
                renderItem={({ item }) => {
                  const mine = item.sender_id === user?.id;
                  return (
                    <View
                      style={{
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        backgroundColor: mine ? tokens.color.primary : tokens.color.surface,
                        borderColor: tokens.color.border,
                        borderWidth: mine ? 0 : 1,
                        paddingHorizontal: tokens.space[3],
                        paddingVertical: tokens.space[2],
                        borderRadius: tokens.radius.md,
                      }}
                    >
                      {!mine ? (
                        <Muted style={{ fontWeight: '700', marginBottom: 2 }}>
                          {item.profiles?.full_name ?? 'Someone'}
                        </Muted>
                      ) : null}
                      <P style={{ color: mine ? '#fff' : tokens.color.text }}>{item.body}</P>
                    </View>
                  );
                }}
                ListEmptyComponent={<Muted>No messages yet. Say hi to start the chat.</Muted>}
              />

              <View style={{ flexDirection: 'row', gap: tokens.space[2], paddingTop: tokens.space[2] }}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Type a message…"
                  placeholderTextColor={tokens.color.disabledText}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    paddingHorizontal: tokens.space[4],
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: tokens.color.border,
                    borderRadius: tokens.radius.full,
                    backgroundColor: tokens.color.surface,
                    fontSize: tokens.font.size.body,
                  }}
                  onSubmitEditing={send}
                />
                <Button title="Send" onPress={send} loading={sending} disabled={!text.trim()} />
              </View>
            </>
          )}
        </Screen>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
