import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { router } from 'expo-router';

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
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>({});

  const setProfile = useCallback((p: WizardData['profile']) => setData((d) => ({ ...d, profile: p })), []);
  const setWallet  = useCallback((w: WizardData['wallet'])  => setData((d) => ({ ...d, wallet: w })),  []);
  const setCategories = useCallback((c: string[]) => setData((d) => ({ ...d, categories: c })), []);

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= 4) return s;
      const nextStep = (s + 1) as WizardStep;
      router.push(ROUTES[nextStep] as never);
      return nextStep;
    });
  }, []);

  const back = useCallback(() => {
    setStep((s) => {
      if (s <= 1) {
        router.back();
        return s;
      }
      const prevStep = (s - 1) as WizardStep;
      router.back();
      return prevStep;
    });
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
