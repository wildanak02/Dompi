import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXP_CAT_KEY, INC_CAT_KEY } from '@/constants/storageKeys';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/defaults';

/**
 * Custom hook untuk mengelola kategori pengeluaran dan pemasukan.
 * Memuat kategori dari storage, menyediakan nilai default jika tidak ada,
 * dan menawarkan fungsi untuk menambah, mengedit, dan menghapus kategori.
 */
export function useCategories() {
  const [expCats, setExpCats] = useState<string[]>([]);
  const [incCats, setIncCats] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Efek untuk memuat kedua daftar kategori dari storage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const rawExpCats = await AsyncStorage.getItem(EXP_CAT_KEY);
        const rawIncCats = await AsyncStorage.getItem(INC_CAT_KEY);

        setExpCats(rawExpCats ? JSON.parse(rawExpCats) : DEFAULT_EXPENSE_CATEGORIES);
        setIncCats(rawIncCats ? JSON.parse(rawIncCats) : DEFAULT_INCOME_CATEGORIES);
      } catch (error) {
        console.error('Gagal memuat kategori dari storage', error);
      } finally {
        setLoaded(true);
      }
    };

    loadCategories();
  }, []);

  // Efek untuk menyimpan kategori pengeluaran saat berubah
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(EXP_CAT_KEY, JSON.stringify(expCats));
    }
  }, [expCats, loaded]);

  // Efek untuk menyimpan kategori pemasukan saat berubah
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(INC_CAT_KEY, JSON.stringify(incCats));
    }
  }, [incCats, loaded]);

  const addCat = (kind: 'expense' | 'income', name: string) => {
    const trimmedName = name?.trim();
    if (!trimmedName) return;

    if (kind === 'expense') {
      if (!expCats.includes(trimmedName)) setExpCats(prev => [...prev, trimmedName]);
    } else {
      if (!incCats.includes(trimmedName)) setIncCats(prev => [...prev, trimmedName]);
    }
  };

  const editCat = (kind: 'expense' | 'income', oldName: string, newName: string) => {
    const trimmedNewName = newName?.trim();
    if (!trimmedNewName) return;

    if (kind === 'expense') {
      setExpCats(prev => prev.map(c => (c === oldName ? trimmedNewName : c)));
    } else {
      setIncCats(prev => prev.map(c => (c === oldName ? trimmedNewName : c)));
    }
  };

  const removeCat = (kind: 'expense' | 'income', name: string) => {
    if (kind === 'expense') {
      setExpCats(prev => prev.filter(c => c !== name));
    } else {
      setIncCats(prev => prev.filter(c => c !== name));
    }
  };

  return { expCats, incCats, addCat, editCat, removeCat, loaded };
}
