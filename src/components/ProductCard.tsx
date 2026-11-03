import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '@/data/types';
import { theme } from '@/theme';
import { Price } from './Price';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const first = product.variants.find((v) => v.available) ?? product.variants[0];
  const swatches = [...new Set(product.variants.map((v) => v.swatch).filter(Boolean))] as string[];
  const badge = !product.available ? 'Sold out' : product.tags.includes('sale') ? 'Sale' : product.tags.includes('bestseller') ? 'Bestseller' : null;

  return (
    <Link href={{ pathname: '/product/[handle]', params: { handle: product.handle } }} asChild>
      <Pressable style={styles.card} testID={`product-${product.handle}`}>
        <View>
          <ProductImage
            url={product.featuredImage?.url ?? null}
            swatch={first?.swatch ?? null}
            label={product.productType}
            style={{ ...styles.image, borderRadius: theme.radius }}
          />
          {badge && (
            <View style={[styles.badge, { backgroundColor: product.available ? theme.colors.background : theme.colors.text }]}>
              <Text style={[styles.badgeText, { color: product.available ? theme.colors.text : theme.colors.background }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.type}>{product.productType}{swatches.length > 1 ? ` · ${swatches.length} colours` : ''}</Text>
        <Price price={product.minPrice} compareAt={first?.compareAtPrice} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 4 },
  image: { width: '100%', aspectRatio: 0.8 },
  badge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { marginTop: 6, fontSize: 14, fontWeight: '600', color: theme.colors.text },
  type: { fontSize: 12, color: theme.colors.muted },
});
