// src/hooks/use-theme.ts
import { useContext } from 'react';
import { ThemeContext } from '@/providers/theme-provider';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
