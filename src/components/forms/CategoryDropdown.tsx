import React, { useState } from 'react';
import { Modal, Pressable, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryDropdownProps {
  label: string;
  value: string;
  onChange: (option: string) => void;
  options: string[];
}

export default function CategoryDropdown({ label, value, onChange, options }: CategoryDropdownProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && <Text style={{ color: theme.subtext, marginBottom: 6, fontSize: 12 }}>{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.card2,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 12,
          borderRadius: 12,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: value ? theme.text : theme.subtext }}>{value || 'Pilih kategori'}</Text>
        <Ionicons name="chevron-down-outline" size={18} color={theme.subtext} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 }}
        >
          <Pressable style={{ backgroundColor: theme.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.subtext, marginBottom: 8, paddingHorizontal: 8 }}>Pilih Kategori</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map(opt => (
                <Pressable
                  key={String(opt)}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: pressed ? theme.card2 : 'transparent',
                  })}
                >
                  <Text style={{ color: theme.text }}>{opt || 'Semua'}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
