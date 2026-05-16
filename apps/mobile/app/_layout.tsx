import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { Splash } from '../src/components/Splash';
import { tokens } from '../src/theme';

const MIN_SPLASH_MS = 5000;

function ProtectedRouter({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  // Enforce the splash for at least MIN_SPLASH_MS, even if auth resolves faster.
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = !loading && minDelayPassed;

  // Once both gates pass, route to the correct section.
  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) router.replace('/(auth)/sign-in');
    else if (session && inAuth) router.replace('/(tabs)');
  }, [ready, session, segments, router]);

  if (!ready) {
    return <Splash />;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <ProtectedRouter>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: tokens.color.background },
            }}
          />
        </ProtectedRouter>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
