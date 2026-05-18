import { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
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
import { Icon } from '../../../src/components/Icon';
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

type Track = {
  id: string;
  name: string;
  description: string | null;
};

function openInMaps(query: string) {
  const q = encodeURIComponent(query);
  const url = Platform.select({
    ios: `http://maps.apple.com/?q=${q}`,
    android: `geo:0,0?q=${q}`,
    default: `https://www.google.com/maps/search/?api=1&query=${q}`,
  });
  if (url) Linking.openURL(url);
}

export default function HackathonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [organization, setOrganization] = useState<{ name: string; logo_url: string | null } | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const [h, r, a, t] = await Promise.all([
      supabase
        .from('hackathons')
        .select('*, organizations(name, logo_url)')
        .eq('id', id)
        .maybeSingle(),
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
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('hackathon_tracks')
        .select('id, name, description')
        .eq('hackathon_id', id)
        .order('created_at', { ascending: true }),
    ]);
    setHackathon(h.data);
    setOrganization((h.data?.organizations as any) ?? null);
    setRegistration(r.data);
    setAnnouncements((a.data as any[]) ?? []);
    setTracks((t.data as Track[]) ?? []);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!hackathon) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Muted>Loading...</Muted>
        </View>
      </SafeAreaView>
    );
  }

  const accepted = registration?.status === 'accepted';
  const startsAt = hackathon.starts_at ? new Date(hackathon.starts_at).toLocaleDateString() : 'TBA';
  const deadline = hackathon.submission_deadline ? new Date(hackathon.submission_deadline).toLocaleDateString() : 'TBA';

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
        <Hero tone="peach" height={280}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Pressable onPress={() => router.back()} hitSlop={20} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon.ArrowLeft size={18} color={tokens.color.text} />
              <P style={{ color: tokens.color.text, fontWeight: '800' }}>Back</P>
            </Pressable>

            {organization ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[2], marginTop: tokens.space[4] }}>
                {organization.logo_url ? (
                  <Image
                    source={{ uri: organization.logo_url }}
                    style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff' }}
                  />
                ) : (
                  <View
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      backgroundColor: tokens.color.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <P style={{ color: '#fff', fontWeight: '800' }}>{organization.name.slice(0, 1)}</P>
                  </View>
                )}
                <Muted style={{ fontWeight: '800', color: tokens.color.primaryPressed, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {organization.name}
                </Muted>
              </View>
            ) : null}

            <Eyebrow style={{ marginTop: tokens.space[3] }}>Hackathon</Eyebrow>
            <Display style={{ marginTop: 4 }}>{hackathon.title}</Display>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2], marginTop: tokens.space[4] }}>
              {registration ? (
                <Badge tone={TONES[registration.status] ?? 'neutral'}>{registration.status}</Badge>
              ) : null}
              {registration?.checked_in_at ? <Badge tone="success">Checked in</Badge> : null}
              {hackathon.field ? <Badge tone="cream">{hackathon.field}</Badge> : null}
              {hackathon.location ? <Badge tone="cream">{hackathon.location}</Badge> : null}
            </View>
          </SafeAreaView>
        </Hero>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
          <Card tone="surface" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } }}>
            <View style={{ flexDirection: 'row', gap: tokens.space[3] }}>
              <EventStat label="Status" value={registration?.status ?? hackathon.status ?? 'open'} />
              <EventStat label="Starts" value={startsAt} />
              <EventStat label="Submit by" value={deadline} />
            </View>
            {registration?.checked_in_at ? (
              <Badge tone="success" style={{ marginTop: tokens.space[3] }}>Checked in</Badge>
            ) : registration?.status === 'accepted' ? (
              <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[3] }}>
                You are accepted. Keep your QR ready for check-in.
              </P>
            ) : null}
          </Card>
        </View>

        {accepted ? (
          <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
            <H3 style={{ marginTop: tokens.space[4], marginBottom: tokens.space[3] }}>
              Quick actions
            </H3>
            <View style={{ flexDirection: 'row', gap: tokens.space[3], marginBottom: tokens.space[3] }}>
              <ActionTile
                Icon={Icon.QrCode}
                title="My QR"
                subtitle="Show at check-in"
                tone="sunrise"
                onPress={() => router.push(`/hackathon/${hackathon.id}/qr`)}
              />
              <ActionTile
                Icon={Icon.Users}
                title="Team"
                subtitle="Members & code"
                tone="peach"
                onPress={() => router.push(`/hackathon/${hackathon.id}/team`)}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: tokens.space[3], marginBottom: tokens.space[3] }}>
              <ActionTile
                Icon={Icon.Rocket}
                title="Submission"
                subtitle="Edit your project"
                tone="mint"
                onPress={() => router.push(`/hackathon/${hackathon.id}/submission`)}
              />
              <ActionTile
                Icon={Icon.MessageCircle}
                title="Chat"
                subtitle="Team & event"
                tone="sky"
                onPress={() => router.push(`/hackathon/${hackathon.id}/chat`)}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: tokens.space[3] }}>
              <ActionTile
                Icon={Icon.Trophy}
                title="Results"
                subtitle="Leaderboard"
                tone="cream"
                onPress={() => router.push(`/hackathon/${hackathon.id}/results`)}
              />
              {hackathon.location ? (
                <ActionTile
                  Icon={Icon.Map}
                  title="Directions"
                  subtitle="Open in Maps"
                  tone="plain"
                  onPress={() => openInMaps(hackathon.location)}
                />
              ) : (
                <View style={{ flex: 1 }} />
              )}
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

        {hackathon.description ? (
          <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
            <H3 style={{ marginBottom: tokens.space[2] }}>About</H3>
            <Card>
              <P>{hackathon.description}</P>
            </Card>
          </View>
        ) : null}

        {tracks.length > 0 ? (
          <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
            <H3 style={{ marginBottom: tokens.space[2] }}>Tracks</H3>
            <View style={{ gap: tokens.space[3] }}>
              {tracks.map((track) => (
                <Card key={track.id} tone="soft">
                  <P style={{ fontWeight: '800' }}>{track.name}</P>
                  {track.description ? (
                    <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>{track.description}</P>
                  ) : null}
                </Card>
              ))}
            </View>
          </View>
        ) : null}

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

function EventStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 74,
        borderRadius: tokens.radius.md,
        backgroundColor: tokens.color.surfaceSoft,
        padding: tokens.space[3],
        justifyContent: 'center',
      }}
    >
      <Muted style={{ fontWeight: '800' }}>{label}</Muted>
      <P style={{ fontWeight: '900', marginTop: 4 }} numberOfLines={2}>{value}</P>
    </View>
  );
}
