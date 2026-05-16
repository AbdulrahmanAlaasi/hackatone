import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, Display, Eyebrow, H3, Hero, Muted, P } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/auth/AuthProvider';
import { tokens } from '../../src/theme';

export default function QrTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<Array<{
    id: string;
    title: string;
    location: string | null;
    checked_in: boolean;
  }> | null>(null);

  const load = useCallback(async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from('registrations')
      .select('checked_in_at, hackathons(id, title, location)')
      .eq('email', user.email)
      .eq('status', 'accepted');
    setList(
      ((data as any[]) ?? []).map((r) => ({
        id: r.hackathons?.id,
        title: r.hackathons?.title,
        location: r.hackathons?.location,
        checked_in: !!r.checked_in_at,
      })).filter((r) => r.id),
    );
  }, [user?.email]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Hero tone="sunrise" height={220}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Eyebrow style={{ color: '#fff', opacity: 0.9 }}>Quick access</Eyebrow>
            <Display style={{ color: '#fff', marginTop: 4 }}>My QR codes</Display>
            <P style={{ color: '#fff', opacity: 0.95, marginTop: 12 }}>
              Show your QR to an organizer to check in to a hackathon.
            </P>
          </SafeAreaView>
        </Hero>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[5] }}>
          <H3 style={{ marginBottom: tokens.space[3] }}>Pick a hackathon</H3>

          {list === null ? (
            <Muted>Loading…</Muted>
          ) : list.length === 0 ? (
            <Card tone="cream">
              <H3>Not in any hackathon yet</H3>
              <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>
                Once an organizer accepts your registration, your QR will appear here.
              </P>
            </Card>
          ) : (
            list.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => router.push(`/hackathon/${h.id}/qr`)}
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
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      backgroundColor: tokens.color.surfaceSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <P style={{ fontSize: 24 }}>📱</P>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <P style={{ fontWeight: '800' }} numberOfLines={1}>{h.title}</P>
                    {h.location ? <Muted numberOfLines={1}>📍 {h.location}</Muted> : null}
                  </View>
                  {h.checked_in ? <Badge tone="success">✓ In</Badge> : <Badge tone="cream">Tap</Badge>}
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
