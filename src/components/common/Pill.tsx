import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
}

export default function Pill({ label, active, onPress, color }: PillProps) {
  const { theme } = useTheme();
  const activeColor = color || theme.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? activeColor : theme.border,
        backgroundColor: active ? (theme.name === 'dark' ? '#24170C' : '#FFF1E6') : 'transparent',
        opacity: pressed ? 0.7 : 1,
        marginRight: 8,
      })}
    >
      <Text style={{ color: active ? theme.primary : theme.subtext, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
