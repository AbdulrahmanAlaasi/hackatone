import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
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

// Breathing range — blob height as a fraction of screen height
const MIN_H = 0.42;
const MAX_H = 0.62;
// Arc depth — how much the top of the blob curves up
const ARC_MIN = 60;
const ARC_MAX = 110;

const BREATH_MS = 2800;

/**
 * Hackatone loading screen.
 *
 * White background with a warm-orange blob rising from the bottom that
 * "breathes" — height + top-arc curve expand and contract on a gentle
 * ~2.8s sine loop. Tagline fades in at the top.
 */
export function Splash({ tagline = 'Loading' }: { tagline?: string }) {
  const breath = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(12);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    textOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));
    textY.value = withDelay(
      150,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [breath, textOpacity, textY]);

  const height = useDerivedValue(() =>
    interpolate(breath.value, [0, 1], [MIN_H, MAX_H]) * SCREEN_H,
  );
  const arc = useDerivedValue(() => interpolate(breath.value, [0, 1], [ARC_MIN, ARC_MAX]));

  const animatedProps = useAnimatedProps(() => {
    const h = height.value;
    const a = arc.value;
    const topY = SCREEN_H - h;
    const arcPeakY = topY - a;
    // Quadratic curve from bottom-left edge, peaking up over the screen center, back down to bottom-right.
    return {
      d: `M 0 ${topY} Q ${SCREEN_W / 2} ${arcPeakY} ${SCREEN_W} ${topY} L ${SCREEN_W} ${SCREEN_H} L 0 ${SCREEN_H} Z`,
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
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
              fontSize: 26,
              fontWeight: '800',
              color: tokens.color.text,
              letterSpacing: -0.3,
            },
            textStyle,
          ]}
        >
          {tagline}
        </Animated.Text>
      </View>
    </View>
  );
}
