import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, H1, H2, Muted, P, Screen } from '../../../src/components/ui';
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

type Channel = { id: string; name: string; scope: 'team' | 'hackathon' };

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

      const list = (data ?? []) as Channel[];
      setChannels(list);
      if (list.length > 0 && !activeId) setActiveId(list[0].id);
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
      setMessages((data as Message[]) ?? []);
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
              <View style={{ flexDirection: 'row', gap: tokens.space[2], marginBottom: tokens.space[3] }}>
                {channels.map((c) => (
                  <Badge
                    key={c.id}
                    tone={activeId === c.id ? 'primary' : 'neutral'}
                  >
                    <P
                      onPress={() => setActiveId(c.id)}
                      style={{
                        color: activeId === c.id ? '#fff' : tokens.color.text,
                        fontWeight: '800',
                        fontSize: tokens.font.size.caption,
                      }}
                    >
                      {c.scope === 'team' ? `Team: ${c.name}` : c.name}
                    </P>
                  </Badge>
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
                ListEmptyComponent={<Muted>No messages yet — say hi 👋</Muted>}
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
