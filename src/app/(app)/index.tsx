// src/app/index.tsx
import { useLocalization } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { NotificationConfig, Transaction } from '@/types';
import { uid } from '@/utils/misc';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/common/Header';
import NotificationModal from '@/components/feedback/NotificationModal';
import BudgetManagerModal from '@/features/budgets/components/BudgetManagerModal';
import CategoryManagerModal from '@/features/categories/components/CategoryManagerModal';
import ReportModal from '@/features/reports/components/ReportModal';
import TransactionForm from '@/features/transactions/components/TransactionForm';
import TabBar from '@/navigation/TabBar';
import DashboardScreen from '@/screens/DashboardScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';

export default function AppRoot() {
  const { theme } = useTheme();
  const { t, lang, setLang } = useLocalization();

  const { items, add, update, remove, setAll } = useTransactions();
  const { budgets, setBudget } = useBudgets();
  const { expCats, incCats, addCat, editCat, removeCat } = useCategories();

  const [tab, setTab] = useState('dashboard');
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [yearCursor, setYearCursor] = useState(new Date());

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);

  const [showCatIncomeModal, setShowCatIncomeModal] = useState(false);
  const [showCatExpenseModal, setShowCatExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const [notification, setNotification] = useState<NotificationConfig>({ visible: false, type: 'success', title: '', message: '' });

  const showNotification = (config: Omit<NotificationConfig, 'visible'>) => {
    setNotification({
      ...config,
      visible: true,
      onConfirm: () => {
        if (config.onConfirm) config.onConfirm();
        setNotification(prev => ({ ...prev, visible: false }));
      },
    });
  };

  const handleAddPress = () => { setEditingItem(null); setShowFormModal(true); };
  const handleEditPress = (item: Transaction) => { setEditingItem(item); setShowFormModal(true); };

  const handleSubmit = (data: Omit<Transaction, 'id'>) => {
    const isEditing = !!editingItem;
    if (isEditing) {
      update(editingItem.id, data);
    } else {
      add({ id: uid(), ...data });
    }
    setShowFormModal(false);
    setEditingItem(null);
    showNotification({ type: 'success', title: t('success'), message: isEditing ? t('txUpdated') : t('txAdded') });
  };

  const openModal = (modal: string) => {
    if (modal === 'catIncome') setShowCatIncomeModal(true);
    if (modal === 'catExpense') setShowCatExpenseModal(true);
    if (modal === 'budget') setShowBudgetModal(true);
    if (modal === 'report') setShowReportModal(true);
    if (modal === 'language') setShowLangModal(true);
  };

  const renderScreen = () => {
    switch (tab) {
      case 'dashboard':
        return <DashboardScreen items={items} budgets={budgets} monthCursor={monthCursor} setMonthCursor={setMonthCursor} yearCursor={yearCursor} setYearCursor={setYearCursor} onAddPress={handleAddPress} />;
      case 'transactions':
        return <TransactionsScreen items={items} remove={remove} expCats={expCats} incCats={incCats} onAddPress={handleAddPress} onEditPress={handleEditPress} showNotification={showNotification} />;
      case 'settings':
        return <SettingsScreen budgets={budgets} setBudget={setBudget} items={items} expCats={expCats} incCats={incCats} setAllItems={setAll} addCat={addCat} editCat={editCat} removeCat={removeCat} showNotification={showNotification} openModal={openModal} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t(tab as any)} />
      {renderScreen()}
      <TabBar current={tab} setCurrent={setTab} />

      {/* Modals */}
      <Modal visible={showFormModal} animationType="slide" onRequestClose={() => setShowFormModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
          <Header title={editingItem ? t('editTx') : t('newTx')} right={<Pressable onPress={() => { setShowFormModal(false); setEditingItem(null); }}><Text style={{ color: theme.subtext }}>{t('close')}</Text></Pressable>} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <TransactionForm initial={editingItem ?? undefined} onSubmit={handleSubmit} expCats={expCats} incCats={incCats} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <CategoryManagerModal kind='expense' visible={showCatExpenseModal} onClose={() => setShowCatExpenseModal(false)} list={expCats} addCat={addCat} editCat={editCat} removeCat={removeCat} />
      <CategoryManagerModal kind='income' visible={showCatIncomeModal} onClose={() => setShowCatIncomeModal(false)} list={incCats} addCat={addCat} editCat={editCat} removeCat={removeCat} />
      <BudgetManagerModal visible={showBudgetModal} onClose={() => setShowBudgetModal(false)} cats={expCats} budgets={budgets} setBudget={setBudget} />
      <ReportModal visible={showReportModal} onClose={() => setShowReportModal(false)} items={items} budgets={budgets} />

      <Modal visible={showLangModal} transparent animationType='fade' onRequestClose={() => setShowLangModal(false)}>
         <Pressable onPress={() => setShowLangModal(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <View style={{backgroundColor: theme.card, borderRadius: 16, padding: 16, width: '80%'}}>
                <Text style={{color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16}}>{t('selectLang')}</Text>
                <Pressable onPress={() => { setLang('id'); setShowLangModal(false); }} style={{paddingVertical: 12}}><Text style={{color: theme.text, fontSize: 16}}>Indonesia</Text></Pressable>
                <Pressable onPress={() => { setLang('en'); setShowLangModal(false); }} style={{paddingVertical: 12}}><Text style={{color: theme.text, fontSize: 16}}>English</Text></Pressable>
            </View>
        </Pressable>
      </Modal>

      <NotificationModal
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        onClose={() => {
          if (notification.onClose) notification.onClose();
          setNotification({ ...notification, visible: false });
        }}
      />
    </SafeAreaView>
  );
}
