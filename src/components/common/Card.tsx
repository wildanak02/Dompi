import React, { ReactNode } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: object;
}

export default function Card({ children, style }: CardProps) {
  const { theme } = useTheme();

  // Gabungkan gaya dasar, gaya dari props, dan gaya spesifik platform
  const cardStyle = [
    styles.base,
    {
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    // Gunakan boxShadow untuk web, dan properti shadow lama untuk native
    Platform.OS === 'web'
      ? { boxShadow: theme.name === 'dark' ? '0 1px 2px rgba(255,255,255,0.1)' : '0 1px 2px rgba(0,0,0,0.05)' }
      : styles.nativeShadow,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  nativeShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});
