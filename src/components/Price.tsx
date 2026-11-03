import { StyleSheet, Text, View } from 'react-native';
import type { Money } from '@/data/types';
import { theme } from '@/theme';
import { formatMoney } from '@/utils/format';

export function Price({ price, compareAt, size = 14 }: { price: Money; compareAt?: Money | null; size?: number }) {
  const onSale = compareAt && compareAt.amount > price.amount;
  return (
    <View style={styles.row}>
      <Text style={[styles.price, { fontSize: size }, onSale && { color: theme.colors.danger }]}>{formatMoney(price)}</Text>
      {onSale && <Text style={[styles.compare, { fontSize: size - 1 }]}>{formatMoney(compareAt)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontWeight: '700', color: theme.colors.text },
  compare: { color: theme.colors.muted, textDecorationLine: 'line-through' },
});
