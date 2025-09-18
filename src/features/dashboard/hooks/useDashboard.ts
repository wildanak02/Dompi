import { useMemo } from 'react';
import { isSameDay, parseISO, startOfDay, subDays, isSameMonth, isSameYear } from 'date-fns';
import { Transaction } from '@/types';

/**
 * Hook yang direvisi untuk menghitung semua data yang diperlukan untuk Dashboard.
 * Lebih aman dan selalu mengembalikan struktur data yang valid bahkan jika `items` kosong.
 */
export function useDashboard(items: Transaction[], monthCursor: Date, yearCursor: Date) {
  const today = startOfDay(new Date());

  return useMemo(() => {
    // Pastikan `items` adalah array untuk mencegah error. Jika tidak, gunakan array kosong.
    const validItems = Array.isArray(items) ? items : [];

    // --- Kalkulasi Bulanan ---
    const monthItems = validItems.filter(x => isSameMonth(parseISO(x.date), monthCursor));
    const income = monthItems.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0);
    const expense = monthItems.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);

    // --- Kalkulasi Harian & 7 Hari ---
    const todayExpense = validItems.filter(x => x.type === 'expense' && isSameDay(parseISO(x.date), today)).reduce((s, x) => s + x.amount, 0);
    const days = [...Array(7)].map((_, i) => subDays(today, 6 - i));
    const dailyExp = days.map(d => validItems.filter(x => x.type === 'expense' && isSameDay(parseISO(x.date), d)).reduce((s, x) => s + x.amount, 0));
    const total7dayExp = dailyExp.reduce((s, v) => s + v, 0);

    // --- Kalkulasi Breakdown Kategori (Hanya untuk pengeluaran di bulan yang dipilih) ---
    const byCat: { [key: string]: number } = {};
    monthItems.filter(x => x.type === 'expense').forEach(x => {
      byCat[x.category] = (byCat[x.category] || 0) + x.amount;
    });

    const catArr = Object.entries(byCat)
      .map(([k, v]) => ({ category: k, amount: v as number }))
      .sort((a, b) => b.amount - a.amount);

    const totalExp = catArr.reduce((s, c) => s + c.amount, 0);
    // Tambahkan persentase ke setiap item di catArr
    catArr.forEach((c: any) => c.pct = totalExp > 0 ? (c.amount / totalExp) * 100 : 0);

    // --- Kalkulasi Tahunan ---
    const yearItems = validItems.filter(x => isSameYear(parseISO(x.date), yearCursor));
    const yearIncome = yearItems.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0);
    const yearExpense = yearItems.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);

    return {
      income,
      expense,
      todayExpense,
      days,
      dailyExp,
      total7dayExp,
      catArr,
      totalExp,
      monthItems,
      yearIncome,
      yearExpense,
    };
  }, [items, monthCursor, yearCursor]);
}
