import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  // Di sini Anda bisa menaruh Tab Bar atau header umum jika perlu
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Tambahkan layar lain di dalam (app) di sini */}
    </Stack>
  );
}