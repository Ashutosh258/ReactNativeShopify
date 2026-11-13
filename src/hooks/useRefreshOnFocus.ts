import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

export function useRefreshOnFocus(refresh: () => void) {
  const focused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focused.current) refresh();
      focused.current = true;
    }, [refresh]),
  );
}
