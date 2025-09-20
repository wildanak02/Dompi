// src/app/(app)/index.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Impor untuk Firebase
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@root/firebase';
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";

import { useLocalization } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { Category, NotificationConfig, Transaction } from '@/types';

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
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, lang, setLang } = useLocalization();

  const { items, setAll, remove: removeTxState, update: updateTxState } = useTransactions();
  const { budgets, setBudget, setAllBudgets } = useBudgets();
  const { expCats, incCats, addCat, editCat, removeCat, setAllExpCats, setAllIncCats } = useCategories();

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

  // Listener Real-time untuk Transaksi
  useEffect(() => {
    if (!user) { setAll([]); return; }
    const q = query(collection(db, 'transactions'), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTransactions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setAll(userTransactions);
      console.log(`[Firestore] Transaksi diperbarui! Ditemukan ${userTransactions.length} transaksi.`);
    }, (error) => console.error("[Firestore] Gagal listen transaksi:", error));
    return () => unsubscribe();
  }, [user]);

  // Listener Real-time untuk Kategori
  useEffect(() => {
    if (!user) {
      setAllExpCats([]);
      setAllIncCats([]);
      return;
    }
    const q = query(collection(db, 'categories'), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allCats = snapshot.docs.map(d => d.data() as Category);
      const expenseCats = allCats.filter(c => c.type === 'expense').map(c => c.name);
      const incomeCats = allCats.filter(c => c.type === 'income').map(c => c.name);
      setAllExpCats(expenseCats);
      setAllIncCats(incomeCats);
      console.log(`[Firestore] Kategori diperbarui! ${expenseCats.length} pengeluaran, ${incomeCats.length} pemasukan.`);
    }, (error) => console.error("[Firestore] Gagal listen kategori:", error));
    return () => unsubscribe();
  }, [user]);

  // Listener Real-time untuk Budget
  useEffect(() => {
    if (!user) { setAllBudgets({}); return; }
    const budgetDocRef = doc(db, 'budgets', user.uid);
    const unsubscribe = onSnapshot(budgetDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAllBudgets(data.budgets || {});
        console.log("[Firestore] Budget diperbarui!");
      } else {
        setAllBudgets({});
        console.log("[Firestore] Dokumen budget belum ada untuk user ini.");
      }
    }, (error) => console.error("[Firestore] Gagal listen budget:", error));
    return () => unsubscribe();
  }, [user]);

  const showNotification = (config: Omit<NotificationConfig, 'visible'>) => {
    setNotification({ ...config, visible: true, onConfirm: () => { if (config.onConfirm) config.onConfirm(); setNotification(prev => ({ ...prev, visible: false })); } });
  };

  const handleAddPress = () => { setEditingItem(null); setShowFormModal(true); };
  const handleEditPress = (item: Transaction) => { setEditingItem(item); setShowFormModal(true); };

  const handleSubmit = async (data: Omit<Transaction, 'id'>) => {
    if (!user) { showNotification({ type: 'error', title: t('error'), message: t('mustLogin') || 'Anda harus login untuk menyimpan data.' }); return; }
    const isEditing = !!editingItem;
    if (isEditing) {
        try {
            const txDocRef = doc(db, "transactions", editingItem.id);
            await updateDoc(txDocRef, { ...data });
            showNotification({ type: 'success', title: t('success'), message: t('txUpdated') });
        } catch(e) {
            console.error("Error updating document: ", e);
            showNotification({ type: 'error', title: t('error'), message: "Gagal memperbarui data di cloud." });
        }
    } else {
      try {
        await addDoc(collection(db, "transactions"), { ...data, userId: user.uid });
        showNotification({ type: 'success', title: t('success'), message: t('txAdded') });
      } catch (e) {
        console.error("Error adding document: ", e);
        showNotification({ type: 'error', title: t('error'), message: "Gagal menyimpan data ke cloud." });
      }
    }
    setShowFormModal(false);
    setEditingItem(null);
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
      case 'dashboard': return <DashboardScreen items={items} budgets={budgets} monthCursor={monthCursor} setMonthCursor={setMonthCursor} yearCursor={yearCursor} setYearCursor={setYearCursor} onAddPress={handleAddPress} />;
      case 'transactions': return <TransactionsScreen items={items} remove={removeTxState} expCats={expCats} incCats={incCats} onAddPress={handleAddPress} onEditPress={handleEditPress} showNotification={showNotification} />;
      case 'settings': return <SettingsScreen openModal={openModal} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t(tab as any)} />
      {renderScreen()}
      <TabBar current={tab} setCurrent={setTab} />
      {/* Modals */}
      <Modal visible={showFormModal} animationType="slide" onRequestClose={() => setShowFormModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}><Header title={editingItem ? t('editTx') : t('newTx')} right={<Pressable onPress={() => { setShowFormModal(false); setEditingItem(null); }}><Text style={{ color: theme.subtext }}>{t('close')}</Text></Pressable>} /><ScrollView contentContainerStyle={{ padding: 16 }}><TransactionForm initial={editingItem ?? undefined} onSubmit={handleSubmit} expCats={expCats} incCats={incCats} /></ScrollView></SafeAreaView>
      </Modal>
      <CategoryManagerModal kind='expense' visible={showCatExpenseModal} onClose={() => setShowCatExpenseModal(false)} list={expCats} addCat={addCat} editCat={editCat} removeCat={removeCat} />
      <CategoryManagerModal kind='income' visible={showCatIncomeModal} onClose={() => setShowCatIncomeModal(false)} list={incCats} addCat={addCat} editCat={editCat} removeCat={removeCat} />
      <BudgetManagerModal visible={showBudgetModal} onClose={() => setShowBudgetModal(false)} cats={expCats} budgets={budgets} setBudget={setBudget} />
      <ReportModal visible={showReportModal} onClose={() => setShowReportModal(false)} items={items} budgets={budgets} />
      <Modal visible={showLangModal} transparent animationType='fade' onRequestClose={() => setShowLangModal(false)}><Pressable onPress={() => setShowLangModal(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}><View style={{backgroundColor: theme.card, borderRadius: 16, padding: 16, width: '80%'}}><Text style={{color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16}}>{t('selectLang')}</Text><Pressable onPress={() => { setLang('id'); setShowLangModal(false); }} style={{paddingVertical: 12}}><Text style={{color: theme.text, fontSize: 16}}>Indonesia</Text></Pressable><Pressable onPress={() => { setLang('en'); setShowLangModal(false); }} style={{paddingVertical: 12}}><Text style={{color: theme.text, fontSize: 16}}>English</Text></Pressable></View></Pressable></Modal>
      <NotificationModal visible={notification.visible} type={notification.type} title={notification.title} message={notification.message} onConfirm={notification.onConfirm} onClose={() => { if (notification.onClose) notification.onClose(); setNotification({ ...notification, visible: false }); }} />
    </SafeAreaView>
  );
}
