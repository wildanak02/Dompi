import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, Alert } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { Transaction } from '@/types';
import { toISODateString } from '@/utils/date';

import Pill from '@/components/common/Pill';
import Input from '@/components/common/Input';
import CurrencyInput from '@/components/forms/CurrencyInput';
import CategoryDropdown from '@/components/forms/CategoryDropdown';
import DatePickerField from '@/components/forms/DatePickerField';

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  initial?: Transaction;
  expCats: string[];
  incCats: string[];
}

export default function TransactionForm({ onSubmit, initial, expCats, incCats }: TransactionFormProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();

  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense');
  const [amountDigits, setAmountDigits] = useState(initial ? String(Math.round(initial.amount)) : '');
  const [category, setCategory] = useState(initial?.category || '');
  const [note, setNote] = useState(initial?.note || '');
  const [date, setDate] = useState(initial?.date || toISODateString(new Date()));

  // Effect to reset form state when the 'initial' prop changes (e.g., when switching from add to edit)
  useEffect(() => {
    if (initial) {
      setType(initial.type);
      setAmountDigits(String(Math.round(initial.amount)));
      setCategory(initial.category);
      setNote(initial.note || '');
      setDate(initial.date);
    } else {
      // Reset to default for a new transaction
      setType('expense');
      setAmountDigits('');
      setCategory('');
      setNote('');
      setDate(toISODateString(new Date()));
    }
  }, [initial]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    if (type !== newType) {
      setType(newType);
      // Reset category when type changes, as categories are different
      setCategory('');
    }
  };

  const handleSave = () => {
    const amount = parseInt(amountDigits || '0', 10);
    const missingFields = [];
    if (!amount) missingFields.push(t('amount'));
    if (!category) missingFields.push(t('categoryLabel'));
    if (!date) missingFields.push(t('date'));

    if (missingFields.length > 0) {
      Alert.alert('Wajib diisi', `Harap isi kolom berikut: ${missingFields.join(', ')}`);
      return;
    }
    onSubmit({ type, amount, category, note, date });
  };

  const availableCategories = type === 'expense' ? expCats : incCats;

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <Pill label={t('expense')} active={type === 'expense'} color={theme.expense} onPress={() => handleTypeChange('expense')} />
        <Pill label={t('income')} active={type === 'income'} color={theme.income} onPress={() => handleTypeChange('income')} />
      </View>

      <CurrencyInput label={t('amount')} value={amountDigits} onChangeDigits={setAmountDigits} />
      <CategoryDropdown
        label={`${t('categoryLabel')} (${type === 'expense' ? t('expense').toLowerCase() : t('income').toLowerCase()})`}
        value={category}
        onChange={setCategory}
        options={availableCategories}
      />
      <DatePickerField label={t('date')} date={date} onChange={setDate} />
      <Input label={t('noteOptional')} value={note} onChangeText={setNote} placeholder={t('notePlaceholder')} />

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => ({
          backgroundColor: theme.primary,
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
          marginTop: 16,
        })}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
          {initial ? t('saveChanges') : t('addTx')}
        </Text>
      </Pressable>
    </View>
  );
}
