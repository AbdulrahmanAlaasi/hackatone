import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, Display, Eyebrow, H2, H3, Hero, Muted, P } from '../../../src/components/ui';
import { Icon } from '../../../src/components/Icon';
import { supabase } from '../../../src/lib/supabase';
import { tokens } from '../../../src/theme';

type GalleryHackathon = {
  id: string;
  title: string;
  public_gallery_enabled: boolean;
};

type Submission = {
  id: string;
  title: string;
  description: string | null;
  ai_summary: string | null;
  github_url: string | null;
  demo_url: string | null;
  video_url: string | null;
  screenshot_urls: string[] | null;
  hackathon_tracks: { name: string | null } | Array<{ name: string | null }> | null;
  teams: { name: string | null } | Array<{ name: string | null }> | null;
};

function relationName(value: Submission['teams'] | Submission['hackathon_tracks']) {
  if (Array.isArray(value)) return value[0]?.name ?? null;
  return value?.name ?? null;
}

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [hackathon, setHackathon] = useState<GalleryHackathon | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: h } = await supabase
        .from('hackathons')
        .select('id, title, public_gallery_enabled')
        .eq('id', id)
        .maybeSingle();
      const nextHackathon = h as GalleryHackathon | null;
      setHackathon(nextHackathon);

      if (nextHackathon?.public_gallery_enabled) {
        const { data } = await supabase
          .from('submissions')
          .select('id, title, description, ai_summary, github_url, demo_url, video_url, screenshot_urls, hackathon_tracks(name), teams(name)')
          .eq('hackathon_id', id)
          .in('status', ['submitted', 'locked'])
          .order('submitted_at', { ascending: false });
        setSubmissions((data as any) ?? []);
      } else {
        setSubmissions([]);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 72 }} showsVerticalScrollIndicator={false}>
        <Hero tone="sunrise" height={230}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Pressable onPress={() => router.back()} hitSlop={20} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon.ArrowLeft size={18} color="#fff" />
              <P style={{ color: '#fff', fontWeight: '800' }}>Back</P>
            </Pressable>
            <Eyebrow style={{ color: '#fff', opacity: 0.9, marginTop: tokens.space[5] }}>Public gallery</Eyebrow>
            <Display style={{ color: '#fff', marginTop: 4 }}>{hackathon?.title ?? 'Projects'}</Display>
            <P style={{ color: '#fff', opacity: 0.95, marginTop: tokens.space[2] }}>
              {submissions.length} submitted project{submissions.length === 1 ? '' : 's'} visible.
            </P>
          </SafeAreaView>
        </Hero>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[5] }}>
          {loading ? (
            <Card>
              <Muted>Loading gallery...</Muted>
            </Card>
          ) : !hackathon?.public_gallery_enabled ? (
            <Card tone="cream">
              <H3>Gallery is hidden</H3>
              <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>
                Organizers can open the public project gallery from the web dashboard.
              </P>
            </Card>
          ) : submissions.length === 0 ? (
            <Card tone="cream">
              <H3>No public projects yet</H3>
              <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[2] }}>
                Submitted projects will appear here when teams publish their work.
              </P>
            </Card>
          ) : (
            submissions.map((submission) => <ProjectCard key={submission.id} submission={submission} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ProjectCard({ submission }: { submission: Submission }) {
  const track = relationName(submission.hackathon_tracks);
  const team = relationName(submission.teams);
  const screenshot = submission.screenshot_urls?.[0];
  const summary = submission.ai_summary || submission.description || 'No description provided.';

  return (
    <Card style={{ marginBottom: tokens.space[3], overflow: 'hidden', padding: 0 }}>
      {screenshot ? (
        <Image source={{ uri: screenshot }} style={{ width: '100%', height: 150, backgroundColor: tokens.color.surfaceSoft }} />
      ) : (
        <View
          style={{
            height: 128,
            backgroundColor: '#FFE3BC',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <H2 style={{ color: tokens.color.primaryPressed }}>{submission.title.slice(0, 2).toUpperCase()}</H2>
        </View>
      )}
      <View style={{ padding: tokens.space[5] }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.space[3] }}>
          <View style={{ flex: 1 }}>
            <H2 style={{ marginBottom: 2 }}>{submission.title}</H2>
            {team ? <Muted>by {team}</Muted> : null}
          </View>
          {track ? <Badge tone="cream">{track}</Badge> : null}
        </View>
        <P style={{ color: tokens.color.textMuted, marginTop: tokens.space[3] }} numberOfLines={4}>{summary}</P>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2], marginTop: tokens.space[4] }}>
          {submission.demo_url ? <LinkPill label="Demo" url={submission.demo_url} /> : null}
          {submission.github_url ? <LinkPill label="GitHub" url={submission.github_url} /> : null}
          {submission.video_url ? <LinkPill label="Video" url={submission.video_url} /> : null}
        </View>
      </View>
    </Card>
  );
}

function LinkPill({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [
        {
          borderRadius: tokens.radius.full,
          backgroundColor: tokens.color.surfaceSoft,
          paddingHorizontal: tokens.space[3],
          paddingVertical: 9,
          transform: pressed ? [{ scale: 0.97 }] : [],
        },
      ]}
    >
      <Muted style={{ color: tokens.color.primaryPressed, fontWeight: '900' }}>{label}</Muted>
    </Pressable>
  );
}
