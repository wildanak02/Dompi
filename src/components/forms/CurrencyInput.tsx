import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string; // Should be a string of digits, e.g., "150000"
  onChangeDigits: (digits: string) => void;
  placeholder?: string;
}

export default function CurrencyInput({ label, value, onChangeDigits, placeholder = 'Rp 0', ...props }: CurrencyInputProps) {
  const { theme } = useTheme();

  const formatCurrency = (digits: string) => {
    if (!digits) return '';
    const number = parseInt(digits, 10) || 0;
    return 'Rp ' + Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleChangeText = (text: string) => {
    const newDigits = (text || '').replace(/\D/g, ''); // Remove all non-digit characters
    onChangeDigits(newDigits);
  };

  const formattedValue = formatCurrency(value);

  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && <Text style={{ color: theme.subtext, marginBottom: 6, fontSize: 12 }}>{label}</Text>}
      <TextInput
        value={formattedValue}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        placeholder={placeholder}
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
