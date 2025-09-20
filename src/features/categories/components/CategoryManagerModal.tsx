import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';

import Header from '@/components/common/Header';
import { useLocalization } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryManagerModalProps {
  kind: 'income' | 'expense';
  visible: boolean;
  onClose: () => void;
  list: string[];
  addCat: (kind: 'income' | 'expense', name: string) => Promise<void>;
  editCat: (kind: 'income' | 'expense', oldName: string, newName: string) => Promise<void>;
  removeCat: (kind: 'income' | 'expense', name: string) => Promise<void>;
}

export default function CategoryManagerModal({
  kind,
  visible,
  onClose,
  list,
  addCat,
  editCat,
  removeCat,
}: CategoryManagerModalProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();

  const [newName, setNewName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const title = kind === 'expense' ? t('manageCatExpense') : t('manageCatIncome');

  const handleStartEdit = (name: string) => {
    setEditingCat(name);
    setEditValue(name);
  };

  const handleSaveEdit = async () => {
    if (editingCat && editValue.trim()) {
      await editCat(kind, editingCat, editValue.trim());
    }
    setEditingCat(null);
    setEditValue('');
  };

  const handleAddCategory = async () => {
    if (newName.trim()) {
      await addCat(kind, newName.trim());
      setNewName('');
    }
  };

  const handleRemoveCategory = (name: string) => {
    Alert.alert(
      "Hapus Kategori",
      `Apakah Anda yakin ingin menghapus kategori "${name}"? Ini tidak akan menghapus transaksi yang sudah ada.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => await removeCat(kind, name),
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: string }) => {
    const isEditing = editingCat === item;

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
        {isEditing ? (
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: theme.card2,
              color: theme.text,
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.primary,
              fontSize: 16,
            }}
            onSubmitEditing={handleSaveEdit}
          />
        ) : (
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>{item}</Text>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 12 }}>
          {isEditing ? (
            <Pressable onPress={handleSaveEdit} style={{ padding: 8 }}>
              <Ionicons name="checkmark-outline" size={24} color={theme.income} />
            </Pressable>
          ) : (
            <Pressable onPress={() => handleStartEdit(item)} style={{ padding: 8 }}>
              <Ionicons name="create-outline" size={22} color={theme.subtext} />
            </Pressable>
          )}
          <Pressable onPress={() => handleRemoveCategory(item)} style={{ padding: 8 }}>
            <Ionicons name="trash-outline" size={22} color={theme.expense} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Header
            title={title}
            right={
              <Pressable onPress={onClose} style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.7 : 1 })}>
                <Ionicons name="close" size={24} color={theme.subtext} />
              </Pressable>
            }
          />

          <FlatList
            data={list}
            keyExtractor={item => item}
            renderItem={renderCategoryItem}
            contentContainerStyle={{ padding: 16 }}
          />

          {/* Input Form at the Bottom */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              backgroundColor: theme.bg,
            }}
          >
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={t('addCatPlaceholder', { kind: t(kind) })}
              placeholderTextColor={theme.subtext}
              style={{
                flex: 1,
                backgroundColor: theme.card2,
                color: theme.text,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                fontSize: 16,
              }}
              onSubmitEditing={handleAddCategory}
            />
            <Pressable
              onPress={handleAddCategory}
              style={({ pressed }) => ({
                backgroundColor: theme.primary,
                paddingHorizontal: 16,
                justifyContent: 'center',
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons name="add" size={28} color={'white'} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
