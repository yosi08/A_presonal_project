import React, { createContext, useContext, useMemo } from 'react';
import { colors, ThemeColors } from './colors';

interface ThemeContextType {
  theme: 'light' | 'dark';
  c: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  c: colors.light,
  isDark: false,
});

export function ThemeProvider({
  theme,
  children,
}: {
  theme: 'light' | 'dark';
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      theme,
      c: theme === 'dark' ? colors.dark : colors.light,
      isDark: theme === 'dark',
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
