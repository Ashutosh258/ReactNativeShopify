import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { common, theme } from '@/theme';
import { Button } from './Button';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={common.center} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[common.muted, styles.gap]}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={common.center}>
      <Text style={[theme.heading, styles.title]}>Something went wrong</Text>
      <Text style={[common.muted, styles.message]}>{message}</Text>
      {onRetry && <Button label="Try again" onPress={onRetry} style={styles.button} testID="retry" />}
    </View>
  );
}

export function EmptyView({ title, body, action }: { title: string; body: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={common.center}>
      <Text style={[theme.heading, styles.title]}>{title}</Text>
      <Text style={[common.muted, styles.message]}>{body}</Text>
      {action && <Button label={action.label} onPress={action.onPress} style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: 12 },
  title: { fontSize: 20, textAlign: 'center' },
  message: { marginTop: 8, textAlign: 'center', fontSize: 15 },
  button: { marginTop: 24, alignSelf: 'stretch' },
});
