import React, { useState } from 'react';
import { View, Text, FlatList, Platform, Modal, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, getYear, setYear, isSameMonth, parseISO } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LanguageContext';
import { Transaction, Budget } from '@/types';
import { currency } from '@/utils/format';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';

import Card from '@/components/common/Card';
import SectionTitle from '@/components/common/SectionTitle';
import PieChart from '@/components/charts/PieChart';
import FAB from '@/components/common/FAB';

interface DashboardScreenProps {
  items: Transaction[];
  budgets: Budget;
  monthCursor: Date;
  setMonthCursor: (d: Date) => void;
  yearCursor: Date;
  setYearCursor: (d: Date) => void;
  onAddPress: () => void;
}

export default function DashboardScreen({
  items,
  budgets,
  monthCursor,
  setMonthCursor,
  yearCursor,
  setYearCursor,
  onAddPress,
}: DashboardScreenProps) {
  const { theme } = useTheme();
  const { t, locale } = useLocalization();

  const {
    income,
    expense,
    todayExpense,
    days = [],
    dailyExp = [],
    total7dayExp,
    catArr = [],
    totalExp,
    yearIncome,
    yearExpense,
  } = useDashboard(items, monthCursor, yearCursor);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const colors = ['#FF7A00', '#FFAF66', '#FF5A5F', '#FFD166', '#06D6A0', '#118AB2', '#73C2FB', '#C77DFF'];

  const pieData = catArr.slice(0, 5).map((c, i) => ({
    label: c.category,
    value: c.amount,
    color: colors[i % colors.length],
  }));
  if (catArr.length > 5) {
    const otherValue = catArr.slice(5).reduce((acc, c) => acc + c.amount, 0);
    pieData.push({ label: 'Lainnya', value: otherValue, color: '#A8B3C7' });
  }

  return (
    <View style={{ flex: 1, paddingBottom: 80 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        ListHeaderComponent={
          <View style={{ padding: 16, gap: 16 }}>
            {/* Balance & Today Cards */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Card style={{ flex: 1 }}>
                <SectionTitle iconName="wallet-outline">{t('balanceThisMonth')}</SectionTitle>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800' }}>{currency(income - expense)}</Text>
              </Card>
              <Card style={{ flex: 1 }}>
                <SectionTitle iconName="today-outline">{t('todayExpense')}</SectionTitle>
                <Text style={{ color: theme.expense, fontSize: 22, fontWeight: '800' }}>{currency(todayExpense)}</Text>
              </Card>
            </View>

            {/* Yearly Summary Card */}
            <Card>
              <SectionTitle iconName="calendar-outline">{t('yearlySummary')}</SectionTitle>
              <View style={{ backgroundColor: theme.card2, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Pressable onPress={() => setShowYearPicker(true)}>
                    <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800' }}>{format(yearCursor, 'yyyy')}</Text>
                  </Pressable>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => { setYearCursor(new Date(setYear(yearCursor, getYear(yearCursor) - 1))) }} style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.7 : 1 })}><Ionicons name="chevron-back-circle-outline" size={28} color={theme.subtext} /></Pressable>
                    <Pressable onPress={() => { setYearCursor(new Date(setYear(yearCursor, getYear(yearCursor) + 1))) }} style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.7 : 1 })}><Ionicons name="chevron-forward-circle-outline" size={28} color={theme.subtext} /></Pressable>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}><Text style={{ color: theme.subtext, marginBottom: 4 }}>{t('income')}</Text><Text style={{ color: theme.income, fontSize: 18, fontWeight: '800' }}>{currency(yearIncome)}</Text></View>
                  <View style={{ flex: 1 }}><Text style={{ color: theme.subtext, marginBottom: 4 }}>{t('expense')}</Text><Text style={{ color: theme.expense, fontSize: 18, fontWeight: '800' }}>{currency(yearExpense)}</Text></View>
                </View>
              </View>
            </Card>

            {/* Monthly Summary Card */}
            <Card>
              <SectionTitle iconName="calendar-outline">{t('monthlySummary')}</SectionTitle>
              <View style={{ backgroundColor: theme.card2, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Pressable onPress={() => setShowMonthPicker(true)}>
                        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800' }}>{format(monthCursor, 'MMMM yyyy', { locale })}</Text>
                    </Pressable>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable onPress={() => { const d = new Date(monthCursor); d.setMonth(d.getMonth() - 1); setMonthCursor(d); }} style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.7 : 1 })}><Ionicons name="chevron-back-circle-outline" size={28} color={theme.subtext} /></Pressable>
                        <Pressable onPress={() => { const d = new Date(monthCursor); d.setMonth(d.getMonth() + 1); setMonthCursor(d); }} style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.7 : 1 })}><Ionicons name="chevron-forward-circle-outline" size={28} color={theme.subtext} /></Pressable>
                    </View>
                </View>
                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}><Text style={{ color: theme.subtext, marginBottom: 4 }}>{t('income')}</Text><Text style={{ color: theme.income, fontSize: 18, fontWeight: '800' }}>{currency(income)}</Text></View>
                  <View style={{ flex: 1 }}><Text style={{ color: theme.subtext, marginBottom: 4 }}>{t('expense')}</Text><Text style={{ color: theme.expense, fontSize: 18, fontWeight: '800' }}>{currency(expense)}</Text></View>
                </View>
              </View>
            </Card>

            {/* Last 7 Days Expense Card */}
            <Card>
              <SectionTitle iconName="bar-chart-outline" right={<Text style={{ color: theme.expense, fontWeight: 'bold' }}>{currency(total7dayExp)}</Text>}>{t('expense7Days')}</SectionTitle>
              <View style={{ gap: 8 }}>
                {days.map((day, i) => (
                  <View key={day.toISOString()} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.subtext }}>{format(day, 'EEEE, dd MMM', { locale })}</Text>
                    <Text style={{ color: theme.text, fontWeight: '600' }}>{currency(dailyExp[i])}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Category Breakdown Card */}
            <Card>
              <SectionTitle iconName="pie-chart-outline">{t('categoryBreakdown')}</SectionTitle>
              {totalExp > 0 ? (
                <View>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <PieChart data={pieData} />
                  </View>
                  <View style={{ gap: 12 }}>
                    {catArr.map((cat, i) => (
                      <View key={cat.category}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ color: theme.text, flex: 1 }}>{cat.category} <Text style={{ color: theme.subtext, fontWeight: 'bold' }}>({cat.pct.toFixed(1)}%)</Text></Text>
                          <Text style={{ color: theme.subtext, fontWeight: '600' }}>{currency(cat.amount)}</Text>
                        </View>
                        <View style={{ height: 8, backgroundColor: theme.card2, borderRadius: 999, overflow: 'hidden' }}>
                          <View style={{ width: `${cat.pct}%`, backgroundColor: colors[i % colors.length], height: '100%' }} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (<Text style={{ color: theme.subtext, textAlign: 'center', paddingVertical: 16 }}>{t('noExpenseData')}</Text>)}
            </Card>

            {/* Budget Card */}
            <Card>
              <SectionTitle iconName="flag-outline">{t('budgetCategory')}</SectionTitle>
              {Object.keys(budgets).length === 0 ? (
                <Text style={{ color: theme.subtext, textAlign: 'center', paddingVertical: 16 }}>{t('noBudgetData')}</Text>
              ) : (
                Object.entries(budgets).map(([cat, limit]: [string, number]) => {
                  if (!limit) return null;
                  const spent = items.filter(x => x.type === 'expense' && isSameMonth(parseISO(x.date), monthCursor) && x.category === cat).reduce((s, x) => s + x.amount, 0);
                  const pct = Math.min(100, (spent / limit) * 100);
                  const exceeded = spent > limit;
                  return (
                    <View key={`budget:${cat}`} style={{ marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}><Text style={{ color: theme.text }}>{cat}</Text><Text style={{ color: exceeded ? theme.expense : theme.subtext }}>{currency(spent)} / {currency(limit)}</Text></View>
                      <View style={{ height: 10, backgroundColor: theme.card2, borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}><View style={{ width: `${pct}%`, backgroundColor: exceeded ? '#FF3B30' : theme.primary, height: '100%' }} /></View>
                      {exceeded && <Text style={{ color: '#FF3B30', marginTop: 4, fontSize: 12 }}>⚠️ Melebihi anggaran.</Text>}
                    </View>
                  );
                })
              )}
            </Card>
            <Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 12, paddingBottom: 20 }}>© Will Finance Tracker</Text>
          </View>
        }
      />

      {/* Date Pickers */}
      {showMonthPicker && (<DateTimePicker value={monthCursor} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'calendar'} onChange={(evt, selected) => { setShowMonthPicker(false); if (selected) { setMonthCursor(selected); } }} />)}
      {showYearPicker && (
        <Modal transparent visible={showYearPicker} onRequestClose={() => setShowYearPicker(false)}>
          <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowYearPicker(false)}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={{ backgroundColor: theme.card, padding: 16, borderRadius: 12, width: 200, maxHeight: '50%' }}>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>{t('selectYear')}</Text>
                <ScrollView>
                  {[...Array(10)].map((_, i) => {
                    const year = getYear(new Date()) - i;
                    return (
                      <Pressable key={year} onPress={() => { setYearCursor(new Date(setYear(yearCursor, year))); setShowYearPicker(false); }} style={({ pressed }) => ({ paddingVertical: 10, backgroundColor: pressed ? theme.card2 : 'transparent', borderRadius: 8 })}>
                        <Text style={{ color: theme.text, textAlign: 'center', fontSize: 18 }}>{year}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      <FAB onPress={onAddPress} />
    </View>
  );
}
