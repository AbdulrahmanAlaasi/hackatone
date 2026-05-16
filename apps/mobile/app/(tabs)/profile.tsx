import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
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

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name, phone, organization_or_company, major_or_job_title, github_url, bio')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setOrgCompany(data.organization_or_company ?? '');
        setTitle(data.major_or_job_title ?? '');
        setGithub(data.github_url ?? '');
        setBio(data.bio ?? '');
      });
  }, [user]);

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

  const initial = ((name || user?.email || '?').trim()[0] ?? '?').toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
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
          <H3 style={{ marginBottom: tokens.space[3] }}>About you</H3>
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
            {saved ? <Muted style={{ marginTop: 12, color: tokens.color.successText, textAlign: 'center' }}>✓ Saved</Muted> : null}
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
