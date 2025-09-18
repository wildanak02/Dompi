import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget } from '@/types';
import { BUDGET_KEY } from '@/constants/storageKeys';

/**
 * Custom hook untuk mengelola data anggaran.
 * Menangani pemuatan anggaran dari AsyncStorage dan menyediakan fungsi untuk mengatur
 * anggaran untuk kategori tertentu.
 */
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget>({});
  const [loaded, setLoaded] = useState(false);

  // Efek untuk memuat anggaran dari storage
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const rawData = await AsyncStorage.getItem(BUDGET_KEY);
        if (rawData) {
          setBudgets(JSON.parse(rawData));
        }
      } catch (error) {
        console.error('Gagal memuat anggaran dari storage', error);
      } finally {
        setLoaded(true);
      }
    };

    loadBudgets();
  }, []);

  // Efek untuk menyimpan anggaran ke storage saat state berubah
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    }
  }, [budgets, loaded]);

  const setBudget = (category: string, amount: number) => {
    setBudgets(prevBudgets => ({
      ...prevBudgets,
      [category]: amount,
    }));
  };

  return { budgets, setBudget, loaded };
}
