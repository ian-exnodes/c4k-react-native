// src/services/supabase/client.ts
import 'react-native-url-polyfill/auto'; // Supabase needs URL on RN; bundled with supabase-js
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { env } from '@/lib/env';
import type { Database } from './database.types';

// SecureStore-backed adapter for the Supabase session token.
// SecureStore values must be <2048 bytes; Supabase sessions are well under that.
const secureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // RN, not a browser
    },
  }
);
