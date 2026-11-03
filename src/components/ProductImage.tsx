import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ImageStyle, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

type Props = {
  url: string | null;
  swatch: string | null;
  label: string;
  style?: ViewStyle;
  compact?: boolean;
};

export function ProductImage({ url, swatch, label, style, compact }: Props) {
  if (url) {
    return <Image source={{ uri: url }} style={[styles.base as ImageStyle, style as ImageStyle]} contentFit="cover" transition={150} accessibilityLabel={label} />;
  }
  return (
    <View style={[styles.base, { backgroundColor: theme.colors.surface }, style]} accessibilityLabel={label}>
      <View style={[styles.swatch, { backgroundColor: swatch ?? theme.colors.border, borderRadius: theme.radius * 2 }]}>
        {!compact && <Text style={styles.type}>{label}</Text>}
      </View>
      {!compact && <Text style={styles.sample}>SAMPLE IMAGE</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  swatch: { width: '62%', height: '62%', alignItems: 'center', justifyContent: 'center', opacity: 0.9, borderWidth: StyleSheet.hairlineWidth, borderColor: '#0002' },
  type: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4 },
  sample: { position: 'absolute', bottom: 6, right: 8, fontSize: 9, color: theme.colors.muted, letterSpacing: 1 },
});
