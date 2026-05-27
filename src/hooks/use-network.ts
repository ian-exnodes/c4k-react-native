// src/hooks/use-network.ts
import { useContext } from 'react';
import { NetworkContext } from '@/providers/network-provider';

export function useNetwork() {
  return useContext(NetworkContext);
}
