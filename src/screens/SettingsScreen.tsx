import React, { useState } from 'react';
import { View, ScrollView, Text, Switch, Image, Pressable, ActivityIndicator } from 'react-native';
// ==================== PERBAIKAN DI SINI ====================
import { Ionicons } from '@expo/vector-icons'; // <-- BARIS INI DITAMBAHKAN
// ==========================================================

import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { driveUploadJSON, driveDownloadJSON } from '@/api/googleDrive';
import { censorEmail } from '@/utils/format';
import { GOOGLE_G_PNG_URI } from '@/constants/config';
import { LIGHT_THEME, DARK_THEME } from '@/constants/theme';
import { Transaction, Budget } from '@/types';

import SettingsRow from '@/components/common/SettingsRow';

interface SettingsScreenProps {
  budgets: Budget;
  setBudget: (category: string, amount: number) => void;
  items: Transaction[];
  expCats: string[];
  incCats: string[];
  setAllItems: (items: Transaction[]) => void;
  addCat: (kind: 'expense' | 'income', name: string) => void;
  editCat: (kind: 'expense' | 'income', oldName: string, newName: string) => void;
  removeCat: (kind: 'expense' | 'income', name: string) => void;
  showNotification: (config: any) => void;
  openModal: (modal: 'catIncome' | 'catExpense' | 'budget' | 'report' | 'language') => void;
}

export default function SettingsScreen({
  budgets,
  setBudget,
  items,
  expCats,
  incCats,
  setAllItems,
  showNotification,
  openModal,
}: SettingsScreenProps) {
  const { theme, setTheme, isAutoTheme, setIsAutoTheme } = useTheme();
  const { t, lang } = useLocalization();
  const { googleState, loginRequest, promptLogin, logout } = useGoogleAuth();
  const [isBusy, setIsBusy] = useState(false);

  const doBackup = async () => {
    if (!googleState.token) return;
    setIsBusy(true);
    try {
      await driveUploadJSON(googleState.token, { items, budgets, theme: theme.name, expCats, incCats });
      showNotification({ type: 'success', title: t('backupSuccess'), message: t('backupSuccessMsg') });
    } catch (e: any) {
      showNotification({ type: 'error', title: t('backupError'), message: String(e.message || e) });
    } finally {
      setIsBusy(false);
    }
  };

  const doRestore = async () => {
    if (!googleState.token) return;
    setIsBusy(true);
    try {
      const data = await driveDownloadJSON(googleState.token);
      if (data.items) setAllItems(data.items);
      if (data.budgets) Object.entries(data.budgets).forEach(([k, v]) => setBudget(k, v as number));
      if (data.theme) setTheme(data.theme === 'light' ? LIGHT_THEME : DARK_THEME);
      showNotification({ type: 'success', title: t('restoreSuccess'), message: t('restoreSuccessMsg') });
    } catch (e: any) {
      showNotification({ type: 'error', title: t('restoreError'), message: String(e.message || e) });
    } finally {
      setIsBusy(false);
    }
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

          {/* Data Management */}
          <Text style={{ paddingHorizontal: 16, marginVertical: 8, marginTop: 24, color: theme.subtext, fontSize: 12, textTransform: 'uppercase' }}>Data</Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginHorizontal: 16 }}>
            <SettingsRow
              icon="cloud-outline"
              label={t('backupRestore')}
              rightContent={
                googleState.token ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image source={{ uri: GOOGLE_G_PNG_URI }} style={{ width: 18, height: 18 }} />
                    <Text style={{ color: theme.subtext, fontSize: 12 }}>{censorEmail(googleState.email)}</Text>
                  </View>
                ) : null
              }
            />
            {googleState.token ? (
              <View style={{ flexDirection: 'row', gap: 10, padding: 16, backgroundColor: theme.card, alignItems: 'center' }}>
                <Pressable onPress={doBackup} disabled={isBusy} style={({ pressed }) => ({ flex: 1, backgroundColor: theme.card2, paddingVertical: 10, borderRadius: 10, opacity: pressed || isBusy ? 0.7 : 1, alignItems: 'center' })}><Text style={{ color: theme.text, fontWeight: '700' }}>Backup</Text></Pressable>
                <Pressable onPress={doRestore} disabled={isBusy} style={({ pressed }) => ({ flex: 1, backgroundColor: theme.card2, paddingVertical: 10, borderRadius: 10, opacity: pressed || isBusy ? 0.7 : 1, alignItems: 'center' })}><Text style={{ color: theme.text, fontWeight: '700' }}>Restore</Text></Pressable>
                <Pressable onPress={logout} style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.8 : 1 })}><Ionicons name="log-out-outline" size={22} color={theme.expense} /></Pressable>
              </View>
            ) : (
              <View style={{ padding: 16, backgroundColor: theme.card }}>
                <Pressable disabled={!loginRequest || isBusy} onPress={() => promptLogin()} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: theme.border, paddingVertical: 10, borderRadius: 10, opacity: pressed || isBusy ? 0.7 : 1 })}>
                  {isBusy ? <ActivityIndicator color={theme.text} /> : <Image source={{ uri: GOOGLE_G_PNG_URI }} style={{ width: 18, height: 18 }} />}
                  <Text style={{ color: theme.text, fontWeight: '700' }}>{t('loginGoogle')}</Text>
                </Pressable>
              </View>
            )}
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
        </View>
      </ScrollView>
    </View>
  );
}
