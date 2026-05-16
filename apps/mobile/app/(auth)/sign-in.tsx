import { useState } from 'react';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, H1, Input, Muted, Screen, P } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { tokens } from '../../src/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <Screen>
        <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
          <H1>Welcome back</H1>
          <P style={{ color: tokens.color.textMuted, marginBottom: 24 }}>
            Sign in with the same email you used to register for a hackathon.
          </P>
          <Field label="Email">
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password">
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </Field>
          {error ? <Muted style={{ color: tokens.color.warningText, marginBottom: 12 }}>{error}</Muted> : null}
          <Button title="Sign in" onPress={onSubmit} loading={loading} fullWidth />
          <Link href="/(auth)/sign-up" style={{ marginTop: 24, color: tokens.color.primary, textAlign: 'center' }}>
            Don't have an account? Sign up
          </Link>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
