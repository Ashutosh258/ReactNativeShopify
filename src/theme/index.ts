import { StyleSheet, type TextStyle } from 'react-native';
import { store } from '@/config';

const { colors, radius, uppercaseHeadings, headingLetterSpacing } = store.branding;

export const theme = {
  colors,
  radius,
  space: (n: number) => n * 4,
  heading: {
    fontWeight: '800',
    letterSpacing: headingLetterSpacing,
    textTransform: uppercaseHeadings ? 'uppercase' : 'none',
    color: colors.text,
  } satisfies TextStyle,
};

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  body: { color: colors.text, fontSize: 15, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 13 },
});
