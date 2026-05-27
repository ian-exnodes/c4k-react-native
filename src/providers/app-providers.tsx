import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { type ReactNode } from 'react';
import { queryClient } from '@/services/query/client';
import { queryPersister } from '@/services/sync/persister';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { NetworkProvider } from './network-provider';
import { BiometricProvider } from '@/features/biometric';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: 24 * 60 * 60 * 1000 }}
        >
          <ThemeProvider>
            <AuthProvider>
              <BiometricProvider>
                <NetworkProvider>{children}</NetworkProvider>
              </BiometricProvider>
            </AuthProvider>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
