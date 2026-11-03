import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '@/data/types';
import { theme } from '@/theme';
import { optionValueState, type Selection } from '@/utils/variants';

type Props = {
  product: Product;
  selection: Selection;
  onChange: (selection: Selection) => void;
};

export function VariantSelector({ product, selection, onChange }: Props) {
  const swatchFor = (value: string) =>
    product.variants.find((v) => v.selectedOptions.some((o) => o.value === value))?.swatch ?? null;

  return (
    <View style={styles.container}>
      {product.options.map((option) => (
        <View key={option.name}>
          <Text style={styles.label}>
            {option.name}: <Text style={styles.value}>{selection[option.name] ?? 'Select'}</Text>
          </Text>
          <View style={styles.values}>
            {option.values.map((value) => {
              const state = optionValueState(product, selection, option.name, value);
              const selected = selection[option.name] === value;
              const swatch = option.name === 'Colour' ? swatchFor(value) : null;
              return (
                <Pressable
                  key={value}
                  testID={`option-${option.name}-${value}`}
                  disabled={state === 'unavailable'}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: state === 'unavailable' }}
                  accessibilityLabel={`${option.name} ${value}${state === 'soldOut' ? ', sold out' : state === 'unavailable' ? ', unavailable' : ''}`}
                  onPress={() => onChange({ ...selection, [option.name]: value })}
                  style={[
                    styles.chip,
                    { borderRadius: theme.radius, borderColor: selected ? theme.colors.text : theme.colors.border },
                    selected && styles.chipSelected,
                    state === 'unavailable' && styles.chipUnavailable,
                  ]}
                >
                  {swatch && <View style={[styles.dot, { backgroundColor: swatch }]} />}
                  <Text style={[styles.chipText, state !== 'available' && styles.chipTextOut]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontWeight: '400', textTransform: 'none' },
  values: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 52, minHeight: 44, paddingHorizontal: 12, borderWidth: 1.5, justifyContent: 'center' },
  chipSelected: { borderWidth: 2 },
  chipUnavailable: { opacity: 0.35, borderStyle: 'dashed' },
  chipText: { fontSize: 14, color: theme.colors.text },
  chipTextOut: { textDecorationLine: 'line-through', color: theme.colors.muted },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: '#0003' },
});
