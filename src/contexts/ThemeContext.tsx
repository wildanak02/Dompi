// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { THEME_KEY, AUTO_THEME_KEY } from '@/constants/storageKeys';
import { LIGHT_THEME, DARK_THEME } from '@/constants/theme';
import { Theme } from '@/types';

interface ThemeContextProps {
  theme: Theme;
  isAutoTheme: boolean;
  setTheme: (theme: Theme) => void;
  setIsAutoTheme: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: DARK_THEME,
  isAutoTheme: true,
  setTheme: () => {},
  setIsAutoTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setRawTheme] = useState(DARK_THEME);
  const [isAutoTheme, setAutoTheme] = useState(true);

  useEffect(() => {
    const loadThemePrefs = async () => {
      const savedAuto = await AsyncStorage.getItem(AUTO_THEME_KEY);
      const isAuto = savedAuto ? JSON.parse(savedAuto) : true;
      setAutoTheme(isAuto);

      if (isAuto) {
        const hour = new Date().getHours();
        setRawTheme(hour >= 18 || hour < 6 ? DARK_THEME : LIGHT_THEME);
      } else {
        const savedThemeName = await AsyncStorage.getItem(THEME_KEY);
        setRawTheme(savedThemeName === 'light' ? LIGHT_THEME : DARK_THEME);
      }
    };
    loadThemePrefs();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.bg);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setRawTheme(newTheme);
    setAutoTheme(false);
    AsyncStorage.setItem(THEME_KEY, newTheme.name);
    AsyncStorage.setItem(AUTO_THEME_KEY, JSON.stringify(false));
  };

  const setIsAutoTheme = (enabled: boolean) => {
    setAutoTheme(enabled);
    AsyncStorage.setItem(AUTO_THEME_KEY, JSON.stringify(enabled));
    if (enabled) {
      const hour = new Date().getHours();
      setRawTheme(hour >= 18 || hour < 6 ? DARK_THEME : LIGHT_THEME);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isAutoTheme, setTheme, setIsAutoTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
