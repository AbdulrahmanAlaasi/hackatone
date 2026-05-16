import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Badge, Button, Card, H1, H2, Muted, P, Screen } from '../../../src/components/ui';
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
        <Screen>
          <Muted>Loading…</Muted>
        </Screen>
      </SafeAreaView>
    );
  }

  const { registration, hackathon, team } = data;

  if (!registration || registration.status !== 'accepted') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Screen>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>QR not available</H1>
          <Card>
            <P>
              Your registration must be accepted before you can show your QR code. Current status:{' '}
              <Muted>{registration?.status ?? 'not registered'}</Muted>
            </P>
          </Card>
        </Screen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>My QR</H1>
          <Muted style={{ marginBottom: tokens.space[5] }}>
            Show this to the organizer at check-in.
          </Muted>

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
            <H2 style={{ marginTop: tokens.space[5], textAlign: 'center' }}>{registration.full_name}</H2>
            <Muted style={{ textAlign: 'center' }}>{hackathon?.title}</Muted>
            {team ? <Badge tone="info" style={{ marginTop: tokens.space[2] }}>Team: {team.name}</Badge> : null}
            {registration.checked_in_at ? (
              <Badge tone="success" style={{ marginTop: tokens.space[2] }}>Already checked in</Badge>
            ) : null}
          </Card>

          <Card style={{ marginTop: tokens.space[4] }}>
            <Muted>Token (for manual entry):</Muted>
            <P
              selectable
              style={{
                fontFamily: 'Courier',
                fontSize: 12,
                color: tokens.color.text,
                marginTop: tokens.space[2],
              }}
            >
              {registration.qr_token}
            </P>
          </Card>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
