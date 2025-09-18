import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
}

export default function Input({ label, ...props }: InputProps) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && <Text style={{ color: theme.subtext, marginBottom: 6, fontSize: 12 }}>{label}</Text>}
      <TextInput
        placeholderTextColor={theme.subtext}
        style={{
          backgroundColor: theme.card2,
          color: theme.text,
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
        }}
        {...props}
      />
    </View>
  );
}
