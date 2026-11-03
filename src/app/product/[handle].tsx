import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Price } from '@/components/Price';
import { ProductImage } from '@/components/ProductImage';
import { ReviewsSection } from '@/components/ReviewsSection';
import { ErrorView, LoadingView } from '@/components/StateViews';
import { VariantSelector } from '@/components/VariantSelector';
import { commerce } from '@/data/commerce';
import type { Product } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { useCart } from '@/state/cart';
import { common, theme } from '@/theme';
import { findVariant, initialSelection } from '@/utils/variants';

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const product = useAsync(`product:${handle}`, () => commerce.getProduct(handle));

  if (product.status === 'loading') return <LoadingView />;
  if (product.status === 'error') return <ErrorView message={product.error.message} onRetry={product.reload} />;
  return <ProductDetails key={product.data.id} product={product.data} />;
}

function ProductDetails({ product }: { product: Product }) {
  const [selection, setSelection] = useState(() => initialSelection(product));
  const [added, setAdded] = useState(false);
  const variant = findVariant(product, selection);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines.find((l) => l.variantId === variant?.id)?.quantity ?? 0);

  const preview = variant ?? product.variants.find((v) => v.selectedOptions.some((o) => o.value === selection.Colour)) ?? product.variants[0];
  const maxReached = variant?.quantityAvailable != null && inCart >= variant.quantityAvailable;

  const missing = product.options.find((o) => !selection[o.name]);
  const cta = missing
    ? `Select ${missing.name.toLowerCase()}`
    : !variant
      ? 'Unavailable'
      : !variant.available
        ? 'Sold out'
        : maxReached
          ? 'Max quantity in bag'
          : 'Add to bag';

  const onAdd = () => {
    if (!variant) return;
    add(product, variant);
    setAdded(true);
  };

  return (
    <View style={common.screen}>
      <Stack.Screen options={{ title: product.productType }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ProductImage
          url={preview?.image?.url ?? product.featuredImage?.url ?? null}
          swatch={preview?.swatch ?? null}
          label={product.productType}
          style={styles.image}
        />
        <View style={styles.body}>
          <Text style={[theme.heading, styles.title]}>{product.title}</Text>
          <Price price={preview.price} compareAt={preview.compareAtPrice} size={18} />
          <VariantSelector product={product} selection={selection} onChange={(s) => { setSelection(s); setAdded(false); }} />
          {variant && variant.available && variant.quantityAvailable != null && variant.quantityAvailable <= 3 && (
            <Text style={[styles.stock, { color: theme.colors.danger }]}>Only {variant.quantityAvailable} left</Text>
          )}
          {variant && !variant.available && <Text style={[styles.stock, { color: theme.colors.danger }]}>This size is sold out.</Text>}
          {!variant && !missing && <Text style={styles.stock}>This combination isn’t available.</Text>}
          <Text style={common.body}>{product.description}</Text>
          <ReviewsSection productId={product.id} />
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { borderColor: theme.colors.border }]}>
        {added ? (
          <View style={styles.addedRow}>
            <Button label="Keep shopping" variant="secondary" onPress={() => router.back()} style={styles.flex} />
            <Button label="View bag" onPress={() => router.push('/cart')} style={styles.flex} testID="view-bag" />
          </View>
        ) : (
          <Button
            label={cta}
            onPress={onAdd}
            disabled={!variant || !variant.available || maxReached}
            testID="add-to-bag"
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  image: { width: '100%', aspectRatio: 1 },
  body: { padding: 16, gap: 16 },
  title: { fontSize: 22 },
  stock: { fontSize: 13, fontWeight: '600', color: theme.colors.muted },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: theme.colors.background },
  addedRow: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
