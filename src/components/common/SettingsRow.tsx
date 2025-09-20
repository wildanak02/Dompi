import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  iconColor?: string; // <-- PROPERTI BARU (OPSIONAL)
  labelColor?: string; // <-- PROPERTI BARU (OPSIONAL)
}

export default function SettingsRow({
  icon,
  label,
  onPress,
  rightContent,
  iconColor, // <-- PROPS BARU
  labelColor, // <-- PROPS BARU
}: SettingsRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.card,
          opacity: pressed && onPress ? 0.7 : 1,
        },
      ]}
    >
      {/* Menggunakan iconColor jika ada, jika tidak, gunakan warna default */}
      <Ionicons name={icon} size={22} color={iconColor || theme.subtext} style={styles.icon} />
      {/* Menggunakan labelColor jika ada, jika tidak, gunakan warna default */}
      <Text style={[styles.label, { color: labelColor || theme.text }]}>{label}</Text>
      
      <View>{rightContent}</View>
      {onPress && <Ionicons name="chevron-forward-outline" size={20} color={theme.subtext} style={{ marginLeft: 8 }} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    width: 30,
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
});