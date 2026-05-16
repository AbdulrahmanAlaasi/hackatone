import { useState } from 'react';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, H1, Input, Muted, Screen, P } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { tokens } from '../../src/theme';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else if (!data.session) setSent(true);
  }

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Screen>
          <H1>Check your email</H1>
          <P style={{ color: tokens.color.textMuted, marginTop: 8 }}>
            We sent a confirmation link to {email}. Tap it to finish signing up, then come back here
            and sign in.
          </P>
        </Screen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
          <H1>Create your account</H1>
          <P style={{ color: tokens.color.textMuted, marginBottom: 24 }}>
            Use the same email you used to register for a hackathon — we'll link them automatically.
          </P>
          <Field label="Full name">
            <Input value={fullName} onChangeText={setFullName} />
          </Field>
          <Field label="Email">
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </Field>
          <Field label="Password" hint="At least 8 characters.">
            <Input value={password} onChangeText={setPassword} secureTextEntry />
          </Field>
          {error ? <Muted style={{ color: tokens.color.warningText, marginBottom: 12 }}>{error}</Muted> : null}
          <Button title="Create account" onPress={onSubmit} loading={loading} fullWidth />
          <Link href="/(auth)/sign-in" style={{ marginTop: 24, color: tokens.color.primary, textAlign: 'center' }}>
            Already have an account? Sign in
          </Link>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
