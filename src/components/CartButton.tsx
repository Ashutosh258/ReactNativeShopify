import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { selectCount, useCart } from '@/state/cart';
import { theme } from '@/theme';

export function CartButton({ color }: { color: string }) {
  const count = useCart(selectCount);
  return (
    <Link href="/cart" asChild>
      <Pressable hitSlop={10} accessibilityLabel={`Bag, ${count} items`} testID="cart-button" style={styles.button}>
        <View style={[styles.bag, { borderColor: color }]}>
          <View style={[styles.handle, { borderColor: color }]} />
        </View>
        {count > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4 },
  bag: { width: 20, height: 18, borderWidth: 2, borderRadius: 2, marginTop: 6 },
  handle: { position: 'absolute', top: -8, left: 3, width: 10, height: 8, borderWidth: 2, borderBottomWidth: 0, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  badge: { position: 'absolute', top: -2, right: -6, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});
