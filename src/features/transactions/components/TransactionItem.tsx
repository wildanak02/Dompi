import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { Transaction } from '@/types';
import { currency } from '@/utils/format';

interface TransactionItemProps {
  item: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TransactionItem({ item, onEdit, onDelete }: TransactionItemProps) {
  const { theme } = useTheme();
  const { locale } = useLocalization();
  const transactionDate = parseISO(item.date);

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
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16 }}>{item.category}</Text>
        <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 4 }}>
          {format(transactionDate, 'dd MMM yyyy', { locale })}
          {item.note ? ` • ${item.note}` : ''}
        </Text>
      </View>

      <Text
        style={{
          color: item.type === 'income' ? theme.income : theme.expense,
          fontWeight: '700',
          marginRight: 12,
          fontSize: 15,
        }}
      >
        {item.type === 'income' ? '+' : '-'}
        {currency(item.amount)}
      </Text>

      <View style={{ flexDirection: 'row', gap: 0 }}>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => ({ padding: 8, borderRadius: 8, opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons name="create-outline" size={20} color={theme.subtext} />
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({ padding: 8, borderRadius: 8, opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons name="trash-outline" size={20} color={theme.expense} />
        </Pressable>
      </View>
    </View>
  );
}
