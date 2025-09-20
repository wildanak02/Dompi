import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Impor AuthProvider dan useAuth
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler'; // Pastikan ini di baris pertama
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Memisahkan logika navigasi ke komponen sendiri
const InitialLayout = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Jika navigation belum siap, jangan lakukan apa-apa
    if (!navigationState?.key) return;
    
    const inAuthGroup = segments[0] === '(auth)';

    if (loading) {
      // Masih loading, tidak ada redirect
    } else if (!user && !inAuthGroup) {
      // Jika tidak ada user dan tidak di grup auth, paksa ke login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Jika ada user tapi masih di halaman login/register, paksa ke halaman utama
      router.replace('/');
    }
  }, [user, segments, loading, navigationState]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider> {/* Membungkus semua dengan AuthProvider */}
        <LanguageProvider>
          <ThemeProvider>
            <InitialLayout />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}