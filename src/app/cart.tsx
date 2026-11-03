import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { FreeShippingBar } from '@/components/FreeShippingBar';
import { Price } from '@/components/Price';
import { ProductImage } from '@/components/ProductImage';
import { QuantityStepper } from '@/components/QuantityStepper';
import { EmptyView } from '@/components/StateViews';
import { commerce } from '@/data/commerce';
import { useCart, useSubtotal, type CartLine } from '@/state/cart';
import { common, theme } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function Cart() {
  const lines = useCart((s) => s.lines);
  const subtotal = useSubtotal();
  const reconcile = useCart((s) => s.reconcile);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ids = useCart.getState().lines.map((l) => l.variantId);
    if (!ids.length) return true;
    setSyncing(true);
    setSyncError(null);
    try {
      reconcile(await commerce.getVariants(ids));
      return true;
    } catch (e) {
      setSyncError((e as Error).message);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [reconcile]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const unavailable = lines.filter((l) => !l.available);

  const checkout = async () => {
    setCheckingOut(true);
    setNotice(null);
    try {
      if (!(await refresh())) return;
      const current = useCart.getState().lines;
      if (current.some((l) => !l.available)) {
        setNotice('Some items are no longer available. Remove them to continue.');
        return;
      }
      const result = await commerce.createCheckout(current.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
      if (result.isSample) router.push({ pathname: '/checkout', params: { url: result.checkoutUrl } });
      else await WebBrowser.openBrowserAsync(result.checkoutUrl);
    } catch (e) {
      setNotice(`Checkout unavailable: ${(e as Error).message}`);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!lines.length) {
    return (
      <View style={common.screen}>
        <EmptyView
          title="Your bag is empty"
          body="Items you add will be saved here, even if you close the app."
          action={{ label: 'Start shopping', onPress: () => router.dismissTo('/home') }}
        />
      </View>
    );
  }

  return (
    <View style={common.screen}>
      <FreeShippingBar subtotal={subtotal} />
      {syncError && (
        <Pressable onPress={refresh} style={[styles.banner, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.bannerText}>Couldn’t refresh prices: {syncError} Tap to retry.</Text>
        </Pressable>
      )}
      <FlatList
        data={lines}
        keyExtractor={(l) => l.variantId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
        renderItem={({ item }) => <Line line={item} />}
      />
      <SafeAreaView edges={['bottom']} style={[styles.summary, { borderColor: theme.colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[theme.heading, styles.totalLabel]}>Subtotal</Text>
          <Text style={styles.total} testID="subtotal">{subtotal ? formatMoney(subtotal) : '—'}</Text>
        </View>
        {notice && <Text style={[styles.notice, { color: theme.colors.danger }]}>{notice}</Text>}
        <Text style={common.muted}>Shipping, taxes and discounts calculated at checkout.</Text>
        <Button
          label={unavailable.length ? 'Remove unavailable items' : 'Checkout'}
          onPress={checkout}
          loading={checkingOut || syncing}
          disabled={unavailable.length > 0}
          testID="checkout"
        />
      </SafeAreaView>
    </View>
  );
}

function Line({ line }: { line: CartLine }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  return (
    <View style={[styles.line, !line.available && styles.lineUnavailable]} testID={`line-${line.variantId}`}>
      <ProductImage url={line.imageUrl} swatch={line.swatch} label={line.productTitle} compact style={{ ...styles.thumb, borderRadius: theme.radius }} />
      <View style={styles.lineBody}>
        <Text style={styles.lineTitle} numberOfLines={2}>{line.productTitle}</Text>
        <Text style={common.muted}>{line.variantTitle}</Text>
        <Price price={line.price} />
        {line.available ? (
          <View style={styles.lineActions}>
            <QuantityStepper value={line.quantity} max={line.maxQuantity} onChange={(q) => setQuantity(line.variantId, q)} />
            {line.maxQuantity != null && line.quantity >= line.maxQuantity && <Text style={common.muted}>Max available</Text>}
          </View>
        ) : (
          <Text style={[styles.unavailableText, { color: theme.colors.danger }]}>No longer available</Text>
        )}
      </View>
      <Pressable onPress={() => remove(line.variantId)} hitSlop={10} accessibilityLabel={`Remove ${line.productTitle}`} testID="remove">
        <Text style={styles.remove}>Remove</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  separator: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  line: { flexDirection: 'row', gap: 12 },
  lineUnavailable: { opacity: 0.6 },
  thumb: { width: 84, height: 104 },
  lineBody: { flex: 1, gap: 4 },
  lineTitle: { fontWeight: '700', color: theme.colors.text },
  lineActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  unavailableText: { fontWeight: '600', marginTop: 6 },
  remove: { fontSize: 13, color: theme.colors.muted, textDecorationLine: 'underline' },
  banner: { padding: 12 },
  bannerText: { fontSize: 13, color: theme.colors.text },
  notice: { fontSize: 13, fontWeight: '600' },
  summary: { padding: 16, gap: 10, borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: theme.colors.background },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 16 },
  total: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
});
