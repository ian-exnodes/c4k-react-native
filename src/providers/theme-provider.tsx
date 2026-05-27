// src/providers/theme-provider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTokens } from '@/theme/light';
import { darkTokens } from '@/theme/dark';
import type { Tokens } from '@/theme/tokens';

type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  tokens: Tokens;
  isDark: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = '@finance/theme-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load persisted preference on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => { /* swallow: storage failure is non-fatal */ });
  };

  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const tokens = isDark ? darkTokens : lightTokens;

  return (
    <ThemeContext.Provider value={{ mode, setMode, tokens, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
