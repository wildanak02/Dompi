import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SectionTitleProps {
  children: React.ReactNode;
  right?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function SectionTitle({ children, right, iconName }: SectionTitleProps) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {iconName && <Ionicons name={iconName} size={18} color={theme.subtext} style={{ marginRight: 8 }} />}
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>{children}</Text>
      </View>
      {right}
    </View>
  );
}
