import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay, parseISO, startOfDay, addDays } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { Transaction } from '@/types';
import { currency } from '@/utils/format';
import { NotificationConfig } from '@/types';

import Pill from '@/components/common/Pill';
import Input from '@/components/common/Input';
import FAB from '@/components/common/FAB';
import CategoryDropdown from '@/components/forms/CategoryDropdown';
import TransactionItem from '@/features/transactions/components/TransactionItem';

interface TransactionsScreenProps {
  items: Transaction[];
  remove: (id: string) => void;
  expCats: string[];
  incCats: string[];
  onAddPress: () => void;
  onEditPress: (item: Transaction) => void;
  showNotification: (config: Omit<NotificationConfig, 'visible'>) => void;
}

export default function TransactionsScreen({
  items,
  remove,
  expCats,
  incCats,
  onAddPress,
  onEditPress,
  showNotification,
}: TransactionsScreenProps) {
  const { theme } = useTheme();
  const { t, locale } = useLocalization();

  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'income' | 'expense'>('all');
  const [activeDate, setActiveDate] = useState(startOfDay(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const confirmDelete = (item: Transaction) => {
    showNotification({
      type: 'confirm',
      title: t('confirmDeleteTitle'),
      message: t('confirmDeleteMsg', item.category, currency(item.amount)),
      onConfirm: () => remove(item.id),
    });
  };

  const allCats = useMemo(() => Array.from(new Set([...expCats, ...incCats])), [expCats, incCats]);
  const filterCats = activeType === 'income' ? incCats : (activeType === 'expense' ? expCats : allCats);

  const filteredItems = useMemo(() => {
    const lowercasedQuery = (query || '').toLowerCase();
    return items.filter(item => {
      const sameDay = isSameDay(parseISO(item.date), activeDate);
      const typeOk = activeType === 'all' ? true : item.type === activeType;
      const textOk = !lowercasedQuery || item.category.toLowerCase().includes(lowercasedQuery) || (item.note || '').toLowerCase().includes(lowercasedQuery);
      const catOk = !filterCategory || item.category === filterCategory;
      return sameDay && typeOk && textOk && catOk;
    });
  }, [items, query, activeType, activeDate, filterCategory, expCats, incCats]);

  const dailyTotals = useMemo(() => {
    return filteredItems.reduce(
      (totals, item) => {
        if (item.type === 'income') totals.income += item.amount;
        else totals.expense += item.amount;
        return totals;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredItems]);

  const dayLabel = format(activeDate, 'EEEE, dd MMM yyyy', { locale });

  return (
    <View style={{ flex: 1, paddingBottom: 80 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', marginBottom: 12, justifyContent: 'center' }}>
          <Pill label={t('all')} active={activeType === 'all'} onPress={() => setActiveType('all')} />
          <Pill label={t('income')} active={activeType === 'income'} color={theme.income} onPress={() => setActiveType('income')} />
          <Pill label={t('expense')} active={activeType === 'expense'} color={theme.expense} onPress={() => setActiveType('expense')} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Pressable onPress={() => setActiveDate(d => addDays(d, -1))} style={{ padding: 8 }}><Ionicons name="chevron-back" size={22} color={theme.subtext} /></Pressable>
          <Pressable onPress={() => setShowDatePicker(true)}><Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{dayLabel}</Text></Pressable>
          <Pressable onPress={() => setActiveDate(d => addDays(d, 1))} style={{ padding: 8 }}><Ionicons name="chevron-forward" size={22} color={theme.subtext} /></Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={activeDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(evt, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setActiveDate(startOfDay(selected));
            }}
          />
        )}

        <CategoryDropdown label={t('filterCategory')} value={filterCategory} onChange={setFilterCategory} options={['', ...filterCats]} />
        <Input value={query} onChangeText={setQuery} placeholder={t('searchPlaceholder')} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.border, marginTop: 8}}>
        {(activeType === 'all' || activeType === 'income') && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.subtext }}>{t('totalIncome')}</Text>
            <Text style={{ color: theme.income, fontWeight: 'bold' }}>{currency(dailyTotals.income)}</Text>
          </View>
        )}
        {(activeType === 'all' || activeType === 'expense') && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: activeType === 'all' ? 4 : 0 }}>
            <Text style={{ color: theme.subtext }}>{t('totalExpense')}</Text>
            <Text style={{ color: theme.expense, fontWeight: 'bold' }}>{currency(dailyTotals.expense)}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem item={item} onEdit={() => onEditPress(item)} onDelete={() => confirmDelete(item)} />}
        ListEmptyComponent={<Text style={{ color: theme.subtext, textAlign: 'center', paddingVertical: 48 }}>{t('noTxData')}</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
      />
      <FAB onPress={onAddPress} />
    </View>
  );
}
