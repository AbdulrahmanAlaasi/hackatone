import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Splash } from '../../src/components/Splash';
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
  return email.split('@')[0].split('.')[0].replace(/^\w/, (c) => c.toUpperCase());
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setRefreshing(true);
    const [regsRes, profileRes] = await Promise.all([
      supabase
        .from('registrations')
        .select('id, status, hackathons(id, title, slug, starts_at, ends_at, location, status)')
        .eq('email', user.email)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    ]);
    setRows((regsRes.data as any) ?? []);
    setProfileName((profileRes.data as any)?.full_name ?? null);
    setRefreshing(false);
  }, [user?.email, user?.id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (rows === null) {
    return <Splash tagline="Loading your hackathons…" />;
  }

  const accepted = rows.filter((r) => r.status === 'accepted' && r.hackathons);
  const pending = rows.filter((r) => r.status !== 'accepted' && r.hackathons);
  const name = firstName(user?.email ?? undefined, profileName);

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
                : 'No hackathons yet — register from the organizer’s link to get started.'}
            </P>
          </SafeAreaView>
        </Hero>

        {/* Accepted hackathons */}
        <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
          {accepted.length > 0 && (
            <>
              <Card tone="surface" style={{ shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }}>
                <Eyebrow>Up next</Eyebrow>
                <H2 style={{ marginTop: 6, marginBottom: 4 }}>{accepted[0].hackathons!.title}</H2>
                <Muted>
                  {accepted[0].hackathons!.location ?? 'Location TBA'}
                  {accepted[0].hackathons!.starts_at
                    ? ` · ${new Date(accepted[0].hackathons!.starts_at).toLocaleDateString()}`
                    : ''}
                </Muted>
                <Pressable
                  onPress={() => router.push(`/hackathon/${accepted[0].hackathons!.id}`)}
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
                Scan an organizer&apos;s registration QR or open their link, then come back here.
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
                      <P style={{ fontSize: 26 }}>
                        {item.status === 'accepted' ? '🚀' : item.status === 'pending' ? '⏳' : '📨'}
                      </P>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <P style={{ fontWeight: '800' }} numberOfLines={1}>
                        {h.title}
                      </P>
                      <Muted numberOfLines={1}>
                        {h.location ?? 'Location TBA'}
                        {h.starts_at ? ` · ${new Date(h.starts_at).toLocaleDateString()}` : ''}
                      </Muted>
                    </View>
                    <Badge tone={TONES[item.status] ?? 'neutral'}>{item.status}</Badge>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
