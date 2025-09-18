import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
}

export default function SettingsRow({ icon, label, onPress, rightContent }: SettingsRowProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        paddingVertical: 14,
        paddingHorizontal: 16,
        opacity: pressed && onPress ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={theme.subtext} style={{ width: 30 }} />
      <Text style={{ flex: 1, color: theme.text, fontSize: 16, marginLeft: 12 }}>{label}</Text>
      <View>{rightContent}</View>
      {onPress && <Ionicons name="chevron-forward-outline" size={20} color={theme.subtext} style={{ marginLeft: 8 }} />}
    </Pressable>
  );
}
