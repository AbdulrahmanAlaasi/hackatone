import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, Field, H1, H2, Input, Muted, P, Screen } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/auth/AuthProvider';
import { tokens } from '../../../src/theme';

type Hackathon = {
  id: string;
  title: string;
  team_mode: 'organizer_assigns' | 'participant_creates' | 'team_code' | 'invite_link' | 'hybrid';
  solo_allowed: boolean;
  min_team_size: number;
  max_team_size: number;
};

type Team = { id: string; name: string; join_code: string | null };
type Member = { user_id: string; role: string; profiles: { full_name: string; email: string } | null };

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [accepted, setAccepted] = useState(false);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const { data: h } = await supabase
      .from('hackathons')
      .select('id, title, team_mode, solo_allowed, min_team_size, max_team_size')
      .eq('id', id)
      .maybeSingle();
    setHackathon(h as any);

    const { data: reg } = await supabase
      .from('registrations')
      .select('status')
      .eq('hackathon_id', id)
      .eq('email', user.email)
      .maybeSingle();
    setAccepted(reg?.status === 'accepted');

    const { data: myTm } = await supabase
      .from('team_members')
      .select('teams(id, name, join_code)')
      .eq('hackathon_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    const myTeam = ((myTm as any)?.teams ?? null) as Team | null;
    setTeam(myTeam);

    if (myTeam) {
      const { data: mems } = await supabase
        .from('team_members')
        .select('user_id, role, profiles(full_name, email)')
        .eq('team_id', myTeam.id);
      setMembers(((mems as any) ?? []) as Member[]);
    } else {
      setMembers([]);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!hackathon) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Screen><Muted>Loading…</Muted></Screen>
      </SafeAreaView>
    );
  }

  if (!accepted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Screen>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>Team</H1>
          <Card>
            <P>You'll see team options once your registration is accepted.</P>
          </Card>
        </Screen>
      </SafeAreaView>
    );
  }

  const allowsCreate =
    hackathon.team_mode === 'participant_creates' || hackathon.team_mode === 'hybrid';
  const allowsCode =
    hackathon.team_mode === 'team_code' || hackathon.team_mode === 'hybrid';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>Team</H1>
          <Muted style={{ marginBottom: tokens.space[4] }}>
            {hackathon.title} · team size {hackathon.min_team_size}–{hackathon.max_team_size}
          </Muted>

          {team ? (
            <Card>
              <H2>{team.name}</H2>
              {team.join_code ? (
                <Badge tone="secondary" style={{ marginTop: tokens.space[2] }}>
                  Join code: {team.join_code}
                </Badge>
              ) : null}
              <View style={{ marginTop: tokens.space[4], gap: tokens.space[2] }}>
                {members.map((m) => (
                  <View
                    key={m.user_id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: tokens.space[2],
                      borderBottomWidth: 1,
                      borderBottomColor: tokens.color.border,
                    }}
                  >
                    <View>
                      <P style={{ fontWeight: '700' }}>{m.profiles?.full_name ?? '—'}</P>
                      <Muted>{m.profiles?.email ?? ''}</Muted>
                    </View>
                    {m.role === 'lead' ? <Badge tone="primary">Lead</Badge> : null}
                  </View>
                ))}
              </View>
              <Muted style={{ marginTop: tokens.space[4] }}>
                Submission and chat for this team live in the next prompts.
              </Muted>
            </Card>
          ) : (
            <View style={{ gap: tokens.space[4] }}>
              {hackathon.team_mode === 'organizer_assigns' && (
                <Card>
                  <H2>Waiting on the organizer</H2>
                  <P style={{ color: tokens.color.textMuted }}>
                    Teams are assigned by organizers. You'll see your team here once you're placed.
                  </P>
                </Card>
              )}
              {allowsCreate && <CreateTeamCard hackathonId={hackathon.id} onCreated={load} />}
              {allowsCode && <JoinByCodeCard hackathonId={hackathon.id} onJoined={load} />}
            </View>
          )}
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}

function CreateTeamCard({ hackathonId, onCreated }: { hackathonId: string; onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!user) return;
    setLoading(true);
    const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from('teams')
      .insert({ hackathon_id: hackathonId, name, join_code: joinCode, created_by: user.id })
      .select('id')
      .single();

    if (error || !data) {
      setLoading(false);
      Alert.alert('Could not create team', error?.message ?? 'Try a different name.');
      return;
    }

    const { error: memErr } = await supabase
      .from('team_members')
      .insert({ team_id: data.id, hackathon_id: hackathonId, user_id: user.id, role: 'lead' });
    setLoading(false);
    if (memErr) {
      Alert.alert('Team created but join failed', memErr.message);
      return;
    }
    onCreated();
  }

  return (
    <Card>
      <H2>Create a team</H2>
      <Field label="Team name"><Input value={name} onChangeText={setName} placeholder="e.g. Team Aurora" /></Field>
      <Button title="Create team" onPress={create} loading={loading} fullWidth disabled={!name.trim()} />
    </Card>
  );
}

function JoinByCodeCard({ hackathonId, onJoined }: { hackathonId: string; onJoined: () => void }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function join() {
    if (!user) return;
    setLoading(true);
    const { data: team, error } = await supabase
      .from('teams')
      .select('id')
      .eq('hackathon_id', hackathonId)
      .eq('join_code', code.trim().toUpperCase())
      .maybeSingle();
    if (error || !team) {
      setLoading(false);
      Alert.alert('Team not found', 'Check the code and try again.');
      return;
    }
    const { error: memErr } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, hackathon_id: hackathonId, user_id: user.id, role: 'member' });
    setLoading(false);
    if (memErr) {
      Alert.alert('Could not join team', memErr.message);
      return;
    }
    onJoined();
  }

  return (
    <Card>
      <H2>Join with team code</H2>
      <Field label="Team code">
        <Input value={code} onChangeText={setCode} autoCapitalize="characters" />
      </Field>
      <Button title="Join team" variant="secondary" onPress={join} loading={loading} fullWidth disabled={!code.trim()} />
    </Card>
  );
}
