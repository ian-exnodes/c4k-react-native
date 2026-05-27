import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { createLogger } from '@/lib/log';

const log = createLogger('biometric');
const STORAGE_KEY = '@finance/biometric/enabled';

type BiometricContextValue = {
  isAvailable: boolean;
  isEnabled:   boolean;
  isLocked:    boolean;
  unlock:      () => Promise<boolean>;
  setEnabled:  (b: boolean) => Promise<void>;
};

export const BiometricContext = createContext<BiometricContextValue | null>(null);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled,   setIsEnabledState] = useState(false);
  const [isLocked,    setIsLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    (async () => {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = hardware && enrolled;
      const stored = (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
      setIsAvailable(available);
      setIsEnabledState(stored);
      setIsLocked(!!session && available && stored);
      log.debug('boot', { available, stored, hasSession: !!session });
    })();
  }, [session]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appState.current;
      appState.current = next;
      if (prev === 'active' && (next === 'background' || next === 'inactive')) {
        if (isEnabled && isAvailable && session) {
          log.debug('app backgrounded; locking');
          setIsLocked(true);
        }
      }
    });
    return () => sub.remove();
  }, [isEnabled, isAvailable, session]);

  const unlock = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock c4k Finance',
      fallbackLabel: 'Use device passcode',
    });
    if (result.success) setIsLocked(false);
    return result.success;
  };

  const setEnabled = async (b: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEY, b ? 'true' : 'false');
    setIsEnabledState(b);
    if (!b) setIsLocked(false);
  };

  return (
    <BiometricContext.Provider value={{ isAvailable, isEnabled, isLocked, unlock, setEnabled }}>
      {children}
    </BiometricContext.Provider>
  );
}
