import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { PUBLIC_WEB_URL } from '@hackatone/shared';
import { Splash } from '../../src/components/Splash';
import { Icon } from '../../src/components/Icon';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Badge,
  Card,
  Display,
  Eyebrow,
  H2,
  H3,
  Hero,
  Muted,
  P,
} from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/auth/AuthProvider';
import { tokens } from '../../src/theme';

type Row = {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
  hackathons: {
    id: string;
    title: string;
    slug: string;
    starts_at: string | null;
    ends_at: string | null;
    location: string | null;
    status: string;
  } | null;
};

type PublicHackathon = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  field: string | null;
  location: string | null;
  starts_at: string | null;
  registration_deadline: string | null;
  organizations: { name: string | null } | Array<{ name: string | null }> | null;
};

const TONES: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  accepted: 'success',
  pending: 'info',
  waitlisted: 'info',
  rejected: 'warning',
  withdrawn: 'neutral',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function firstName(email: string | undefined, fullName: string | null) {
  if (fullName) return fullName.split(' ')[0];
  if (!email) return 'there';
  return (email.split('@')[0]?.split('.')[0] ?? 'there').replace(/^\w/, (c) => c.toUpperCase());
}

function organizationName(organizations: PublicHackathon['organizations']) {
  if (Array.isArray(organizations)) return organizations[0]?.name ?? 'Hackatone organizer';
  return organizations?.name ?? 'Hackatone organizer';
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : null;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [publicHackathons, setPublicHackathons] = useState<PublicHackathon[]>([]);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [publicExpanded, setPublicExpanded] = useState(true);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setRefreshing(true);
    const [regsRes, profileRes, publicRes] = await Promise.all([
      supabase
        .from('registrations')
        .select('id, status, hackathons(id, title, slug, starts_at, ends_at, location, status)')
        .eq('email', user.email)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
      supabase
        .from('hackathons')
        .select('id, title, slug, description, field, location, starts_at, registration_deadline, organizations(name)')
        .eq('visibility', 'public')
        .eq('status', 'registration_open')
        .order('starts_at', { ascending: true })
        .limit(8),
    ]);
    setRows((regsRes.data as any) ?? []);
    setPublicHackathons((publicRes.data as any) ?? []);
    setProfileName((profileRes.data as any)?.full_name ?? null);
    setRefreshing(false);
  }, [user?.email, user?.id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (rows === null) {
    return <Splash tagline="Loading your hackathons..." />;
  }

  const accepted = rows.filter((r) => r.status === 'accepted' && r.hackathons);
  const pending = rows.filter((r) => r.status !== 'accepted' && r.hackathons);
  const nextHackathon = accepted[0]?.hackathons;
  const registeredByHackathonId = rows.reduce(
    (acc, row) => {
      if (row.hackathons?.id) acc[row.hackathons.id] = row.status;
      return acc;
    },
    {} as Record<string, Row['status']>,
  );
  const name = firstName(user?.email ?? undefined, profileName);
  const openPublicCount = publicHackathons.filter((h) => !registeredByHackathonId[h.id]).length;

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={tokens.color.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Hero tone="sunrise" height={260}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Eyebrow style={{ color: '#fff', opacity: 0.9 }}>{greeting()}</Eyebrow>
            <Display style={{ color: '#fff', marginTop: 6 }}>{name},</Display>
            <Display style={{ color: '#fff' }}>welcome back.</Display>
            <P style={{ color: '#fff', opacity: 0.95, marginTop: 12 }}>
              {accepted.length > 0
                ? `You're in ${accepted.length} hackathon${accepted.length === 1 ? '' : 's'}. Let's get to work.`
                : pending.length > 0
                ? `${pending.length} application${pending.length === 1 ? '' : 's'} pending review.`
                : 'No hackathons yet. Find an open public hackathon below.'}
            </P>
          </SafeAreaView>
        </Hero>

        {/* Accepted hackathons */}
        <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
          <Card
            tone="surface"
            style={{
              marginBottom: tokens.space[4],
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <View style={{ flexDirection: 'row', gap: tokens.space[3] }}>
              <DashboardStat label="Active" value={accepted.length} tone="mint" />
              <DashboardStat label="Pending" value={pending.length} tone="sky" />
              <DashboardStat label="Open" value={openPublicCount} tone="cream" />
            </View>
          </Card>

          {nextHackathon && (
            <>
              <Card tone="surface" style={{ shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }}>
                <Eyebrow>Up next</Eyebrow>
                <H2 style={{ marginTop: 6, marginBottom: 4 }}>{nextHackathon.title}</H2>
                <Muted>
                  {nextHackathon.location ?? 'Location TBA'}
                  {nextHackathon.starts_at
                    ? ` - ${new Date(nextHackathon.starts_at).toLocaleDateString()}`
                    : ''}
                </Muted>
                <Pressable
                  onPress={() => router.push(`/hackathon/${nextHackathon.id}`)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: tokens.color.primary,
                      paddingVertical: 14,
                      borderRadius: tokens.radius.full,
                      alignItems: 'center',
                      marginTop: tokens.space[4],
                      transform: pressed ? [{ scale: 0.97 }] : [],
                    },
                  ]}
                >
                  <P style={{ color: '#fff', fontWeight: '800' }}>Open hackathon</P>
                </Pressable>
              </Card>
            </>
          )}
        </View>

        {/* Your hackathons list */}
        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
          <H3 style={{ marginBottom: tokens.space[3] }}>Your hackathons</H3>

          {rows.length === 0 ? (
            <Card tone="cream">
              <H3>No hackathons yet</H3>
              <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>
                Apply to one of the public hackathons below. Your application status will appear here.
              </P>
            </Card>
          ) : (
            rows.map((item) => {
              const h = item.hackathons;
              if (!h) return null;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/hackathon/${h.id}`)}
                  style={({ pressed }) => [{ transform: pressed ? [{ scale: 0.99 }] : [] }]}
                >
                  <Card
                    style={{
                      marginBottom: tokens.space[3],
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: tokens.space[3],
                    }}
                  >
                    {/* Little color swatch */}
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 20,
                        backgroundColor:
                          item.status === 'accepted'
                            ? '#FFE2BD'
                            : item.status === 'pending'
                            ? tokens.color.info
                            : tokens.color.surfaceSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.status === 'accepted' ? (
                        <Icon.Rocket size={26} color={tokens.color.primaryPressed} />
                      ) : item.status === 'pending' ? (
                        <Icon.Hourglass size={24} color="#1d3a5b" />
                      ) : (
                        <Icon.Mail size={22} color={tokens.color.textMuted} />
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <P style={{ fontWeight: '800' }} numberOfLines={1}>
                        {h.title}
                      </P>
                      <Muted numberOfLines={1}>
                        {h.location ?? 'Location TBA'}
                        {h.starts_at ? ` - ${new Date(h.starts_at).toLocaleDateString()}` : ''}
                      </Muted>
                    </View>
                    <Badge tone={TONES[item.status] ?? 'neutral'}>{item.status}</Badge>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[6] }}>
          <Pressable
            onPress={() => setPublicExpanded((value) => !value)}
            style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}
          >
            <Card tone="cream" style={{ marginBottom: publicExpanded ? tokens.space[3] : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[3] }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 18,
                    backgroundColor: '#FFD8B8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.Rocket size={24} color={tokens.color.primaryPressed} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <H3>Browse public hackathons</H3>
                  <Muted numberOfLines={1}>
                    {openPublicCount > 0
                      ? `${openPublicCount} open to apply`
                      : publicHackathons.length > 0
                      ? 'You already applied to all visible hackathons'
                      : 'No open public hackathons yet'}
                  </Muted>
                </View>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    backgroundColor: tokens.color.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: publicExpanded ? [{ rotate: '180deg' }] : [],
                  }}
                >
                  <Icon.ChevronDown size={20} color={tokens.color.primaryPressed} />
                </View>
              </View>
            </Card>
          </Pressable>

          {publicExpanded ? (
            publicHackathons.length === 0 ? (
              <Card tone="surface">
                <H3>No public hackathons open</H3>
                <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>
                  Check back soon for new registration opportunities.
                </P>
              </Card>
            ) : (
              publicHackathons.map((hackathon) => {
                const status = registeredByHackathonId[hackathon.id];
                const applyUrl = `${PUBLIC_WEB_URL}/register/${hackathon.slug}`;

                return (
                  <Card key={hackathon.id} tone="surface" style={{ marginBottom: tokens.space[3], overflow: 'hidden' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.space[3] }}>
                      <Badge tone={status ? 'info' : 'success'}>{status ? `registered: ${status}` : 'open'}</Badge>
                      {hackathon.field ? <Muted numberOfLines={1}>{hackathon.field}</Muted> : null}
                    </View>

                    <H2 style={{ marginTop: tokens.space[3], marginBottom: 4 }}>{hackathon.title}</H2>
                    <Muted numberOfLines={1}>By {organizationName(hackathon.organizations)}</Muted>

                    {hackathon.description ? (
                      <P style={{ marginTop: tokens.space[3], color: tokens.color.textMuted }} numberOfLines={3}>
                        {hackathon.description}
                      </P>
                    ) : (
                      <P style={{ marginTop: tokens.space[3], color: tokens.color.textMuted }}>
                        Registration is open for this public hackathon.
                      </P>
                    )}

                    <View style={{ gap: 8, marginTop: tokens.space[4] }}>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Icon.Pin size={16} color={tokens.color.textMuted} />
                        <Muted style={{ flex: 1 }} numberOfLines={1}>{hackathon.location ?? 'Location TBA'}</Muted>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Icon.Calendar size={16} color={tokens.color.textMuted} />
                        <Muted>
                          {formatDate(hackathon.starts_at) ?? 'Date TBA'}
                          {hackathon.registration_deadline ? ` - Apply by ${formatDate(hackathon.registration_deadline)}` : ''}
                        </Muted>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => Linking.openURL(applyUrl)}
                      disabled={!!status}
                      style={({ pressed }) => [
                        {
                          marginTop: tokens.space[4],
                          borderRadius: tokens.radius.full,
                          paddingVertical: 14,
                          alignItems: 'center',
                          backgroundColor: status ? tokens.color.surfaceSoft : tokens.color.primary,
                          transform: pressed && !status ? [{ scale: 0.97 }] : [],
                        },
                      ]}
                    >
                      <P style={{ color: status ? tokens.color.text : '#fff', fontWeight: '800' }}>
                        {status ? 'Already applied' : 'Apply now'}
                      </P>
                    </Pressable>

                    <Muted numberOfLines={1} style={{ marginTop: tokens.space[2], textAlign: 'center' }}>
                      {applyUrl}
                    </Muted>
                  </Card>
                );
              })
            )
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function DashboardStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'cream' | 'mint' | 'sky';
}) {
  const bg = tone === 'mint' ? '#D8F3E5' : tone === 'sky' ? '#DDEEFF' : '#FFF1DE';

  return (
    <View
      style={{
        flex: 1,
        minHeight: 78,
        borderRadius: tokens.radius.md,
        backgroundColor: bg,
        padding: tokens.space[3],
        justifyContent: 'center',
      }}
    >
      <P style={{ fontSize: 24, fontWeight: '900', lineHeight: 28 }}>{value}</P>
      <Muted style={{ fontWeight: '800', marginTop: 2 }}>{label}</Muted>
    </View>
  );
}
