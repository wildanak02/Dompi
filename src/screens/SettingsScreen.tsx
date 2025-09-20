import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { DARK_THEME, LIGHT_THEME } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

import SettingsRow from '@/components/common/SettingsRow';

// Hapus semua props yang tidak lagi dibutuhkan karena sekarang diambil dari context/hooks
interface SettingsScreenProps {
  openModal: (modal: 'catIncome' | 'catExpense' | 'budget' | 'report' | 'language') => void;
}

export default function SettingsScreen({ openModal }: SettingsScreenProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, isAutoTheme, setIsAutoTheme } = useTheme();
  const { t, lang } = useLocalization();

  const handleLogout = () => {
    Alert.alert(
      t('logout'), // Judul
      "Apakah Anda yakin ingin keluar?", // Pesan (sesuaikan di file lokalisasi Anda jika perlu)
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',
          // Panggil fungsi logout hanya jika pengguna menekan tombol "Logout"
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.name === 'light' ? '#F0F1F4' : theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={{ paddingVertical: 16 }}>
          {/* General Settings */}
          <Text style={{ paddingHorizontal: 16, marginBottom: 8, color: theme.subtext, fontSize: 12, textTransform: 'uppercase' }}>{t('settings')}</Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginHorizontal: 16 }}>
            <SettingsRow
              icon="color-palette-outline"
              label={t('theme')}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: theme.subtext }}>{t('autoTheme')}</Text>
                  <Switch value={isAutoTheme} onValueChange={setIsAutoTheme} trackColor={{ false: theme.card2, true: theme.primary }} thumbColor={'#fff'} />
                </View>
              }
            />
            {!isAutoTheme && (
              <View style={{ backgroundColor: theme.card, padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <Pressable onPress={() => setTheme(LIGHT_THEME)} style={[{ alignItems: 'center', padding: 8, borderWidth: 2, borderRadius: 8, flex: 1, marginRight: 8 }, { borderColor: theme.name === 'light' ? theme.primary : 'transparent' }]}>
                    <Ionicons name="sunny-outline" size={24} color={theme.text} />
                    <Text style={{ color: theme.text, marginTop: 4 }}>{t('light')}</Text>
                  </Pressable>
                  <Pressable onPress={() => setTheme(DARK_THEME)} style={[{ alignItems: 'center', padding: 8, borderWidth: 2, borderRadius: 8, flex: 1, marginLeft: 8 }, { borderColor: theme.name === 'dark' ? theme.primary : 'transparent' }]}>
                    <Ionicons name="moon-outline" size={24} color={theme.text} />
                    <Text style={{ color: theme.text, marginTop: 4 }}>{t('dark')}</Text>
                  </Pressable>
                </View>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 58 }} />
            <SettingsRow
              icon="language-outline"
              label={t('language')}
              onPress={() => openModal('language')}
              rightContent={<Text style={{ color: theme.subtext, marginRight: 8 }}>{lang === 'id' ? 'Indonesia' : 'English'}</Text>}
            />
          </View>
          

          {/* Customization */}
          <Text style={{ paddingHorizontal: 16, marginVertical: 8, marginTop: 24, color: theme.subtext, fontSize: 12, textTransform: 'uppercase' }}>{t('categories')}</Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginHorizontal: 16 }}>
            <SettingsRow icon="arrow-up-circle-outline" label={t('manageCatIncome')} onPress={() => openModal('catIncome')} />
            <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 58 }} />
            <SettingsRow icon="arrow-down-circle-outline" label={t('manageCatExpense')} onPress={() => openModal('catExpense')} />
          </View>

          {/* Reports */}
          <Text style={{ paddingHorizontal: 16, marginVertical: 8, marginTop: 24, color: theme.subtext, fontSize: 12, textTransform: 'uppercase' }}>{t('report')}</Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginHorizontal: 16 }}>
            <SettingsRow icon="flag-outline" label={t('budget')} onPress={() => openModal('budget')} />
            <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 58 }} />
            <SettingsRow icon="download-outline" label={t('downloadReport')} onPress={() => openModal('report')} />
          </View>

          {/* Cloud Sync */}
          <Text style={{ paddingHorizontal: 16, marginVertical: 8, marginTop: 24, color: theme.subtext, fontSize: 12, textTransform: 'uppercase' }}>Cloud Sync</Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginHorizontal: 16 }}>
            {user ? (
              // Tampilan jika pengguna SUDAH LOGIN
              <>
                <SettingsRow
                  icon="person-circle-outline"
                  label={t('Account')}
                  rightContent={<Text style={{ color: theme.subtext, fontSize: 12 }}>{user.email}</Text>}
                />
                <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 58 }} />
                <SettingsRow
                  icon="log-out-outline"
                  iconColor={theme.expense}
                  label={t('logout')}
                  labelColor={theme.expense}
                  onPress={handleLogout}
                />
              </>
            ) : (
              // Tampilan jika pengguna BELUM LOGIN
              <SettingsRow
                icon="log-in-outline"
                iconColor={theme.primary}
                label={t('loginGoogle')}
                labelColor={theme.primary}
                onPress={() => router.replace('/login')}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}