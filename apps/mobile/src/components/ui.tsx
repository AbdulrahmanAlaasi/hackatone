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
import { tokens } from '../theme';

export function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
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

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[s.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  style,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'info' | 'primary';
  style?: any;
}) {
  return (
    <View style={[s.badgeBase, s[`badge_${tone}` as const], style]}>
      <Text style={[s.badgeText, s[`badgeText_${tone}` as const]]}>{children}</Text>
    </View>
  );
}

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

const s = StyleSheet.create({
  h1: {
    fontSize: tokens.font.size.h1,
    fontWeight: '800',
    color: tokens.color.text,
    marginBottom: tokens.space[2],
  },
  h2: {
    fontSize: tokens.font.size.h2,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: tokens.space[2],
  },
  p: { fontSize: tokens.font.size.body, color: tokens.color.text, lineHeight: 22 },
  muted: { fontSize: tokens.font.size.caption, color: tokens.color.textMuted },

  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space[5],
    borderWidth: 1,
    borderColor: tokens.color.border,
  },

  badgeBase: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
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

  btnBase: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.space[2],
  },
  btn_primary: { backgroundColor: tokens.color.primary },
  btn_secondary: {
    backgroundColor: tokens.color.surfaceSoft,
    borderWidth: 1,
    borderColor: '#FFD6B8',
  },
  btn_text: { backgroundColor: 'transparent', minHeight: 0, paddingVertical: 6 },
  btnDisabled: { backgroundColor: tokens.color.disabled },
  btnText: { fontSize: tokens.font.size.body, fontWeight: '800', color: tokens.color.text },

  label: {
    fontSize: tokens.font.size.label,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: tokens.space[2],
  },
  input: {
    minHeight: 44,
    paddingHorizontal: tokens.space[4],
    paddingVertical: 12,
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
