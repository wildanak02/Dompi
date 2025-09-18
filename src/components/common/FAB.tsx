import React from 'react';
import { Pressable, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface FABProps {
  onPress: () => void;
}

const FAB_BOTTOM = 95; // Disesuaikan agar tidak tertutup TabBar

export default function FAB({ onPress }: FABProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: theme.primary },
        // Gunakan boxShadow untuk web, dan properti shadow lama untuk native
        Platform.OS === 'web'
          ? { boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }
          : styles.nativeShadow,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Ionicons name="add" size={28} color={'white'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    right: 20,
    bottom: FAB_BOTTOM,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeShadow: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
