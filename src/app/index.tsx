import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { store } from '@/config';
import { useAppState } from '@/state/app';
import { theme } from '@/theme';

export default function Welcome() {
  const welcomeSeen = useAppState((s) => s.welcomeSeen);
  const setWelcomeSeen = useAppState((s) => s.setWelcomeSeen);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [height, setHeight] = useState(0);
  const list = useRef<FlatList>(null);
  const { slides } = store.welcome;
  const { colors } = theme;

  if (welcomeSeen) return <Redirect href="/home" />;

  const finish = () => {
    setWelcomeSeen(true);
    router.replace('/home');
  };

  const next = () => {
    if (index >= slides.length - 1) return finish();
    list.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.primary }]}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <Text style={[styles.logo, { color: colors.onPrimary, letterSpacing: theme.heading.letterSpacing * 4 }]}>
          {store.branding.logoText}
        </Text>
        <Pressable onPress={finish} hitSlop={12} testID="skip" accessibilityRole="button">
          <Text style={[styles.skip, { color: colors.onPrimary }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, height }]}>
            <Text style={[theme.heading, styles.title, { color: colors.onPrimary }]}>{item.title}</Text>
            <Text style={[styles.body, { color: colors.onPrimary }]}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.title} style={[styles.dot, { backgroundColor: colors.onPrimary, opacity: i === index ? 1 : 0.3 }]} />
          ))}
        </View>
        <Text style={[styles.tagline, { color: colors.onPrimary }]}>{store.branding.tagline}</Text>
        <Button
          label={index === slides.length - 1 ? 'Start shopping' : 'Next'}
          onPress={next}
          variant="inverse"
          testID="welcome-next"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  logo: { fontSize: 22, fontWeight: '900' },
  skip: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  slide: { justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 44, lineHeight: 48 },
  body: { fontSize: 17, lineHeight: 24, marginTop: 12, opacity: 0.85 },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 16 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 24, height: 3 },
  tagline: { fontSize: 13, opacity: 0.7 },
});
