import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, Field, H1, H2, Input, Muted, P, Screen } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/auth/AuthProvider';
import { tokens } from '../../../src/theme';

type Hackathon = {
  id: string;
  title: string;
  submission_deadline: string | null;
};
type Submission = {
  id: string;
  title: string;
  description: string | null;
  track_id: string | null;
  github_url: string | null;
  demo_url: string | null;
  presentation_url: string | null;
  video_url: string | null;
  screenshot_urls: string[] | null;
  status: 'draft' | 'submitted' | 'locked' | 'withdrawn';
};

export default function SubmissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [tracks, setTracks] = useState<Array<{ id: string; name: string }>>([]);
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [form, setForm] = useState<Submission>({
    id: '',
    title: '',
    description: '',
    track_id: null,
    github_url: '',
    demo_url: '',
    presentation_url: '',
    video_url: '',
    screenshot_urls: [],
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const { data: h } = await supabase
      .from('hackathons')
      .select('id, title, submission_deadline')
      .eq('id', id)
      .maybeSingle();
    setHackathon(h as Hackathon);

    const { data: t } = await supabase
      .from('hackathon_tracks')
      .select('id, name')
      .eq('hackathon_id', id);
    setTracks((t as any) ?? []);

    const { data: tm } = await supabase
      .from('team_members')
      .select('teams(id, name)')
      .eq('hackathon_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    const myTeam = ((tm as any)?.teams ?? null) as { id: string; name: string } | null;
    setTeam(myTeam);

    if (myTeam) {
      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('team_id', myTeam.id)
        .maybeSingle();
      if (sub) {
        setSubmission(sub as Submission);
        setForm({
          ...(sub as Submission),
          screenshot_urls: (sub as any).screenshot_urls ?? [],
        });
      }
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

  if (!team) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Screen>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>Submission</H1>
          <Card>
            <P>You need to be on a team before you can submit a project.</P>
            <Button
              title="Go to team"
              variant="secondary"
              onPress={() => router.replace(`/hackathon/${id}/team`)}
              style={{ marginTop: tokens.space[3] }}
            />
          </Card>
        </Screen>
      </SafeAreaView>
    );
  }

  const deadline = hackathon.submission_deadline ? new Date(hackathon.submission_deadline) : null;
  const pastDeadline = deadline ? Date.now() > deadline.getTime() : false;
  const locked = pastDeadline || submission?.status === 'locked';

  async function save(status: 'draft' | 'submitted') {
    if (!team || !user) return;
    setSaving(true);
    setSavedMsg(null);
    const payload = {
      hackathon_id: id,
      team_id: team.id,
      title: form.title,
      description: form.description,
      track_id: form.track_id || null,
      github_url: form.github_url || null,
      demo_url: form.demo_url || null,
      presentation_url: form.presentation_url || null,
      video_url: form.video_url || null,
      screenshot_urls: form.screenshot_urls ?? [],
      status,
      submitted_at: status === 'submitted' ? new Date().toISOString() : null,
      updated_by: user.id,
    };
    const { error } = submission
      ? await supabase.from('submissions').update(payload).eq('id', submission.id)
      : await supabase.from('submissions').insert(payload);
    setSaving(false);
    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    setSavedMsg(status === 'submitted' ? 'Submitted!' : 'Draft saved.');
    load();
  }

  function setField<K extends keyof Submission>(k: K, v: Submission[K]) {
    setForm((s) => ({ ...s, [k]: v }));
    setSavedMsg(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>Submission</H1>
          <Muted style={{ marginBottom: tokens.space[2] }}>
            Team: {team.name}
            {deadline ? ` · Deadline: ${deadline.toLocaleString()}` : ''}
          </Muted>
          <View style={{ flexDirection: 'row', gap: tokens.space[2], marginBottom: tokens.space[4] }}>
            <Badge tone={submission?.status === 'submitted' ? 'success' : 'info'}>
              {submission?.status ?? 'not started'}
            </Badge>
            {locked ? <Badge tone="warning">Locked</Badge> : null}
          </View>

          <Field label="Project title">
            <Input value={form.title} onChangeText={(v) => setField('title', v)} editable={!locked} />
          </Field>
          <Field label="Short description">
            <Input
              value={form.description ?? ''}
              onChangeText={(v) => setField('description', v)}
              multiline
              numberOfLines={5}
              editable={!locked}
              style={{ minHeight: 120, paddingTop: 12 }}
            />
          </Field>

          {tracks.length > 0 ? (
            <Field label="Track">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2] }}>
                {tracks.map((t) => (
                  <Badge
                    key={t.id}
                    tone={form.track_id === t.id ? 'primary' : 'neutral'}
                    style={{
                      opacity: locked ? 0.6 : 1,
                    }}
                  >
                    <P
                      onPress={() => !locked && setField('track_id', form.track_id === t.id ? null : t.id)}
                      style={{
                        color: form.track_id === t.id ? '#fff' : tokens.color.text,
                        fontWeight: '800',
                        fontSize: tokens.font.size.caption,
                      }}
                    >
                      {t.name}
                    </P>
                  </Badge>
                ))}
              </View>
            </Field>
          ) : null}

          <Field label="GitHub link">
            <Input value={form.github_url ?? ''} onChangeText={(v) => setField('github_url', v)} autoCapitalize="none" editable={!locked} />
          </Field>
          <Field label="Demo link">
            <Input value={form.demo_url ?? ''} onChangeText={(v) => setField('demo_url', v)} autoCapitalize="none" editable={!locked} />
          </Field>
          <Field label="Presentation link">
            <Input value={form.presentation_url ?? ''} onChangeText={(v) => setField('presentation_url', v)} autoCapitalize="none" editable={!locked} />
          </Field>
          <Field label="Video link">
            <Input value={form.video_url ?? ''} onChangeText={(v) => setField('video_url', v)} autoCapitalize="none" editable={!locked} />
          </Field>
          <Field label="Screenshot URLs (one per line)">
            <Input
              value={(form.screenshot_urls ?? []).join('\n')}
              onChangeText={(v) =>
                setField('screenshot_urls', v.split('\n').map((s) => s.trim()).filter(Boolean))
              }
              multiline
              numberOfLines={4}
              editable={!locked}
              autoCapitalize="none"
              style={{ minHeight: 100, paddingTop: 12 }}
            />
          </Field>

          {savedMsg ? <Muted style={{ marginBottom: 12, color: tokens.color.successText }}>{savedMsg}</Muted> : null}

          {!locked ? (
            <View style={{ gap: tokens.space[2] }}>
              <Button title="Save draft" variant="secondary" onPress={() => save('draft')} loading={saving} fullWidth />
              <Button title="Submit project" onPress={() => save('submitted')} loading={saving} fullWidth disabled={!form.title.trim()} />
            </View>
          ) : (
            <Card style={{ backgroundColor: tokens.color.surfaceSoft, borderColor: 'transparent' }}>
              <P>Submissions are locked. Talk to an organizer if you need to make changes.</P>
            </Card>
          )}
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
