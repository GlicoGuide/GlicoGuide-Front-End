import React, { createContext, useContext, useState } from 'react';
import { AppColors, darkTheme, lightTheme } from '../theme/themes';

interface ThemeContextData {
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const colors = isDark ? darkTheme : lightTheme;

  function toggleTheme() {
    setIsDark(v => !v);
  }

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
