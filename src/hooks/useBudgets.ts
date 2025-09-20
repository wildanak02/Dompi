import { useAuth } from '@/contexts/AuthContext';
import { Budget } from '@/types';
import { db } from '@root/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget>({});

  const setBudget = async (category: string, amount: number) => {
    if (!user) return;

    try {
      const budgetDocRef = doc(db, 'budgets', user.uid);
      await setDoc(budgetDocRef, {
        budgets: {
          [category]: amount,
        },
        userId: user.uid,
      }, { merge: true }); // merge: true sangat penting agar tidak menimpa budget lain
      console.log(`[Firestore] Budget untuk '${category}' berhasil disimpan.`);
    } catch (error) {
      console.error("Gagal menyimpan budget:", error);
    }
  };

  const setAllBudgets = (newBudgets: Budget) => {
    setBudgets(newBudgets || {});
  };

  return { budgets, setBudget, setAllBudgets };
}