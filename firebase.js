import { initializeApp } from 'firebase/app';
// Impor fungsi-fungsi baru untuk persistensi
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
// Impor AsyncStorage yang baru diinstal
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyADuuCzNMTcmDw74R-Yb4VX6awjsW3tzg4",
  authDomain: "dompi-3bcf2.firebaseapp.com",
  projectId: "dompi-3bcf2",
  storageBucket: "dompi-3bcf2.firebasestorage.app",
  messagingSenderId: "1053427972070",
  appId: "1:1053427972070:web:ecca167fb343b632294827",
  measurementId: "G-KNKE2NSG44"
};

const app = initializeApp(firebaseConfig);

// Inisialisasi Auth dengan persistensi
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export { auth, db };

