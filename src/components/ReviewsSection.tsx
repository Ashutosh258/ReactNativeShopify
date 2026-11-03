import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { reviews, type ReviewsAdapter } from '@/data/integrations/reviews';
import { useAsync } from '@/hooks/useAsync';
import { theme } from '@/theme';

const stars = (rating: number) => '★★★★★'.slice(0, Math.round(rating)).padEnd(5, '☆');

export function ReviewsSection({ productId }: { productId: string }) {
  if (!reviews) return null;
  return <Reviews adapter={reviews} productId={productId} />;
}

function Reviews({ adapter, productId }: { adapter: ReviewsAdapter; productId: string }) {
  const result = useAsync(`reviews:${productId}`, () => adapter.getProductReviews(productId));

  return (
    <View style={styles.container} testID="reviews">
      <Text style={[theme.heading, styles.heading]}>Reviews</Text>
      {result.status === 'loading' && <ActivityIndicator color={theme.colors.muted} style={styles.loader} />}
      {result.status === 'error' && (
        <View style={[styles.notice, { borderRadius: theme.radius }]} testID="reviews-unavailable">
          <Text style={styles.noticeTitle}>Reviews are unavailable right now</Text>
          <Text style={styles.muted}>You can still add this item to your bag. Reviews will be back shortly.</Text>
          <Text style={styles.retry} onPress={result.reload}>Retry</Text>
        </View>
      )}
      {result.status === 'success' && result.data.count === 0 && (
        <Text style={styles.muted}>No reviews yet. Be the first to review this product.</Text>
      )}
      {result.status === 'success' && result.data.count > 0 && (
        <>
          <Text style={styles.summary}>
            <Text style={styles.stars}>{stars(result.data.average)}</Text> {result.data.average.toFixed(1)} · {result.data.count} reviews
          </Text>
          {result.data.reviews.map((r) => (
            <View key={r.id} style={styles.review}>
              <Text style={styles.stars}>{stars(r.rating)}</Text>
              <Text style={styles.reviewTitle}>{r.title}</Text>
              <Text style={styles.body}>{r.body}</Text>
              <Text style={styles.muted}>{r.author}{r.verified ? ' · Verified buyer' : ''}</Text>
            </View>
          ))}
        </>
      )}
      <Text style={styles.powered}>Powered by {adapter.providerName} (mocked)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingTop: 8 },
  heading: { fontSize: 16 },
  loader: { alignSelf: 'flex-start' },
  summary: { fontSize: 14, color: theme.colors.text },
  stars: { color: theme.colors.text, letterSpacing: 1 },
  review: { gap: 2, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border },
  reviewTitle: { fontWeight: '700', color: theme.colors.text },
  body: { color: theme.colors.text, lineHeight: 20 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  notice: { padding: 14, gap: 4, backgroundColor: theme.colors.surface },
  noticeTitle: { fontWeight: '700', color: theme.colors.text },
  retry: { marginTop: 4, fontWeight: '700', color: theme.colors.accent, alignSelf: 'flex-start' },
  powered: { fontSize: 11, color: theme.colors.muted },
});
