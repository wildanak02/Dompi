import { useState, useEffect } from 'react';
// BARIS INI TELAH DIPERBAIKI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types';
import { TX_KEY } from '@/constants/storageKeys';

/**
 * Custom hook to manage transaction data.
 * It handles loading transactions from AsyncStorage on initial app load,
 * and saving them back whenever they change.
 * It provides methods to add, update, remove, and set all transactions.
 */
export function useTransactions() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Effect to load transactions from storage once when the hook is first used
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const rawData = await AsyncStorage.getItem(TX_KEY);
        if (rawData) {
          setItems(JSON.parse(rawData));
        }
      } catch (error) {
        console.error('Failed to load transactions from storage', error);
      } finally {
        setLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  // Effect to save transactions to storage whenever the `items` state changes
  useEffect(() => {
    // We only save if loading is complete to prevent overwriting stored data with an empty array on init
    if (loaded) {
      AsyncStorage.setItem(TX_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const add = (tx: Transaction) => setItems(prevItems => [tx, ...prevItems]);
  const update = (id: string, patch: Partial<Omit<Transaction, 'id'>>) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, ...patch } : item))
    );
  };
  const remove = (id: string) => setItems(prevItems => prevItems.filter(item => item.id !== id));
  const setAll = (newItems: Transaction[]) => setItems(newItems || []);

  return { items, add, update, remove, setAll, loaded };
}
