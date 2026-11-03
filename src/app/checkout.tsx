import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useCart, useSubtotal } from '@/state/cart';
import { common, theme } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function SampleCheckout() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const subtotal = useSubtotal();
  const count = useCart((s) => s.lines.length);
  const clear = useCart((s) => s.clear);

  const placeOrder = () => {
    clear();
    router.dismissTo('/home');
  };

  return (
    <SafeAreaView edges={['bottom']} style={[common.screen, styles.container]}>
      <View style={styles.body}>
        <Text style={[theme.heading, styles.title]}>Sample checkout</Text>
        <Text style={common.body}>
          This store uses sample data, so no real checkout was created. With a live Shopify store, this step opens
          Shopify checkout for the cart below, and Shopify handles payment, shipping, taxes and discounts.
        </Text>
        <View style={[styles.card, { borderRadius: theme.radius }]}>
          <Text style={common.muted}>Checkout URL</Text>
          <Text style={styles.url} selectable>{url}</Text>
          <Text style={common.muted}>{count} line items · {subtotal ? formatMoney(subtotal) : '—'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Simulate order placed" onPress={placeOrder} testID="simulate-order" />
        <Button label="Back to bag" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, justifyContent: 'space-between' },
  body: { gap: 16 },
  title: { fontSize: 22 },
  card: { padding: 16, gap: 6, backgroundColor: theme.colors.surface },
  url: { fontSize: 13, color: theme.colors.text, fontFamily: 'monospace' },
  actions: { gap: 10 },
});
