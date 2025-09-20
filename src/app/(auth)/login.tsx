import { FontAwesome } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth } from '@root/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Konfigurasi Google Sign-In Anda
GoogleSignin.configure({
  webClientId: '1053427972070-4fc952ds5cr4h1fg1l0epjjnlli2c6ag.apps.googleusercontent.com',
});

export default function LoginScreen() {

const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      // ==========================================================
      // PERBAIKAN FINAL BERDASARKAN STRUKTUR DATA ASLI DARI LOG
      // ==========================================================
      
      // 1. Ambil idToken dari response.data.idToken
      const idToken = response.data?.idToken;

      // 2. Pastikan idToken tidak kosong
      if (!idToken) {
        throw new Error("Gagal mendapatkan idToken dari respons Google. Strukturnya tidak sesuai.");
      }
      
      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);

      // Jika sampai di sini, semua proses berhasil.
      // Navigasi ke dashboard akan ditangani secara otomatis.

    } catch (error: any) {
      console.error("DETAIL ERROR:", error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Pengguna membatalkan, tidak perlu menampilkan apa-apa
      } else {
        Alert.alert('Login Gagal', `Terjadi kesalahan. Silakan coba lagi.`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DOMPI</Text>
        <Text style={styles.subtitle}>Catat keuangan, capai tujuanmu.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <FontAwesome name="google" size={20} color="#fff" />
          <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (styles Anda tetap sama)
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    padding: 30,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 10,
  },
  footer: {
    paddingBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6600',
    paddingVertical: 15,
    borderRadius: 30,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  termsText: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});