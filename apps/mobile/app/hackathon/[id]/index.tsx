import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, H1, H2, Muted, P, Screen } from '../../../src/components/ui';
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

export default function HackathonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !user) return;
    Promise.all([
      supabase.from('hackathons').select('*').eq('id', id).maybeSingle(),
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
        .order('created_at', { ascending: false }),
    ]).then(([h, r, a]) => {
      setHackathon(h.data);
      setRegistration(r.data);
      setAnnouncements((a.data as any[]) ?? []);
    });
  }, [id, user]);

  if (!hackathon) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Screen>
          <Muted>Loading…</Muted>
        </Screen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView>
          <Button title="← Back" variant="text" onPress={() => router.back()} />
          <H1 style={{ marginTop: tokens.space[2] }}>{hackathon.title}</H1>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[2], marginBottom: tokens.space[4] }}>
            {registration ? (
              <Badge tone={TONES[registration.status] ?? 'neutral'}>{registration.status}</Badge>
            ) : null}
            {registration?.checked_in_at ? <Badge tone="success">Checked in</Badge> : null}
            {hackathon.location ? <Badge tone="info">{hackathon.location}</Badge> : null}
          </View>

          {hackathon.description ? (
            <P style={{ color: tokens.color.textMuted, marginBottom: tokens.space[5] }}>
              {hackathon.description}
            </P>
          ) : null}

          <Card style={{ marginBottom: tokens.space[4] }}>
            <H2>Schedule</H2>
            <Muted>Starts: {hackathon.starts_at ? new Date(hackathon.starts_at).toLocaleString() : 'TBA'}</Muted>
            <Muted>Ends: {hackathon.ends_at ? new Date(hackathon.ends_at).toLocaleString() : 'TBA'}</Muted>
            <Muted>Submission deadline: {hackathon.submission_deadline ? new Date(hackathon.submission_deadline).toLocaleString() : 'TBA'}</Muted>
          </Card>

          {registration?.status === 'accepted' ? (
            <Card style={{ marginBottom: tokens.space[4] }}>
              <H2>Quick actions</H2>
              <P style={{ color: tokens.color.textMuted, marginBottom: tokens.space[3] }}>
                Show your QR for check-in, or manage your team.
              </P>
              <View style={{ gap: tokens.space[2] }}>
                <Button title="Show my QR" onPress={() => router.push(`/hackathon/${hackathon.id}/qr`)} />
                <Button title="Team" variant="secondary" onPress={() => router.push(`/hackathon/${hackathon.id}/team`)} />
                <Button title="Submission" variant="secondary" onPress={() => router.push(`/hackathon/${hackathon.id}/submission`)} />
              </View>
            </Card>
          ) : registration?.status === 'pending' ? (
            <Card style={{ marginBottom: tokens.space[4] }}>
              <P>Your registration is pending. You'll see check-in and team options once organizers accept you.</P>
            </Card>
          ) : null}

          <H2 style={{ marginTop: tokens.space[4] }}>Announcements</H2>
          {announcements.length === 0 ? (
            <Card><Muted>No announcements yet.</Muted></Card>
          ) : (
            announcements.map((a) => (
              <Card key={a.id} style={{ marginBottom: tokens.space[3] }}>
                <H2 style={{ fontSize: tokens.font.size.h3 }}>{a.title}</H2>
                <Muted>{new Date(a.created_at).toLocaleString()}</Muted>
                <P style={{ marginTop: tokens.space[2] }}>{a.body}</P>
              </Card>
            ))
          )}
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
