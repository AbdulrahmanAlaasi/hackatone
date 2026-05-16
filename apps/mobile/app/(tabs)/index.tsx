import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, H1, H2, Muted, P, Screen } from '../../src/components/ui';
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

export default function HomeScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setRefreshing(true);
    const { data } = await supabase
      .from('registrations')
      .select('id, status, hackathons(id, title, slug, starts_at, ends_at, location, status)')
      .eq('email', user.email)
      .order('created_at', { ascending: false });
    setRows((data as any) ?? []);
    setRefreshing(false);
  }, [user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (rows === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={tokens.color.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }} edges={['top']}>
      <Screen>
        <H1>My hackathons</H1>
        <Muted style={{ marginBottom: tokens.space[4] }}>
          Hackathons linked to {user?.email}.
        </Muted>

        <FlatList
          data={rows}
          keyExtractor={(r) => r.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          ItemSeparatorComponent={() => <View style={{ height: tokens.space[3] }} />}
          ListEmptyComponent={
            <Card>
              <H2>No hackathons yet</H2>
              <P style={{ color: tokens.color.textMuted }}>
                Register for a hackathon from the organizer's link or QR code, then come back here.
              </P>
            </Card>
          }
          renderItem={({ item }) => {
            const h = item.hackathons;
            if (!h) return null;
            return (
              <Link href={`/hackathon/${h.id}`} asChild>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: tokens.space[3] }}>
                    <View style={{ flex: 1 }}>
                      <H2 style={{ marginBottom: 4 }}>{h.title}</H2>
                      <Muted>
                        {h.location ?? 'Location TBA'}
                        {h.starts_at ? ` · ${new Date(h.starts_at).toLocaleDateString()}` : ''}
                      </Muted>
                    </View>
                    <Badge tone={TONES[item.status] ?? 'neutral'}>{item.status}</Badge>
                  </View>
                </Card>
              </Link>
            );
          }}
        />
      </Screen>
    </SafeAreaView>
  );
}
