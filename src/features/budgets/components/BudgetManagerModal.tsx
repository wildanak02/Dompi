import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

import { useLocalization } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Budget } from '@/types';
import { currency } from '@/utils/format';

import Card from '@/components/common/Card';
import Header from '@/components/common/Header';

// --- Sub-component: Modal for Editing a Single Budget ---
interface EditBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  cat: string;
  value: number;
  onSave: (amount: number) => void;
}

function EditBudgetModal({ visible, onClose, cat, value, onSave }: EditBudgetModalProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [digits, setDigits] = useState(value ? String(Math.round(value)) : '');

  useEffect(() => {
    // Reset the input value when the modal is opened for a new category
    setDigits(value ? String(Math.round(value)) : '');
  }, [value, visible]);

  const formattedValue = digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

  const handleSave = () => {
    onSave(parseInt(digits || '0', 10) || 0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{t('budget')}</Text>
          <Text style={{ color: theme.subtext, marginBottom: 16, fontSize: 16 }}>{cat}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card2, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 12 }}>
            <Text style={{ color: theme.subtext, marginRight: 8, fontSize: 16 }}>Rp</Text>
            <TextInput
              value={formattedValue}
              onChangeText={txt => setDigits((txt || '').replace(/\D/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={theme.subtext}
              style={{ flex: 1, color: theme.text, paddingVertical: 14, fontSize: 16 }}
              autoFocus
              onSubmitEditing={handleSave}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <Pressable onPress={onClose} style={{ paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: theme.border, borderRadius: 10 }}><Text style={{ color: theme.subtext, fontWeight: '600' }}>{t('cancel')}</Text></Pressable>
            <Pressable onPress={handleSave} style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.primary, borderRadius: 10 }}><Text style={{ color: '#fff', fontWeight: '700' }}>{t('saveChanges')}</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}


// --- Sub-component: A Single Row in the Budget List ---
interface BudgetRowProps {
  cat: string;
  value: number;
  onEdit: () => void;
}

function BudgetRowCompact({ cat, value, onEdit }: BudgetRowProps) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Text style={{ color: theme.text, fontSize: 16, flex: 1 }} numberOfLines={1}>{cat}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 }}>
        <Text style={{ color: theme.subtext, fontSize: 15 }}>{currency(value)}</Text>
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


// --- Main Component: The Full-Screen Modal ---
interface BudgetManagerModalProps {
  visible: boolean;
  onClose: () => void;
  cats: string[];
  budgets: Budget;
  setBudget: (category: string, amount: number) => Promise<void>;
}

export default function BudgetManagerModal({ visible, onClose, cats, budgets, setBudget }: BudgetManagerModalProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [editingCat, setEditingCat] = useState<string | null>(null);

  const handleEdit = (category: string) => {
    setEditingCat(category);
  };

  const handleSaveBudget = async (amount: number) => {
    if (editingCat) {
      await setBudget(editingCat, amount);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header
          title={t('budget')}
          right={
            <Pressable onPress={onClose} style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.7 : 1 })}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </Pressable>
          }
        />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Card>
            {cats.map((cat) => (
              <BudgetRowCompact
                key={`exp:${cat}`}
                cat={cat}
                value={budgets[cat] || 0}
                onEdit={() => handleEdit(cat)}
              />
            ))}
            <Text style={{ color: theme.subtext, marginTop: 12, fontSize: 12, textAlign: 'center' }}>
              {t('budgetDesc')}
            </Text>
          </Card>
        </ScrollView>

        <EditBudgetModal
          visible={!!editingCat}
          onClose={() => setEditingCat(null)}
          cat={editingCat || ''}
          value={editingCat ? (budgets[editingCat] || 0) : 0}
          onSave={handleSaveBudget}
        />
      </SafeAreaView>
    </Modal>
  );
}
