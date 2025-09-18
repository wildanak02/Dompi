import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { GOOGLE_STATE_KEY } from '@/constants/storageKeys';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  SCHEME,
} from '@/constants/config';
import { fetchUserInfo } from '@/api/googleDrive';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [googleState, setGoogleState] = useState<{ token: string | null; email: string | null }>({
    token: null,
    email: null,
  });
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Hybrid configuration for all platforms
  const authConfig: Google.GoogleAuthRequestConfig = {
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
  };

  // Explicitly set the redirectUri based on the environment
  if (__DEV__) {
    // For development (Expo Go), we use the proxy.
    authConfig.redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  } else {
    // For production (standalone builds), we use the custom scheme.
    authConfig.redirectUri = AuthSession.makeRedirectUri({ scheme: SCHEME });
  }

  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

  // Effect to load saved authentication state from AsyncStorage
  useEffect(() => {
    const loadGoogleState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(GOOGLE_STATE_KEY);
        if (savedState) {
          setGoogleState(JSON.parse(savedState));
        }
      } catch (e) {
        console.error('Failed to load Google auth state:', e);
      } finally {
        setIsAuthLoaded(true);
      }
    };
    loadGoogleState();
  }, []);

  // Effect to save authentication state to AsyncStorage whenever it changes
  useEffect(() => {
    if (isAuthLoaded) {
      AsyncStorage.setItem(GOOGLE_STATE_KEY, JSON.stringify(googleState));
    }
  }, [googleState, isAuthLoaded]);

  // Effect to handle the response from the Google login flow
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const token = authentication?.accessToken;
      if (token) {
        fetchUserInfo(token).then(userInfo => {
          setGoogleState({ token, email: userInfo?.email || 'Authenticated' });
        });
      }
    } else if (response?.type === 'error') {
      console.error('Google Authentication Error:', response.error);
    }
  }, [response]);

  // Function to log out the user
  const logout = () => {
    setGoogleState({ token: null, email: null });
    // Optional: Could also revoke the token here if needed
  };

  return {
    googleState,
    isAuthLoaded,
    loginRequest: request, // The request object, can be used to check if login is ready
    promptLogin: promptAsync, // The function to trigger the login prompt
    logout,
  };
}
