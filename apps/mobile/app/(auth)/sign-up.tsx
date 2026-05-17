import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Display,
  Eyebrow,
  Field,
  Hero,
  Input,
  Muted,
  P,
} from '../../src/components/ui';
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
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else if (!data.session) setSent(true);
  }

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <Hero tone="cream" height={240}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <Eyebrow>Almost there</Eyebrow>
            <Display>Check your email</Display>
          </SafeAreaView>
        </Hero>
        <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
          <Card>
            <P>
              We sent a confirmation link to <Muted style={{ fontWeight: '800' }}>{email}</Muted>.
              Tap it to finish signing up, then come back here and sign in.
            </P>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 64, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Hero tone="sunrise" height={240}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
              <Eyebrow style={{ color: 'rgba(255,255,255,0.92)' }}>Welcome</Eyebrow>
              <Display style={{ color: '#fff', marginTop: 4 }}>Create{'\n'}your account.</Display>
              <P style={{ color: 'rgba(255,255,255,0.95)', marginTop: tokens.space[3] }}>
                Use the same email as your hackathon registration.
              </P>
            </SafeAreaView>
          </Hero>

          <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
            <Card>
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
              {error ? (
                <Muted
                  style={{
                    color: tokens.color.warningText,
                    backgroundColor: tokens.color.warning,
                    padding: 10,
                    borderRadius: tokens.radius.sm,
                    fontWeight: '700',
                    marginBottom: 12,
                  }}
                >
                  {error}
                </Muted>
              ) : null}
              <Button title="Create account" onPress={onSubmit} loading={loading} fullWidth />
            </Card>

            <View style={{ alignItems: 'center', marginTop: tokens.space[5] }}>
              <Link
                href="/(auth)/sign-in"
                style={{ color: tokens.color.primaryPressed, fontWeight: '800' }}
              >
                Already have an account? Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
