import { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MIN_H = 0.40;
const MAX_H = 0.58;
const ARC_MIN = 70;
const ARC_MAX = 120;
const BREATH_MS = 2800;
const DEFAULT_TAGLINE = 'Striking the right TONE for great hackathons';

/**
 * Hackatone splash / loading screen.
 *
 * Big "Hackatone" wordmark up top with a soft fade-in; warm-orange blob
 * breathing in and out from the bottom (height + arc curve scale on the
 * same shared value with sine easing).
 */
export function Splash({ tagline }: { tagline?: string }) {
  const breath = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const wordScale = useSharedValue(0.92);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    wordOpacity.value = withDelay(120, withTiming(1, { duration: 700 }));
    wordScale.value = withDelay(
      120,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [breath, wordOpacity, wordScale]);

  const height = useDerivedValue(() =>
    interpolate(breath.value, [0, 1], [MIN_H, MAX_H]) * SCREEN_H,
  );
  const arc = useDerivedValue(() => interpolate(breath.value, [0, 1], [ARC_MIN, ARC_MAX]));

  const animatedProps = useAnimatedProps(() => {
    const h = height.value;
    const a = arc.value;
    const topY = SCREEN_H - h;
    const arcPeakY = topY - a;
    return {
      d: `M 0 ${topY} Q ${SCREEN_W / 2} ${arcPeakY} ${SCREEN_W} ${topY} L ${SCREEN_W} ${SCREEN_H} L 0 ${SCREEN_H} Z`,
    };
  });

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ scale: wordScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Svg
        width={SCREEN_W}
        height={SCREEN_H}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <AnimatedPath animatedProps={animatedProps} fill={tokens.color.primary} />
      </Svg>

      <View
        style={{
          position: 'absolute',
          top: SCREEN_H * 0.18,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
        pointerEvents="none"
      >
        <Animated.Text
          style={[
            {
              fontSize: 52,
              fontWeight: '900',
              color: tokens.color.text,
              letterSpacing: -1.2,
              lineHeight: 56,
            },
            wordmarkStyle,
          ]}
        >
          Hackatone
        </Animated.Text>
        {tagline && tagline !== DEFAULT_TAGLINE ? (
          <Animated.Text
            style={[
              {
                marginTop: 10,
                fontSize: 15,
                fontWeight: '700',
                color: tokens.color.primaryPressed,
              },
              wordmarkStyle,
            ]}
          >
            {tagline}
          </Animated.Text>
        ) : (
          <Animated.View
            style={[
              {
                marginTop: 12,
                maxWidth: SCREEN_W - 48,
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
              },
              wordmarkStyle,
            ]}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: tokens.color.primaryPressed,
              }}
            >
              Striking the right
            </Text>
            <Text
              style={{
                overflow: 'hidden',
                borderRadius: 7,
                backgroundColor: tokens.color.primary,
                paddingHorizontal: 8,
                paddingVertical: 2,
                fontSize: 13,
                fontWeight: '900',
                letterSpacing: 1.1,
                color: '#FFFFFF',
              }}
            >
              TONE
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: tokens.color.primaryPressed,
              }}
            >
              for great hackathons
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
