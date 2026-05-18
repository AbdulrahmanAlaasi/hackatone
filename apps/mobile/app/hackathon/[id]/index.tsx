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

type AgendaItem = {
  label: string;
  value: string;
  at: Date | null;
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

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'TBA';
}

function buildAgenda(hackathon: any): AgendaItem[] {
  return [
    { label: 'Registration closes', value: formatDateTime(hackathon.registration_deadline), at: hackathon.registration_deadline ? new Date(hackathon.registration_deadline) : null },
    { label: 'Hackathon starts', value: formatDateTime(hackathon.starts_at), at: hackathon.starts_at ? new Date(hackathon.starts_at) : null },
    { label: 'Submission deadline', value: formatDateTime(hackathon.submission_deadline), at: hackathon.submission_deadline ? new Date(hackathon.submission_deadline) : null },
    { label: 'Hackathon ends', value: formatDateTime(hackathon.ends_at), at: hackathon.ends_at ? new Date(hackathon.ends_at) : null },
  ];
}

function countdownText(target: Date | null) {
  if (!target) return 'Date TBA';
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'Now';
  const minutes = Math.ceil(diff / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function nextAgendaItem(items: AgendaItem[]) {
  return items.find((item) => item.at && item.at.getTime() > Date.now()) ?? null;
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
  const agenda = buildAgenda(hackathon);
  const nextUp = nextAgendaItem(agenda);

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
              <EventStat label="Next up" value={nextUp?.label ?? 'Schedule clear'} />
              <EventStat label="Countdown" value={countdownText(nextUp?.at ?? null)} />
            </View>
            <View style={{ flexDirection: 'row', gap: tokens.space[3], marginTop: tokens.space[3] }}>
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
              {hackathon.public_gallery_enabled ? (
                <ActionTile
                  Icon={Icon.Image}
                  title="Gallery"
                  subtitle="Public projects"
                  tone="cream"
                  onPress={() => router.push(`/hackathon/${hackathon.id}/gallery`)}
                />
              ) : (
                <ActionTile
                  Icon={Icon.Trophy}
                  title="Results"
                  subtitle="Leaderboard"
                  tone="cream"
                  onPress={() => router.push(`/hackathon/${hackathon.id}/results`)}
                />
              )}
              {hackathon.public_gallery_enabled ? (
                <ActionTile
                  Icon={Icon.Trophy}
                  title="Results"
                  subtitle="Leaderboard"
                  tone="plain"
                  onPress={() => router.push(`/hackathon/${hackathon.id}/results`)}
                />
              ) : hackathon.location ? (
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
            {hackathon.public_gallery_enabled && hackathon.location ? (
              <View style={{ marginTop: tokens.space[3] }}>
                <ActionTile
                  Icon={Icon.Map}
                  title="Directions"
                  subtitle="Open in Maps"
                  tone="plain"
                  onPress={() => openInMaps(hackathon.location)}
                />
              </View>
            ) : null}
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

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
          <H3 style={{ marginBottom: tokens.space[2] }}>Event agenda</H3>
          <View style={{ gap: tokens.space[3] }}>
            {agenda.map((item, index) => (
              <AgendaRow key={item.label} item={item} index={index} />
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
          <H3 style={{ marginBottom: tokens.space[2] }}>Location</H3>
          <Card>
            <Muted style={{ fontWeight: '800' }}>Venue</Muted>
            <P style={{ marginTop: 4, fontWeight: '800' }}>{hackathon.location ?? 'Location TBA'}</P>
            <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[3] }}>
              {accepted
                ? 'Bring your QR pass for check-in. Organizers can share room, entrance, and Wi-Fi details in announcements.'
                : 'Once accepted, keep an eye on announcements for check-in and venue notes.'}
            </P>
            {hackathon.location ? (
              <Pressable
                onPress={() => openInMaps(hackathon.location)}
                style={({ pressed }) => [
                  {
                    marginTop: tokens.space[4],
                    borderRadius: tokens.radius.full,
                    paddingVertical: 13,
                    alignItems: 'center',
                    backgroundColor: tokens.color.primary,
                    transform: pressed ? [{ scale: 0.98 }] : [],
                  },
                ]}
              >
                <P style={{ color: '#fff', fontWeight: '800' }}>Open directions</P>
              </Pressable>
            ) : null}
          </Card>
        </View>

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
          <H3 style={{ marginBottom: tokens.space[2] }}>Schedule details</H3>
          <Card>
            <Row label="Starts" value={formatDateTime(hackathon.starts_at)} />
            <Row label="Ends" value={formatDateTime(hackathon.ends_at)} />
            <Row
              label="Submission deadline"
              value={formatDateTime(hackathon.submission_deadline)}
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

function AgendaRow({ item, index }: { item: AgendaItem; index: number }) {
  const done = item.at ? item.at.getTime() < Date.now() : false;
  return (
    <Card tone={done ? 'soft' : index === 0 ? 'cream' : 'surface'} style={{ flexDirection: 'row', gap: tokens.space[3], alignItems: 'center' }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: done ? tokens.color.surface : tokens.color.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <P style={{ color: done ? tokens.color.textMuted : '#fff', fontWeight: '900' }}>{index + 1}</P>
      </View>
      <View style={{ flex: 1 }}>
        <P style={{ fontWeight: '800' }}>{item.label}</P>
        <Muted style={{ marginTop: 2 }}>{item.value}</Muted>
      </View>
      <Badge tone={done ? 'neutral' : 'info'}>{done ? 'done' : countdownText(item.at)}</Badge>
    </Card>
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
