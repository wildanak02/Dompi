import React from 'react';
import { Modal, Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';

interface NotificationModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function NotificationModal({ visible, type, title, message, onConfirm, onClose }: NotificationModalProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();

  if (!visible) return null;

  const icons: Record<typeof type, keyof typeof Ionicons.glyphMap> = {
    success: 'checkmark-circle-outline',
    error: 'close-circle-outline',
    confirm: 'help-circle-outline',
  };
  const colors = {
    success: '#1DB954',
    error: '#FF5A5F',
    confirm: '#FFC400',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}
      >
        <Pressable style={{ backgroundColor: theme.card, borderRadius: 16, padding: 24, alignItems: 'center', width: '85%', borderWidth: 1, borderColor: theme.border }}>
          <Ionicons name={icons[type]} size={50} color={colors[type]} style={{ marginBottom: 12 }} />
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
          <Text style={{ color: theme.subtext, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>{message}</Text>
          {type === 'confirm' ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  backgroundColor: theme.card2,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: 1,
                  borderColor: theme.border,
                })}
              >
                <Text style={{ color: theme.subtext, fontWeight: '700' }}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                style={({ pressed }) => ({
                  backgroundColor: colors.error,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>{t('delete')}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                backgroundColor: theme.primary,
                paddingVertical: 12,
                paddingHorizontal: 32,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>{t('ok')}</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
