import { auth } from '@root/firebase';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Validasi input
    if (!email.trim() || !password.trim()) {
      Alert.alert('Input Tidak Lengkap', 'Mohon isi email dan password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Lemah', 'Password harus terdiri dari minimal 6 karakter.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Tidak perlu navigasi manual, AuthProvider akan menanganinya secara otomatis
        Alert.alert('Pendaftaran Berhasil', 'Akun Anda telah berhasil dibuat. Anda akan diarahkan secara otomatis.');
      })
      .catch(error => {
        let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Format email yang Anda masukkan tidak valid.';
        }
        Alert.alert('Pendaftaran Gagal', errorMessage);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Buat Akun Baru</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete='email'
        />
        <TextInput
          style={styles.input}
          placeholder="Password (minimal 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Daftar" onPress={handleRegister} />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.switchText}>Sudah punya akun? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333',
    },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    switchText: {
        color: '#007AFF',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    }
});