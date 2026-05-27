import { useContext } from 'react';
import { BiometricContext } from '@/features/biometric/biometric-provider';

export function useBiometric() {
  const ctx = useContext(BiometricContext);
  if (!ctx) throw new Error('useBiometric must be used inside <BiometricProvider>');
  return ctx;
}
