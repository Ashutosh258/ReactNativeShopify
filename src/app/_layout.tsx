import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { CartButton } from '@/components/CartButton';
import { LoadingView } from '@/components/StateViews';
import { store } from '@/config';
import { useHydrated } from '@/hooks/useHydrated';
import { theme } from '@/theme';

export default function RootLayout() {
  const hydrated = useHydrated();
  const { colors } = theme;

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingView />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
          headerRight: () => <CartButton color={colors.text} />,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: store.branding.logoText, headerBackVisible: false }} />
        <Stack.Screen name="product/[handle]" options={{ title: '' }} />
        <Stack.Screen name="cart" options={{ title: 'Your bag', headerRight: () => null }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout', presentation: 'modal', headerRight: () => null }} />
      </Stack>
    </>
  );
}
