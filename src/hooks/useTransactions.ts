import { Transaction } from '@/types';
import { useState } from 'react';

/**
 * Custom hook untuk mengelola state transaksi di dalam aplikasi.
 * Data aktual akan diisi oleh listener Firestore di komponen utama (AppRoot).
 * Fungsi-fungsi di sini sekarang hanya bertugas memanipulasi state lokal,
 * sementara logika Firestore akan ditangani di level komponen.
 */
export function useTransactions() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false); // Kita akan set loaded setelah data pertama dari Firestore masuk

  // Hapus semua useEffect yang berhubungan dengan AsyncStorage

  const add = (tx: Transaction) => setItems(prevItems => [tx, ...prevItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  
  const update = (id: string, patch: Partial<Omit<Transaction, 'id'>>) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, ...patch } : item))
    );
  };
  
  const remove = (id: string) => setItems(prevItems => prevItems.filter(item => item.id !== id));
  
  // Fungsi ini menjadi sangat penting untuk menerima data dari listener Firestore
  const setAll = (newItems: Transaction[]) => {
    setItems(newItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []);
    if (!loaded) setLoaded(true); // Tandai sebagai sudah dimuat
  };

  return { items, add, update, remove, setAll, loaded };
}