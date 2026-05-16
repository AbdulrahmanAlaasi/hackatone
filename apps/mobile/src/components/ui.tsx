import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
  TextInput,
  TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../theme';

// =========================================================================
// Layout primitives
// =========================================================================

export function Screen({
  children,
  padded = true,
  scroll = false,
}: {
  children: React.ReactNode;
  padded?: boolean;
  scroll?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tokens.color.background,
        padding: padded ? tokens.space[4] : 0,
      }}
    >
      {children}
    </View>
  );
}

// =========================================================================
// Typography
// =========================================================================

export function Display({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.display, style]} {...rest}>
      {children}
    </Text>
  );
}
export function H1({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.h1, style]} {...rest}>
      {children}
    </Text>
  );
}
export function H2({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.h2, style]} {...rest}>
      {children}
    </Text>
  );
}
export function H3({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.h3, style]} {...rest}>
      {children}
    </Text>
  );
}
export function P({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.p, style]} {...rest}>
      {children}
    </Text>
  );
}
export function Muted({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.muted, style]} {...rest}>
      {children}
    </Text>
  );
}
export function Eyebrow({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[s.eyebrow, style]} {...rest}>
      {children}
    </Text>
  );
}

// =========================================================================
// Hero (the Headspace-style warm rounded gradient header)
// =========================================================================

type HeroTone = 'sunrise' | 'peach' | 'cream' | 'sky' | 'mint';

const HERO_GRADIENTS: Record<HeroTone, [string, string, ...string[]]> = {
  sunrise: ['#FFB066', '#FF8A3D', '#F26F23'],
  peach:   ['#FFD8B8', '#FFB689'],
  cream:   ['#FFF1DE', '#FFE2BD'],
  sky:     ['#CFE8FF', '#A9D5FA'],
  mint:    ['#C5EFD8', '#9BDDB8'],
};

export function Hero({
  tone = 'sunrise',
  children,
  height,
  style,
}: {
  tone?: HeroTone;
  children?: React.ReactNode;
  height?: number;
  style?: any;
}) {
  return (
    <LinearGradient
      colors={HERO_GRADIENTS[tone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          paddingHorizontal: tokens.space[5],
          paddingTop: tokens.space[6],
          paddingBottom: tokens.space[8],
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          minHeight: height ?? 220,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

// =========================================================================
// Cards
// =========================================================================

type CardTone = 'surface' | 'soft' | 'info' | 'cream' | 'mint' | 'sky';

const CARD_COLORS: Record<CardTone, { bg: string; border: string }> = {
  surface: { bg: tokens.color.surface,     border: tokens.color.border },
  soft:    { bg: tokens.color.surfaceSoft, border: 'transparent' },
  info:    { bg: tokens.color.info,        border: 'transparent' },
  cream:   { bg: '#FFF1DE',                border: 'transparent' },
  mint:    { bg: '#D8F3E5',                border: 'transparent' },
  sky:     { bg: '#DDEEFF',                border: 'transparent' },
};

export function Card({
  children,
  tone = 'surface',
  style,
  ...rest
}: ViewProps & { tone?: CardTone }) {
  const c = CARD_COLORS[tone];
  return (
    <View
      style={[
        s.card,
        { backgroundColor: c.bg, borderColor: c.border, borderWidth: c.border === 'transparent' ? 0 : 1 },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// =========================================================================
// Action tile — large tappable colored tile for grids
// =========================================================================

export function ActionTile({
  icon,
  title,
  subtitle,
  tone = 'sunrise',
  onPress,
  disabled,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  tone?: HeroTone | 'plain';
  onPress?: () => void;
  disabled?: boolean;
}) {
  const colors =
    tone === 'plain'
      ? [tokens.color.surface, tokens.color.surface]
      : HERO_GRADIENTS[tone];
  const textColor = tone === 'plain' || tone === 'cream' ? tokens.color.text : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flex: 1,
          opacity: disabled ? 0.5 : 1,
          transform: pressed ? [{ scale: 0.97 }] : [],
        },
      ]}
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.tile}
      >
        <Text style={{ fontSize: 30 }}>{icon}</Text>
        <Text style={[s.tileTitle, { color: textColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[s.tileSubtitle, { color: textColor, opacity: 0.85 }]}>{subtitle}</Text>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

// =========================================================================
// Badges
// =========================================================================

export function Badge({
  children,
  tone = 'neutral',
  style,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'info' | 'primary' | 'cream';
  style?: any;
}) {
  return (
    <View style={[s.badgeBase, s[`badge_${tone}` as const], style]}>
      <Text style={[s.badgeText, s[`badgeText_${tone}` as const]]}>{children}</Text>
    </View>
  );
}

// =========================================================================
// Buttons
// =========================================================================

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  fullWidth,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btnBase,
        s[`btn_${variant}` as const],
        fullWidth && { alignSelf: 'stretch' },
        (disabled || loading) && s.btnDisabled,
        pressed && !disabled && !loading && { transform: [{ scale: 0.97 }] },
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : tokens.color.primary} />
      ) : (
        <Text
          style={[
            s.btnText,
            variant === 'primary' && { color: '#fff' },
            variant === 'secondary' && { color: tokens.color.primaryPressed },
            variant === 'text' && { color: tokens.color.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// =========================================================================
// Forms
// =========================================================================

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: tokens.space[4] }}>
      <Text style={s.label}>{label}</Text>
      {children}
      {error ? <Text style={s.error}>{error}</Text> : hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export const Input = React.forwardRef<TextInput, TextInputProps>((props, ref) => (
  <TextInput
    ref={ref}
    placeholderTextColor={tokens.color.disabledText}
    style={[s.input, props.style]}
    {...props}
  />
));
Input.displayName = 'Input';

// =========================================================================
// Styles
// =========================================================================

const s = StyleSheet.create({
  display: {
    fontSize: 34,
    fontWeight: '800',
    color: tokens.color.text,
    lineHeight: 40,
  },
  h1: {
    fontSize: 30,
    fontWeight: '800',
    color: tokens.color.text,
    lineHeight: 36,
    marginBottom: tokens.space[2],
  },
  h2: {
    fontSize: tokens.font.size.h2,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: tokens.space[2],
  },
  h3: {
    fontSize: tokens.font.size.h3,
    fontWeight: '700',
    color: tokens.color.text,
  },
  p: { fontSize: tokens.font.size.body, color: tokens.color.text, lineHeight: 22 },
  muted: { fontSize: tokens.font.size.caption, color: tokens.color.textMuted },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: tokens.color.primaryPressed,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  card: {
    borderRadius: tokens.radius.lg,
    padding: tokens.space[5],
  },

  tile: {
    borderRadius: 28,
    paddingVertical: tokens.space[5],
    paddingHorizontal: tokens.space[4],
    minHeight: 120,
    justifyContent: 'space-between',
  },
  tileTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: tokens.space[3],
  },
  tileSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  badgeBase: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.full,
  },
  badgeText: { fontSize: tokens.font.size.caption, fontWeight: '800' },
  badge_neutral: { backgroundColor: tokens.color.surfaceSoft },
  badgeText_neutral: { color: tokens.color.text },
  badge_success: { backgroundColor: tokens.color.success },
  badgeText_success: { color: tokens.color.successText },
  badge_warning: { backgroundColor: tokens.color.warning },
  badgeText_warning: { color: tokens.color.warningText },
  badge_info: { backgroundColor: tokens.color.info },
  badgeText_info: { color: '#1d3a5b' },
  badge_primary: { backgroundColor: tokens.color.primary },
  badgeText_primary: { color: '#fff' },
  badge_cream: { backgroundColor: '#FFF1DE' },
  badgeText_cream: { color: tokens.color.text },

  btnBase: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.space[2],
  },
  btn_primary: { backgroundColor: tokens.color.primary },
  btn_secondary: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: '#FFD6B8',
  },
  btn_text: { backgroundColor: 'transparent', minHeight: 0, paddingVertical: 6 },
  btnDisabled: { backgroundColor: tokens.color.disabled },
  btnText: { fontSize: tokens.font.size.bodyLg, fontWeight: '800', color: tokens.color.text },

  label: {
    fontSize: tokens.font.size.label,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: tokens.space[2],
  },
  input: {
    minHeight: 48,
    paddingHorizontal: tokens.space[4],
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    fontSize: tokens.font.size.body,
    color: tokens.color.text,
  },
  hint: { marginTop: 6, fontSize: tokens.font.size.caption, color: tokens.color.textMuted },
  error: {
    marginTop: 6,
    fontSize: tokens.font.size.caption,
    fontWeight: '700',
    color: tokens.color.warningText,
    backgroundColor: tokens.color.warning,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.sm,
  },
});
