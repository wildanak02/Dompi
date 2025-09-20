import React, { useState } from 'react';
import { Modal, SafeAreaView, View, Text, Pressable, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, isSameMonth, isSameYear } from 'date-fns';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { Transaction, Budget } from '@/types';
import { currency } from '@/utils/format';
import Header from '@/components/common/Header';
import Pill from '@/components/common/Pill';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  items: Transaction[];
  budgets: Budget;
}

export default function ReportModal({ visible, onClose, items, budgets }: ReportModalProps) {
  const { theme } = useTheme();
  const { t, locale } = useLocalization();

  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper function to generate SVG bar charts as HTML strings
  const generateBarChartHTML = (data: { label: string; value: number }[], title: string, color: string) => {
    if (data.length === 0) return '';
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const chartHeight = data.length * 40 + 30;
    const width = 500;
    const barHeight = 25;
    const bars = data.map((d, i) => {
        const barWidth = (d.value / maxValue) * (width - 150);
        return `
            <g transform="translate(0, ${i * 40})">
                <text x="0" y="${barHeight / 2 + 5}" font-size="12" fill="#555" text-anchor="start">${d.label}</text>
                <rect x="150" y="0" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4" />
                <text x="${155 + barWidth}" y="${barHeight / 2 + 5}" font-size="12" fill="#333" text-anchor="start">${currency(d.value)}</text>
            </g>
        `;
      }).join('');

    return `
        <div class="chart-container">
            <h3>${title}</h3>
            <svg width="${width}" height="${chartHeight}" viewBox="0 0 ${width} ${chartHeight}">${bars}</svg>
        </div>
    `;
  };

  // Helper function to generate HTML for budget comparisons
  const generateBudgetComparisonHTML = (expenseData: { label: string; value: number }[], budgetData: Budget) => {
    const comparisonItems = Object.entries(budgetData)
      .filter(([, budget]) => budget > 0)
      .map(([cat, budget]) => {
        const spent = expenseData.find(d => d.label === cat)?.value || 0;
        const percentage = Math.min((spent / budget) * 100, 100);
        const color = spent > budget ? '#e74c3c' : '#2ecc71';
        return `
            <div class="budget-item">
                <div class="budget-labels">
                    <span>${cat}</span>
                    <span>${currency(spent)} / ${currency(budget)}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fg" style="width: ${percentage}%; background-color: ${color};"></div>
                </div>
            </div>
        `;
      });
    if (comparisonItems.length === 0) return '';
    return `<div class="chart-container"><h3>${t('budgetComparison')}</h3>${comparisonItems.join('')}</div>`;
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const isMonth = period === 'month';
      const filteredItems = items
        .filter(item => {
          const itemDate = parseISO(item.date);
          return isMonth ? isSameMonth(itemDate, date) : isSameYear(itemDate, date);
        })
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

      const periodStr = isMonth ? format(date, 'MMMM yyyy', { locale }) : format(date, 'yyyy');

      const totalIncome = filteredItems.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
      const totalExpense = filteredItems.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);

      const incomeByCategory: { [key: string]: number } = {};
      const expenseByCategory: { [key: string]: number } = {};

      filteredItems.forEach(item => {
        if (item.type === 'income') {
          incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
        } else {
          expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + item.amount;
        }
      });

      const incomeChartData = Object.entries(incomeByCategory).map(([label, value]) => ({ label, value }));
      const expenseChartData = Object.entries(expenseByCategory).map(([label, value]) => ({ label, value }));

      const html = `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; margin: 20px;}
              .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              .header h1 { margin: 0; color: #FF7A00; }
              .header h2 { margin: 5px 0; color: #555; font-weight: 300; }
              .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
              .summary-card { padding: 15px; border-radius: 8px; text-align: center; }
              .summary-card.income { background-color: #e8f5e9; color: #2e7d32; }
              .summary-card.expense { background-color: #ffebee; color: #c62828; }
              .summary-card.balance { background-color: #e3f2fd; color: #1565c0; }
              .summary-card p { margin: 0; font-size: 14px; opacity: 0.8; }
              .summary-card h3 { margin: 5px 0; font-size: 20px; }
              .chart-container { margin-bottom: 30px; }
              .chart-container h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; color: #333; }
              .budget-item { margin-bottom: 10px; }
              .budget-labels { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
              .progress-bar-bg { height: 15px; background-color: #eee; border-radius: 10px; overflow: hidden; }
              .progress-bar-fg { height: 100%; border-radius: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              thead { background-color: #f9f9f9; }
              tbody tr:nth-child(even) { background-color: #fdfdfd; }
              .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #aaa; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Dompi</h1>
              <h2>${t('reportFor')} ${periodStr}</h2>
            </div>

            <div class="summary-grid">
              <div class="summary-card income"> <p>${t('totalIncome')}</p> <h3>${currency(totalIncome)}</h3> </div>
              <div class="summary-card expense"> <p>${t('totalExpense')}</p> <h3>${currency(totalExpense)}</h3> </div>
              <div class="summary-card balance"> <p>${t('balanceThisMonth')}</p> <h3>${currency(totalIncome - totalExpense)}</h3> </div>
            </div>

            ${generateBarChartHTML(expenseChartData, t('expense'), '#e74c3c')}
            ${generateBarChartHTML(incomeChartData, t('income'), '#2ecc71')}
            ${isMonth ? generateBudgetComparisonHTML(expenseChartData, budgets) : ''}

            <h3>Detail Transaksi</h3>
            <table>
              <thead> <tr> <th>${t('date')}</th> <th>${t('categoryLabel')}</th> <th>${t('noteOptional')}</th> <th style="text-align: right;">${t('amount')}</th> </tr> </thead>
              <tbody> ${filteredItems.map(item => `<tr><td>${format(parseISO(item.date), 'dd MMM yyyy', { locale })}</td><td>${item.category}</td><td>${item.note || ''}</td><td style="color: ${item.type === 'income' ? '#2ecc71' : '#e74c3c'}; text-align: right;">${item.type === 'income' ? '+' : '-'}${currency(item.amount)}</td></tr>`).join('')} </tbody>
            </table>
            <div class="footer"><p>Laporan dibuat pada ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale })}</p></div>
          </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { dialogTitle: t('downloadReport') });

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuat atau membagikan laporan PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header
          title={t('downloadReport')}
          right={<Pressable onPress={onClose}><Ionicons name="close" size={24} color={theme.subtext} /></Pressable>}
        />
        <View style={{ padding: 16, gap: 16 }}>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{t('selectPeriod')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Pill label={t('monthlyReport')} active={period === 'month'} onPress={() => setPeriod('month')} />
            <Pill label={t('yearlyReport')} active={period === 'year'} onPress={() => setPeriod('year')} />
          </View>

          <Pressable onPress={() => setShowPicker(true)} style={{ backgroundColor: theme.card2, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{period === 'month' ? format(date, 'MMMM yyyy', { locale }) : format(date, 'yyyy')}</Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(event, selectedDate) => {
                setShowPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          <Pressable
            onPress={generatePdf}
            disabled={isGenerating}
            style={({ pressed }) => ({
              backgroundColor: theme.primary,
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 12,
              opacity: isGenerating || pressed ? 0.7 : 1,
            })}
          >
            {isGenerating && <ActivityIndicator color="white" />}
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {isGenerating ? t('generating') : t('generateReport')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
