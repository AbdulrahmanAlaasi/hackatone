import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { PUBLIC_WEB_URL } from '@hackatone/shared';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import {
  Badge,
  Button,
  Card,
  Display,
  Eyebrow,
  Field,
  H3,
  Hero,
  Input,
  Muted,
  P,
} from '../../src/components/ui';
import { useAuth } from '../../src/auth/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { tokens } from '../../src/theme';

type ProfileData = {
  full_name: string | null;
  phone: string | null;
  organization_or_company: string | null;
  major_or_job_title: string | null;
  github_url: string | null;
  bio: string | null;
  cv_url: string | null;
  ai_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  ai_skills: string[] | null;
  ai_strengths: string[] | null;
  ai_summary: string | null;
  ai_analyzed_at: string | null;
};

const LEVEL_TONE: Record<NonNullable<ProfileData['ai_level']>, 'success' | 'info' | 'warning' | 'neutral' | 'primary'> = {
  beginner: 'neutral',
  intermediate: 'info',
  advanced: 'success',
  expert: 'primary',
};

const DATE_FMT = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function formatDate(value: string | null) {
  return value ? DATE_FMT.format(new Date(value)) : null;
}

function readableLevel(level: ProfileData['ai_level']) {
  if (!level) return 'Not analyzed yet';
  return level.replace(/^\w/, (c) => c.toUpperCase());
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgCompany, setOrgCompany] = useState('');
  const [title, setTitle] = useState('');
  const [github, setGithub] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvMessage, setCvMessage] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);

    const profileRes = await supabase
      .from('profiles')
      .select(
        'full_name, phone, organization_or_company, major_or_job_title, github_url, bio, cv_url, ai_level, ai_skills, ai_strengths, ai_summary, ai_analyzed_at',
      )
      .eq('id', user.id)
      .maybeSingle();

    const nextProfile = (profileRes.data as ProfileData | null) ?? null;
    setProfile(nextProfile);
    setName(nextProfile?.full_name ?? '');
    setPhone(nextProfile?.phone ?? '');
    setOrgCompany(nextProfile?.organization_or_company ?? '');
    setTitle(nextProfile?.major_or_job_title ?? '');
    setGithub(nextProfile?.github_url ?? '');
    setBio(nextProfile?.bio ?? '');
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await supabase
      .from('profiles')
      .update({
        full_name: name,
        phone: phone || null,
        organization_or_company: orgCompany || null,
        major_or_job_title: title || null,
        github_url: github || null,
        bio: bio || null,
      })
      .eq('id', user.id);
    setSaving(false);
    setSaved(true);
  }

  async function uploadCv() {
    if (!user) return;
    setCvError(null);
    setCvMessage(null);

    const picked = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled) return;

    const file = picked.assets[0];
    if (!file) return;
    if (file.size && file.size > 5 * 1024 * 1024) {
      setCvError('Choose a PDF smaller than 5 MB.');
      return;
    }

    setUploadingCv(true);
    try {
      const bytes = await fetch(file.uri).then((res) => res.arrayBuffer());
      const path = `${user.id}/cv.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(path, bytes, {
          contentType: file.mimeType ?? 'application/pdf',
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: signed, error: signedError } = await supabase.storage
        .from('cvs')
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signedError) throw signedError;
      if (!signed?.signedUrl) throw new Error('Could not create a signed CV URL.');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          cv_url: signed.signedUrl,
          ai_analyzed_at: null,
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      const apiRes = await fetch(`${PUBLIC_WEB_URL}/api/start-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!apiRes.ok) throw new Error(`Analysis request failed (${apiRes.status}).`);

      setCvMessage('CV uploaded. AI analysis is running now.');
      await load();
    } catch (err: any) {
      setCvError(err?.message ?? 'Could not upload your CV. Please try again.');
    } finally {
      setUploadingCv(false);
    }
  }

  const initial = ((name || user?.email || '?').trim()[0] ?? '?').toUpperCase();
  const skills = profile?.ai_skills ?? [];
  const strengths = profile?.ai_strengths ?? [];
  const analyzedDate = formatDate(profile?.ai_analyzed_at ?? null);
  const readinessItems = [
    { label: 'Name', done: !!name.trim() },
    { label: 'Phone', done: !!phone.trim() },
    { label: 'Role', done: !!title.trim() },
    { label: 'Bio', done: !!bio.trim() },
    { label: 'CV', done: !!profile?.cv_url },
    { label: 'AI analysis', done: !!profile?.ai_analyzed_at },
  ];
  const readinessDone = readinessItems.filter((item) => item.done).length;
  const readinessPercent = Math.round((readinessDone / readinessItems.length) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={tokens.color.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Hero tone="cream" height={220}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Eyebrow>Your profile</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[4], marginTop: tokens.space[3] }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  backgroundColor: tokens.color.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <P style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>{initial}</P>
              </View>
              <View style={{ flex: 1 }}>
                <Display>{name || 'Hello there'}</Display>
                <Muted style={{ marginTop: 4 }}>{user?.email}</Muted>
              </View>
            </View>
          </SafeAreaView>
        </Hero>

        <View style={{ paddingHorizontal: tokens.space[4], marginTop: tokens.space[5] }}>
          <H3 style={{ marginBottom: tokens.space[3] }}>Participant readiness</H3>
          <Card tone="surface" style={{ marginBottom: tokens.space[6] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[4] }}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 28,
                  backgroundColor: readinessPercent >= 80 ? '#D8F3E5' : '#FFF1DE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <P style={{ fontSize: 24, fontWeight: '900', color: readinessPercent >= 80 ? tokens.color.successText : tokens.color.primaryPressed }}>
                  {readinessPercent}%
                </P>
              </View>
              <View style={{ flex: 1 }}>
                <Eyebrow>Application profile</Eyebrow>
                <H3 style={{ marginTop: 4 }}>{readinessPercent >= 80 ? 'Ready to apply' : 'Almost ready'}</H3>
                <Muted style={{ marginTop: 4 }}>
                  Complete your profile and CV so organizers can review you faster.
                </Muted>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: tokens.space[4] }}>
              {readinessItems.map((item) => (
                <Badge key={item.label} tone={item.done ? 'success' : 'neutral'}>{item.label}</Badge>
              ))}
            </View>
          </Card>

          <H3 style={{ marginBottom: tokens.space[3] }}>AI CV profile</H3>
          <Card tone="cream" style={{ overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[3] }}>
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 22,
                  backgroundColor: '#FFD8B8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Sparkles size={28} color={tokens.color.primaryPressed} />
              </View>
              <View style={{ flex: 1 }}>
                <Eyebrow>Claude analysis</Eyebrow>
                <H3 style={{ marginTop: 4 }}>{readableLevel(profile?.ai_level ?? null)}</H3>
                <Muted>{analyzedDate ? `Last analyzed ${analyzedDate}` : 'Upload a CV to build your skill profile.'}</Muted>
              </View>
              {profile?.ai_level ? <Badge tone={LEVEL_TONE[profile.ai_level]}>{profile.ai_level}</Badge> : null}
            </View>

            {profile?.ai_summary ? (
              <P style={{ marginTop: tokens.space[4], lineHeight: 22 }}>{profile.ai_summary}</P>
            ) : (
              <P style={{ marginTop: tokens.space[4], color: tokens.color.textMuted }}>
                Your CV analysis will help organizers balance teams and understand your strengths.
              </P>
            )}

            {skills.length > 0 ? (
              <View style={{ marginTop: tokens.space[4] }}>
                <Muted style={{ fontWeight: '800', color: tokens.color.text }}>Skills</Muted>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: tokens.space[2] }}>
                  {skills.slice(0, 8).map((skill) => (
                    <Badge key={skill} tone="cream">{skill}</Badge>
                  ))}
                </View>
              </View>
            ) : null}

            {strengths.length > 0 ? (
              <View style={{ marginTop: tokens.space[4] }}>
                <Muted style={{ fontWeight: '800', color: tokens.color.text }}>Strengths</Muted>
                <View style={{ gap: 8, marginTop: tokens.space[2] }}>
                  {strengths.slice(0, 4).map((strength) => (
                    <View key={strength} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                      <Icon.Check size={16} color={tokens.color.successText} />
                      <P style={{ flex: 1 }}>{strength}</P>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ marginTop: tokens.space[5], gap: tokens.space[2] }}>
              <Button
                title={profile?.cv_url ? 'Upload new CV' : 'Upload CV'}
                onPress={uploadCv}
                loading={uploadingCv}
                fullWidth
              />
              {cvMessage ? <Muted style={{ color: tokens.color.successText, textAlign: 'center' }}>{cvMessage}</Muted> : null}
              {cvError ? <Muted style={{ color: tokens.color.warningText, textAlign: 'center' }}>{cvError}</Muted> : null}
            </View>
          </Card>

          <H3 style={{ marginTop: tokens.space[6], marginBottom: tokens.space[3] }}>About you</H3>
          <Card>
            <Field label="Full name"><Input value={name} onChangeText={setName} /></Field>
            <Field label="Phone"><Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></Field>
            <Field label="University / company"><Input value={orgCompany} onChangeText={setOrgCompany} /></Field>
            <Field label="Major / job title"><Input value={title} onChangeText={setTitle} /></Field>
            <Field label="GitHub URL"><Input value={github} onChangeText={setGithub} autoCapitalize="none" /></Field>
            <Field label="Bio">
              <Input
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, paddingTop: 12 }}
              />
            </Field>
            <Button title="Save profile" onPress={save} loading={saving} fullWidth />
            {saved ? <Muted style={{ marginTop: 12, color: tokens.color.successText, textAlign: 'center' }}>Saved</Muted> : null}
          </Card>

          <H3 style={{ marginTop: tokens.space[6], marginBottom: tokens.space[3] }}>Account</H3>
          <Card tone="soft">
            <Button title="Sign out" variant="secondary" onPress={signOut} fullWidth />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
