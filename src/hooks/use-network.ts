// src/hooks/use-network.ts
import { useContext } from 'react';
import { NetworkContext } from '@/providers/network-provider';

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used inside <NetworkProvider>');
  return ctx;
}
