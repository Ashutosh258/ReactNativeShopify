import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'inverse';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, style, testID }: Props) {
  const { colors } = theme;
  const bg = variant === 'primary' ? colors.primary : variant === 'inverse' ? colors.onPrimary : 'transparent';
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'inverse' ? colors.primary : colors.text;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderRadius: theme.radius },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: colors.text },
        (disabled || pressed) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg, textTransform: theme.heading.textTransform }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});
