import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { router, useSegments } from 'expo-router';

export type WizardData = {
  profile?:    { display_name: string; default_currency: string };
  wallet?:     { name: string; initial_balance: number }; // minor units
  categories?: string[];
};

type WizardStep = 1 | 2 | 3 | 4;

type WizardContextValue = {
  step:           WizardStep;
  data:           WizardData;
  setProfile:     (p: WizardData['profile']) => void;
  setWallet:      (w: WizardData['wallet']) => void;
  setCategories:  (c: string[]) => void;
  next:           () => void;
  back:           () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

const ROUTES: Record<WizardStep, string> = {
  1: '/(onboarding)/welcome',
  2: '/(onboarding)/profile',
  3: '/(onboarding)/wallet',
  4: '/(onboarding)/categories',
};

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>({});

  // Derive step from the current route so the indicator stays in sync with
  // hardware-back, swipe-back, and Fast Refresh state resets. Single source
  // of truth: the navigator's actual location.
  const segments = useSegments() as string[];
  const step = useMemo<WizardStep>(() => {
    const last = segments[segments.length - 1];
    if (last === 'profile')    return 2;
    if (last === 'wallet')     return 3;
    if (last === 'categories') return 4;
    return 1;
  }, [segments]);

  const setProfile = useCallback((p: WizardData['profile']) => setData((d) => ({ ...d, profile: p })), []);
  const setWallet  = useCallback((w: WizardData['wallet'])  => setData((d) => ({ ...d, wallet: w })),  []);
  const setCategories = useCallback((c: string[]) => setData((d) => ({ ...d, categories: c })), []);

  const next = useCallback(() => {
    if (step >= 4) return;
    const nextStep = (step + 1) as WizardStep;
    router.push(ROUTES[nextStep] as never);
  }, [step]);

  const back = useCallback(() => {
    router.back();
  }, []);

  return (
    <WizardContext.Provider value={{ step, data, setProfile, setWallet, setCategories, next, back }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside <WizardProvider>');
  return ctx;
}
