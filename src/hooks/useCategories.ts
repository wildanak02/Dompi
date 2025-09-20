import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/defaults';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@root/firebase';
import { addDoc, collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { useState } from 'react';

export function useCategories() {
  const { user } = useAuth();
  const [expCats, setExpCats] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incCats, setIncCats] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);

  const addCat = async (kind: 'expense' | 'income', name: string) => {
    const trimmedName = name?.trim();
    if (!trimmedName || !user) return;

    try {
      await addDoc(collection(db, 'categories'), {
        name: trimmedName,
        type: kind,
        userId: user.uid,
      });
      console.log(`[Firestore] Kategori '${trimmedName}' berhasil ditambahkan.`);
    } catch (error) {
      console.error("Gagal menambah kategori:", error);
    }
  };

  const editCat = async (kind: 'expense' | 'income', oldName: string, newName: string) => {
    const trimmedNewName = newName?.trim();
    if (!trimmedNewName || !user) return;

    try {
      const q = query(collection(db, 'categories'), where('userId', '==', user.uid), where('name', '==', oldName), where('type', '==', kind));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.forEach(document => {
        batch.update(doc(db, 'categories', document.id), { name: trimmedNewName });
      });
      await batch.commit();
      console.log(`[Firestore] Kategori '${oldName}' berhasil diubah menjadi '${trimmedNewName}'.`);
    } catch (error) {
      console.error("Gagal mengedit kategori:", error);
    }
  };

  const removeCat = async (kind: 'expense' | 'income', name: string) => {
    if (!user) return;
    try {
      const q = query(collection(db, 'categories'), where('userId', '==', user.uid), where('name', '==', name), where('type', '==', kind));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.forEach(document => {
        batch.delete(doc(db, 'categories', document.id));
      });
      await batch.commit();
      console.log(`[Firestore] Kategori '${name}' berhasil dihapus.`);
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
    }
  };
  
  const setAllExpCats = (cats: string[]) => setExpCats(cats.length > 0 ? cats : DEFAULT_EXPENSE_CATEGORIES);
  const setAllIncCats = (cats: string[]) => setIncCats(cats.length > 0 ? cats : DEFAULT_INCOME_CATEGORIES);

  return { expCats, incCats, addCat, editCat, removeCat, setAllExpCats, setAllIncCats };
}