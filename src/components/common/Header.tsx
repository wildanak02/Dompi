import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
}

export default function Header({ title, right }: HeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={{
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.bg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
      {right}
    </View>
  );
}
