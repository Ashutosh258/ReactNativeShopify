import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FreeShippingBar } from '@/components/FreeShippingBar';
import { ProductCard } from '@/components/ProductCard';
import { SampleDataBanner } from '@/components/SampleDataBanner';
import { EmptyView, ErrorView, LoadingView } from '@/components/StateViews';
import { store } from '@/config';
import { commerce } from '@/data/commerce';
import { useAsync } from '@/hooks/useAsync';
import { useSubtotal } from '@/state/cart';
import { common, theme } from '@/theme';

export default function Home() {
  const handle = store.catalog.homeCollection;
  const collection = useAsync(`collection:${handle}`, () => commerce.getCollection(handle));
  const subtotal = useSubtotal();

  if (collection.status === 'loading') return <LoadingView label="Loading products…" />;
  if (collection.status === 'error') return <ErrorView message={collection.error.message} onRetry={collection.reload} />;

  return (
    <View style={common.screen}>
      <SampleDataBanner />
      <FlatList
        data={collection.data.products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={collection.reload} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.hero, { backgroundColor: theme.colors.primary, borderRadius: theme.radius }]}>
              <Text style={[theme.heading, styles.heroTitle, { color: theme.colors.onPrimary }]}>{store.catalog.heroTitle}</Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.onPrimary }]}>{store.catalog.heroSubtitle}</Text>
            </View>
            <FreeShippingBar subtotal={subtotal ?? { amount: 0, currencyCode: collection.data.products[0]?.minPrice.currencyCode ?? 'USD' }} />
            <View style={styles.titleRow}>
              <Text style={[theme.heading, styles.sectionTitle]}>{collection.data.title}</Text>
              <Text style={common.muted}>{collection.data.products.length} products</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyView title="Nothing here yet" body="Check back soon for new arrivals." />}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 },
  row: { gap: 12 },
  header: { gap: 16 },
  hero: { padding: 24, minHeight: 180, justifyContent: 'flex-end' },
  heroTitle: { fontSize: 34, lineHeight: 38 },
  heroSubtitle: { marginTop: 6, fontSize: 15, opacity: 0.85 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { fontSize: 18 },
});
