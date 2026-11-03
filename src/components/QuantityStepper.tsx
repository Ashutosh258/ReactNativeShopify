import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Props = { value: number; max: number | null; onChange: (value: number) => void; testID?: string };

export function QuantityStepper({ value, max, onChange, testID }: Props) {
  const canIncrease = max == null || value < max;
  return (
    <View style={[styles.row, { borderRadius: theme.radius }]} testID={testID}>
      <Step label="−" a11y="Decrease quantity" disabled={value <= 1} onPress={() => onChange(value - 1)} />
      <Text style={styles.value} accessibilityLabel={`Quantity ${value}`}>{value}</Text>
      <Step label="+" a11y="Increase quantity" disabled={!canIncrease} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function Step({ label, a11y, disabled, onPress }: { label: string; a11y: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityLabel={a11y} hitSlop={6} style={[styles.step, disabled && styles.disabled]}>
      <Text style={styles.stepText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, alignSelf: 'flex-start' },
  step: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, color: theme.colors.text },
  value: { minWidth: 28, textAlign: 'center', fontWeight: '700', color: theme.colors.text },
  disabled: { opacity: 0.3 },
});
