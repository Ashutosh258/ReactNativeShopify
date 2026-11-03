import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { store } from '@/config';

type AppState = {
  welcomeSeen: boolean;
  setWelcomeSeen: (seen: boolean) => void;
};

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      welcomeSeen: false,
      setWelcomeSeen: (welcomeSeen) => set({ welcomeSeen }),
    }),
    {
      name: `app:${store.id}`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ welcomeSeen }) => ({ welcomeSeen }),
    },
  ),
);
