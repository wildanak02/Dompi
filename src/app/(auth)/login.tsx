import { FontAwesome } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth } from '@root/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Konfigurasi Google Sign-In Anda
GoogleSignin.configure({
  webClientId: '1053427972070-4fc952ds5cr4h1fg1l0epjjnlli2c6ag.apps.googleusercontent.com',
});

export default function LoginScreen() {

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // ==========================================================
      // PERBAIKAN FINAL DI SINI
      // Kita mengambil idToken langsung dari userInfo
      // ==========================================================
      const idToken = userInfo.idToken;

      // Tambahkan pengecekan untuk memastikan idToken benar-benar ada
      if (!idToken) {
        throw new Error("Gagal mendapatkan idToken dari Google.");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);

    } catch (error: any) {
      console.error("DETAIL ERROR:", JSON.stringify(error, null, 2));
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
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