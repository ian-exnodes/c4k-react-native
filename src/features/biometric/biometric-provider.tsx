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
  const lastUserId = useRef<string | null>(null);
  const booted = useRef(false);

  // Boot: probe device + read preference once. If a session already exists at
  // boot time, evaluate the initial lock state here.
  useEffect(() => {
    (async () => {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = hardware && enrolled;
      const stored = (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
      setIsAvailable(available);
      setIsEnabledState(stored);
      booted.current = true;
      if (session && available && stored) setIsLocked(true);
      if (session) lastUserId.current = session.user.id;
      log.debug('boot', { available, stored, hasSession: !!session });
    })();
    // Intentionally no deps — runs once. Session arrives via the
    // transition effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session transitions: only react when the *user identity* changes, not when
  // the session object identity changes (token refresh would otherwise cause
  // a force-lock storm).
  useEffect(() => {
    if (!booted.current) return;
    const currentUserId = session?.user.id ?? null;
    if (currentUserId === lastUserId.current) return; // token refresh — ignore
    if (currentUserId && lastUserId.current === null) {
      if (isEnabled && isAvailable) setIsLocked(true);
    }
    if (currentUserId === null) {
      setIsLocked(false);
    }
    lastUserId.current = currentUserId;
  }, [session?.user.id, isEnabled, isAvailable]);

  // AppState — re-lock when app goes to background.
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
