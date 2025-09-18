import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';

interface TabBarProps {
  current: string;
  setCurrent: (tab: string) => void;
}

// Mendefinisikan tipe ikon yang valid dari Ionicons
type TabIconName = keyof typeof Ionicons.glyphMap;

interface Tab {
  key: string;
  labelKey: 'dashboard' | 'transactions' | 'settings';
  icon: TabIconName;
}

export default function TabBar({ current, setCurrent }: TabBarProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();

  const tabs: Tab[] = [
    { key: 'dashboard', labelKey: 'dashboard', icon: 'home' },
    { key: 'transactions', labelKey: 'transactions', icon: 'list' },
    { key: 'settings', labelKey: 'settings', icon: 'settings' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.card,
        paddingVertical: 8,
        paddingBottom: 20, // Padding tambahan untuk area aman di bagian bawah
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {tabs.map(tab => {
        const isActive = current === tab.key;
        const color = isActive ? theme.primary : theme.subtext;
        const iconName = `${tab.icon}${isActive ? '' : '-outline'}` as TabIconName;

        return (
          <Pressable
            key={tab.key}
            onPress={() => setCurrent(tab.key)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
              padding: 4,
            })}
          >
            <Ionicons name={iconName} size={22} color={color} />
            <Text style={{ color: color, fontSize: 11, marginTop: 4, fontWeight: isActive ? '600' : '400' }}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
