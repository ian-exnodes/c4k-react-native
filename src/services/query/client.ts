// src/services/query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: false, // the outbox owns retry, not TanStack
    },
  },
});
