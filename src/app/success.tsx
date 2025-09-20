import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoginSuccessScreen() {
  const { theme } = useTheme();

  useEffect(() => {
    // Setelah 1.5 detik, ganti halaman ke dashboard utama ('/')
    // router.replace akan mengganti halaman saat ini, sehingga pengguna
    // tidak bisa menekan tombol 'kembali' ke halaman sukses ini.
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1500); // 1500 milidetik = 1.5 detik

    // Membersihkan timer jika komponen unmount sebelum waktunya
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Ionicons name="checkmark-circle" size={80} color="#FF6600" />
      <Text style={[styles.text, { color: theme.text }]}>Login Berhasil!</Text>
      <ActivityIndicator color={theme.subtext} style={{ marginTop: 20 }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
});