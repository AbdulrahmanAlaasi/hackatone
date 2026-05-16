import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import { Button, Card, Field, H1, H2, Input, Muted, P, Screen } from '../../src/components/ui';
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }} edges={['top']}>
      <Screen>
        <ScrollView>
          <H1>Profile</H1>
          <Muted style={{ marginBottom: tokens.space[4] }}>Signed in as {user?.email}</Muted>

          <Field label="Full name"><Input value={name} onChangeText={setName} /></Field>
          <Field label="Phone"><Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></Field>
          <Field label="University / company"><Input value={orgCompany} onChangeText={setOrgCompany} /></Field>
          <Field label="Major / job title"><Input value={title} onChangeText={setTitle} /></Field>
          <Field label="GitHub URL"><Input value={github} onChangeText={setGithub} autoCapitalize="none" /></Field>
          <Field label="Bio">
            <Input value={bio} onChangeText={setBio} multiline numberOfLines={4} style={{ minHeight: 100, paddingTop: 12 }} />
          </Field>

          <Button title="Save profile" onPress={save} loading={saving} fullWidth />
          {saved ? <Muted style={{ marginTop: 12, color: tokens.color.successText }}>Saved.</Muted> : null}

          <View style={{ marginTop: tokens.space[8] }}>
            <Card>
              <H2>Account</H2>
              <P style={{ color: tokens.color.textMuted, marginBottom: tokens.space[3] }}>
                Sign out to switch accounts.
              </P>
              <Button title="Sign out" variant="secondary" onPress={signOut} />
            </Card>
          </View>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
