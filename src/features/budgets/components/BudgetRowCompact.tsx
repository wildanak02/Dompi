import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { currency } from '@/utils/format';

interface BudgetRowProps {
  cat: string;
  value: number;
  onEdit: () => void;
}

export default function BudgetRowCompact({ cat, value, onEdit }: BudgetRowProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 16, flex: 1 }} numberOfLines={1}>
        {cat}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 }}>
        <Text style={{ color: theme.subtext, fontSize: 15 }}>
          {currency(value)}
        </Text>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: theme.border,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: pressed ? theme.card2 : 'transparent',
          })}
        >
          <Text style={{ color: theme.text, fontWeight: '600' }}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}
