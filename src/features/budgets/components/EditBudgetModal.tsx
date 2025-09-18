import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, TextInput } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';

interface EditBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  cat: string;
  value: number;
  onSave: (amount: number) => void;
}

export default function EditBudgetModal({ visible, onClose, cat, value, onSave }: EditBudgetModalProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();
  // State to hold the raw digit string for the input
  const [digits, setDigits] = useState(value ? String(Math.round(value)) : '');

  // Effect to reset the input's value whenever the modal is opened for a new/different category
  useEffect(() => {
    if (visible) {
      setDigits(value ? String(Math.round(value)) : '');
    }
  }, [value, visible]);

  // Format the raw digits with thousand separators for display
  const formattedValue = digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

  const handleSave = () => {
    // Convert the digit string to a number, default to 0 if empty or invalid
    onSave(parseInt(digits || '0', 10) || 0);
    onClose(); // Close the modal after saving
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      {/* Background overlay that closes the modal on press */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* Modal content container, uses a Pressable to stop propagation */}
        <Pressable
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            {t('budget')}
          </Text>
          <Text style={{ color: theme.subtext, marginBottom: 16, fontSize: 16 }}>
            {cat}
          </Text>

          {/* Currency Input Field */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card2,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: theme.subtext, marginRight: 8, fontSize: 16 }}>Rp</Text>
            <TextInput
              value={formattedValue}
              onChangeText={txt => setDigits((txt || '').replace(/\D/g, ''))} // Remove non-digit characters
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={theme.subtext}
              style={{ flex: 1, color: theme.text, paddingVertical: 14, fontSize: 16 }}
              autoFocus={true}
              onSubmitEditing={handleSave} // Allow saving by pressing enter on keyboard
            />
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: theme.subtext, fontWeight: '600' }}>{t('cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: theme.primary,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>{t('saveChanges')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
