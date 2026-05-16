import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Badge, Card, Display, Eyebrow, H3, Hero, Muted, P } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/auth/AuthProvider';
import { tokens } from '../../../src/theme';

export default function MyQrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<{
    registration: any;
    hackathon: any;
    team: any;
  } | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data: reg } = await supabase
        .from('registrations')
        .select('id, qr_token, status, checked_in_at, full_name')
        .eq('hackathon_id', id)
        .eq('email', user.email)
        .maybeSingle();
      const { data: h } = await supabase
        .from('hackathons')
        .select('title, slug')
        .eq('id', id)
        .maybeSingle();
      const { data: tm } = await supabase
        .from('team_members')
        .select('teams(id, name)')
        .eq('hackathon_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setData({ registration: reg, hackathon: h, team: (tm as any)?.teams ?? null });
    })();
  }, [id, user]);

  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Muted>Loading…</Muted>
        </View>
      </SafeAreaView>
    );
  }

  const { registration, hackathon, team } = data;

  if (!registration || registration.status !== 'accepted') {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Hero tone="peach" height={200}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Pressable onPress={() => router.back()} hitSlop={20}>
              <P style={{ fontWeight: '800' }}>← Back</P>
            </Pressable>
            <Display style={{ marginTop: tokens.space[5] }}>QR not available</Display>
          </SafeAreaView>
        </Hero>
        <View style={{ padding: tokens.space[4] }}>
          <Card tone="cream">
            <P>
              Your registration must be accepted before you can show your QR code.
              {'\n'}Current status: <Muted>{registration?.status ?? 'not registered'}</Muted>
            </P>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
        <Hero tone="sunrise" height={200}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Pressable onPress={() => router.back()} hitSlop={20}>
              <P style={{ color: '#fff', fontWeight: '800' }}>← Back</P>
            </Pressable>
            <Eyebrow style={{ color: '#fff', opacity: 0.9, marginTop: tokens.space[5] }}>Show at check-in</Eyebrow>
            <Display style={{ color: '#fff', marginTop: 4 }}>My QR</Display>
          </SafeAreaView>
        </Hero>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
          <Card style={{ alignItems: 'center', padding: tokens.space[6] }}>
            <View
              style={{
                padding: tokens.space[4],
                backgroundColor: '#fff',
                borderRadius: tokens.radius.lg,
              }}
            >
              <QRCode value={registration.qr_token} size={240} color={tokens.color.text} />
            </View>
            <H3 style={{ marginTop: tokens.space[5], textAlign: 'center', fontSize: 22 }}>
              {registration.full_name}
            </H3>
            <Muted style={{ textAlign: 'center' }}>{hackathon?.title}</Muted>
            <View style={{ flexDirection: 'row', gap: tokens.space[2], marginTop: tokens.space[3] }}>
              {team ? <Badge tone="info">Team: {team.name}</Badge> : null}
              {registration.checked_in_at ? <Badge tone="success">Checked in</Badge> : null}
            </View>
          </Card>

          <Card style={{ marginTop: tokens.space[3] }}>
            <Muted style={{ fontWeight: '700' }}>Token (manual entry):</Muted>
            <P
              selectable
              style={{
                fontFamily: 'Courier',
                fontSize: 12,
                color: tokens.color.textMuted,
                marginTop: tokens.space[2],
              }}
            >
              {registration.qr_token}
            </P>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
