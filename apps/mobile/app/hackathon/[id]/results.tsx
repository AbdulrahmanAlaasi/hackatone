import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, H1, H2, Muted, P, Screen } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { tokens } from '../../../src/theme';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [published, setPublished] = useState<boolean | null>(null);
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: h } = await supabase
        .from('hackathons')
        .select('title, leaderboard_published')
        .eq('id', id)
        .maybeSingle();
      if (!h) {
        setPublished(false);
        return;
      }
      setHackathonTitle(h.title);
      setPublished(h.leaderboard_published);
      if (h.leaderboard_published) {
        const { data: r } = await supabase
          .from('leaderboard_results')
          .select('rank, total_score, is_winner, submissions(title, teams(name))')
          .eq('hackathon_id', id)
          .order('rank', { ascending: true });
        setRows(r ?? []);
      }
    })();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1>Results</H1>
          <Muted style={{ marginBottom: tokens.space[4] }}>{hackathonTitle}</Muted>

          {published === null ? (
            <Muted>Loading…</Muted>
          ) : !published ? (
            <Card>
              <P>Results haven't been published yet. Check back later.</P>
            </Card>
          ) : (
            rows.map((r) => (
              <Card key={r.submissions?.title} style={{ marginBottom: tokens.space[3] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[3] }}>
                  <H2 style={{ marginBottom: 0 }}>#{r.rank}</H2>
                  <View style={{ flex: 1 }}>
                    <P style={{ fontWeight: '800' }}>{r.submissions?.title}</P>
                    <Muted>{r.submissions?.teams?.name ?? '—'}</Muted>
                  </View>
                  {r.is_winner ? <Badge tone="primary">Winner</Badge> : null}
                </View>
                <Muted style={{ marginTop: tokens.space[2] }}>
                  Score: {Number(r.total_score).toFixed(2)}
                </Muted>
              </Card>
            ))
          )}
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
