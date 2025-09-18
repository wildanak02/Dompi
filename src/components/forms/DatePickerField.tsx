import React, { useState } from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { toISODateString } from '@/utils/date';

interface DatePickerFieldProps {
  label: string;
  date: string | Date;
  onChange: (d: string) => void;
}

export default function DatePickerField({ label, date, onChange }: DatePickerFieldProps) {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const displayDate = date ? new Date(date) : new Date();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Di Android, picker akan langsung tertutup setelah dipilih.
    // Di iOS, biarkan terbuka agar pengguna bisa scroll, dan mereka akan menutupnya manual.
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      onChange(toISODateString(selectedDate));
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: theme.subtext, marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <Pressable
        onPress={() => setShow(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.card2,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 12,
          borderRadius: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: theme.text, fontSize: 15 }}>{format(displayDate, 'yyyy-MM-dd')}</Text>
        <Ionicons name="calendar-outline" size={18} color={theme.subtext} />
      </Pressable>

      {/* Tampilkan picker jika state `show` adalah true */}
      {show && (
        <DateTimePicker
          value={displayDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}
