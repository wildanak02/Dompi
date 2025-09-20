// src/types/index.ts
import { enUS, id } from 'date-fns/locale';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO String
  note?: string;
}

export interface Budget {
  [category: string]: number;
}

export interface Theme {
  name: 'light' | 'dark';
  bg: string;
  card: string;
  card2: string;
  text: string;
  subtext: string;
  primary: string;
  income: string;
  expense: string;
  border: string;
  bar: string;
}

export type Language = 'id' | 'en';

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
  locale: typeof id | typeof enUS;
}

export interface NotificationConfig {
  visible: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

export interface Category {
  id: string; // ID dokumen dari Firestore
  name: string;
  type: 'income' | 'expense';
  userId: string;
}
