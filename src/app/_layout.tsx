// ==================== PERBAIKAN DI SINI ====================
// Impor ini WAJIB ada di baris paling pertama untuk mengaktifkan sistem gesture
import 'react-native-gesture-handler';
// ==========================================================

import React from 'react';
import { Stack } from 'expo-router';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    // GestureHandlerRootView membungkus seluruh aplikasi
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <ThemeProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
