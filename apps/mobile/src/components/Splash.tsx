import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { tokens } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

/**
 * Hackatone splash / loading screen.
 *
 * - Warm sunrise background.
 * - Three concentric orange "breathing" rings (scale + opacity loop).
 * - Wordmark fades up after a small delay.
 *
 * Use as a full-screen overlay any time the app is bootstrapping
 * (auth check, initial fetch, route transitions).
 */
export function Splash({ tagline }: { tagline?: string }) {
  // Breathing scale: 0.85 → 1.15 → 0.85, 2.4s loop
  const breath = useSharedValue(0.85);
  // Wordmark fade-in
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(12);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1.15, { duration: 2400, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
      -1,
      true,
    );
    wordOpacity.value = withDelay(250, withTiming(1, { duration: 600 }));
    wordY.value = withDelay(250, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, [breath, wordOpacity, wordY]);

  const ringOuter = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    opacity: 0.18,
  }));
  const ringMid = useAnimatedStyle(() => ({
    transform: [{ scale: 0.78 + (breath.value - 0.85) * 0.9 }],
    opacity: 0.35,
  }));
  const ringInner = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + (breath.value - 0.85) * 0.7 }],
    opacity: 1,
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));

  const ringSize = Math.min(SCREEN_W * 0.65, 320);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <LinearGradient
        colors={['#FFE8CC', '#FFD0A8', '#FFB279']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Stacked rings — outer/mid/inner */}
        <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                backgroundColor: '#FFFFFF',
              },
              ringOuter,
            ]}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                backgroundColor: '#FFFFFF',
              },
              ringMid,
            ]}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                backgroundColor: tokens.color.primary,
                shadowColor: '#E96F26',
                shadowOpacity: 0.5,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: 12 },
              },
              ringInner,
            ]}
          />
        </View>

        {/* Wordmark */}
        <Animated.Text
          style={[
            {
              marginTop: 56,
              fontSize: 34,
              fontWeight: '900',
              color: tokens.color.text,
              letterSpacing: -0.5,
            },
            wordStyle,
          ]}
        >
          Hackatone
        </Animated.Text>
        {tagline ? (
          <Animated.Text
            style={[
              {
                marginTop: 8,
                fontSize: 14,
                fontWeight: '700',
                color: '#7A4E2A',
                opacity: 0.85,
              },
              wordStyle,
            ]}
          >
            {tagline}
          </Animated.Text>
        ) : (
          <Animated.View style={[{ marginTop: 12 }, wordStyle]}>
            <BreathingDots />
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

/** Three staggered fading dots beneath the wordmark. */
function BreathingDots() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Dot delay={0} />
      <Dot delay={220} />
      <Dot delay={440} />
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0.3);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ scale: 0.8 + v.value * 0.4 }],
  }));
  return (
    <Animated.View
      style={[
        { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.color.primaryPressed },
        style,
      ]}
    />
  );
}
