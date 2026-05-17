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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (error) setError(error.message);
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
              <Eyebrow style={{ color: 'rgba(255,255,255,0.92)' }}>Hackatone</Eyebrow>
              <Display style={{ color: '#fff', marginTop: 4 }}>Welcome{'\n'}back.</Display>
              <P style={{ color: 'rgba(255,255,255,0.95)', marginTop: tokens.space[3] }}>
                Sign in with the email you used to register.
              </P>
            </SafeAreaView>
          </Hero>

          <View style={{ paddingHorizontal: tokens.space[4], marginTop: -28 }}>
            <Card>
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
              <Button title="Sign in" onPress={onSubmit} loading={loading} fullWidth />
            </Card>

            <View style={{ alignItems: 'center', marginTop: tokens.space[5] }}>
              <Link
                href="/(auth)/sign-up"
                style={{ color: tokens.color.primaryPressed, fontWeight: '800' }}
              >
                Don&apos;t have an account? Sign up
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
