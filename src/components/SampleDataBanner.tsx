import { StyleSheet, Text } from 'react-native';
import { commerce } from '@/data/commerce';
import { theme } from '@/theme';

export function SampleDataBanner() {
  if (!commerce.isSampleData) return null;
  return <Text style={styles.text}>Sample data · not a live Shopify store</Text>;
}

const styles = StyleSheet.create({
  text: { textAlign: 'center', fontSize: 11, paddingVertical: 4, color: theme.colors.muted, backgroundColor: theme.colors.surface, letterSpacing: 0.5 },
});
