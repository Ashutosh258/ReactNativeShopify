import { StyleSheet, Text, View } from 'react-native';
import { store } from '@/config';
import type { Money } from '@/data/types';
import { theme } from '@/theme';
import { formatMoney } from '@/utils/format';

export function FreeShippingBar({ subtotal }: { subtotal: Money | null }) {
  const threshold = store.features.freeShippingThreshold;
  if (threshold == null || !subtotal) return null;
  const remaining = threshold - subtotal.amount;
  const progress = Math.min(1, subtotal.amount / threshold);
  return (
    <View style={styles.container} testID="free-shipping">
      <Text style={styles.text}>
        {remaining > 0
          ? `You're ${formatMoney({ amount: remaining, currencyCode: subtotal.currencyCode })} away from free shipping`
          : "You've unlocked free shipping"}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 16, backgroundColor: theme.colors.surface },
  text: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  track: { height: 4, backgroundColor: theme.colors.border },
  fill: { height: 4, backgroundColor: theme.colors.success },
});
