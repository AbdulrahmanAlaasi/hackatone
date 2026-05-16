import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActionTile,
  Badge,
  Card,
  Display,
  Eyebrow,
  H3,
  Hero,
  Muted,
  P,
} from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/auth/AuthProvider';
import { tokens } from '../../../src/theme';

const TONES: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  accepted: 'success',
  pending: 'info',
  waitlisted: 'info',
  rejected: 'warning',
  withdrawn: 'neutral',
};

export default function HackathonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const [h, r, a] = await Promise.all([
      supabase.from('hackathons').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('registrations')
        .select('id, status, checked_in_at')
        .eq('hackathon_id', id)
        .eq('email', user.email)
        .maybeSingle(),
      supabase
        .from('announcements')
        .select('id, title, body, created_at')
        .eq('hackathon_id', id)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);
    setHackathon(h.data);
    setRegistration(r.data);
    setAnnouncements((a.data as any[]) ?? []);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!hackathon) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Muted>Loading…</Muted>
        </View>
      </SafeAreaView>
    );
  }

  const accepted = registration?.status === 'accepted';

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
        <Hero tone="peach" height={260}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Pressable onPress={() => router.back()} hitSlop={20}>
              <P style={{ color: tokens.color.text, fontWeight: '800' }}>← Back</P>
            </Pressable>
            <Eyebrow style={{ marginTop: tokens.space[5] }}>Hackathon</Eyebrow>
            <Display style={{ marginTop: 4 }}>{hackathon.title}</Display>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2], marginTop: tokens.space[4] }}>
              {registration ? (
                <Badge tone={TONES[registration.status] ?? 'neutral'}>{registration.status}</Badge>
              ) : null}
              {registration?.checked_in_at ? <Badge tone="success">✓ Checked in</Badge> : null}
              {hackathon.location ? <Badge tone="cream">📍 {hackathon.location}</Badge> : null}
            </View>
          </SafeAreaView>
        </Hero>

        {accepted ? (
          <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[2] }}>
            <H3 style={{ marginTop: tokens.space[4], marginBottom: tokens.space[3] }}>
              Quick actions
            </H3>
            <View style={{ flexDirection: 'row', gap: tokens.space[3], marginBottom: tokens.space[3] }}>
              <ActionTile
                icon="📱"
                title="My QR"
                subtitle="Show at check-in"
                tone="sunrise"
                onPress={() => router.push(`/hackathon/${hackathon.id}/qr`)}
              />
              <ActionTile
                icon="🤝"
                title="Team"
                subtitle="Members & code"
                tone="peach"
                onPress={() => router.push(`/hackathon/${hackathon.id}/team`)}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: tokens.space[3], marginBottom: tokens.space[3] }}>
              <ActionTile
                icon="🚀"
                title="Submission"
                subtitle="Edit your project"
                tone="mint"
                onPress={() => router.push(`/hackathon/${hackathon.id}/submission`)}
              />
              <ActionTile
                icon="💬"
                title="Chat"
                subtitle="Team & event"
                tone="sky"
                onPress={() => router.push(`/hackathon/${hackathon.id}/chat`)}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: tokens.space[3] }}>
              <ActionTile
                icon="🏆"
                title="Results"
                subtitle="Leaderboard"
                tone="cream"
                onPress={() => router.push(`/hackathon/${hackathon.id}/results`)}
              />
              <View style={{ flex: 1 }} />
            </View>
          </View>
        ) : registration?.status === 'pending' ? (
          <View style={{ paddingHorizontal: tokens.space[4] }}>
            <Card tone="cream" style={{ marginTop: tokens.space[4] }}>
              <H3>Pending review</H3>
              <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>
                Your registration is waiting for the organizer. You&apos;ll see check-in, team, and
                submission tools as soon as you&apos;re accepted.
              </P>
            </Card>
          </View>
        ) : null}

        {/* About */}
        {hackathon.description ? (
          <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
            <H3 style={{ marginBottom: tokens.space[2] }}>About</H3>
            <Card>
              <P>{hackathon.description}</P>
            </Card>
          </View>
        ) : null}

        {/* Schedule */}
        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
          <H3 style={{ marginBottom: tokens.space[2] }}>Schedule</H3>
          <Card>
            <Row label="Starts" value={hackathon.starts_at ? new Date(hackathon.starts_at).toLocaleString() : 'TBA'} />
            <Row label="Ends" value={hackathon.ends_at ? new Date(hackathon.ends_at).toLocaleString() : 'TBA'} />
            <Row
              label="Submission deadline"
              value={
                hackathon.submission_deadline
                  ? new Date(hackathon.submission_deadline).toLocaleString()
                  : 'TBA'
              }
              last
            />
          </Card>
        </View>

        {/* Announcements */}
        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
          <H3 style={{ marginBottom: tokens.space[2] }}>Latest announcements</H3>
          {announcements.length === 0 ? (
            <Card tone="soft">
              <Muted>No announcements yet.</Muted>
            </Card>
          ) : (
            announcements.map((a) => (
              <Card key={a.id} style={{ marginBottom: tokens.space[3] }}>
                <P style={{ fontWeight: '800' }}>{a.title}</P>
                <Muted style={{ marginTop: 2 }}>{new Date(a.created_at).toLocaleString()}</Muted>
                <P style={{ marginTop: tokens.space[2] }}>{a.body}</P>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: tokens.space[3],
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: tokens.color.border,
      }}
    >
      <Muted style={{ fontWeight: '700' }}>{label}</Muted>
      <P style={{ textAlign: 'right', flexShrink: 1, marginLeft: tokens.space[3] }}>{value}</P>
    </View>
  );
}
