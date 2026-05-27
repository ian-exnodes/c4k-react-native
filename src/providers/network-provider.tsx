// src/providers/network-provider.tsx
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services/supabase/client';
import { queryClient } from '@/services/query/client';
import { keys } from '@/services/query/keys';
import * as outbox from '@/services/sync/outbox';
import { createLogger } from '@/lib/log';
import type { SyncedTable } from '@/services/sync/types';

const log = createLogger('network');

type NetworkContextValue = { isOnline: boolean };

export const NetworkContext = createContext<NetworkContextValue>({ isOnline: true });

const SYNCED_TABLES: SyncedTable[] = [
  'profiles', 'wallets', 'categories', 'transactions', 'recurring_rules', 'budgets',
];

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const { session } = useAuth();

  // NetInfo -> isOnline + TanStack onlineManager
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((s) => {
      const online = !!s.isConnected && s.isInternetReachable !== false;
      setIsOnline(online);
      onlineManager.setOnline(online);
      if (online) {
        log.debug('online - flushing outbox');
        void outbox.flush();
      }
    });
    return unsubscribe;
  }, []);

  // Realtime subscription scoped to the signed-in user
  useEffect(() => {
    if (!session?.user.id) return;
    const uid = session.user.id;
    const channel = supabase.channel(`user:${uid}`);

    for (const table of SYNCED_TABLES) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${uid}` },
        (payload: { new?: { id?: string } | null; old?: { id?: string } | null }) => {
          const row = payload.new ?? payload.old;
          const id = row?.id;
          if (!id) return;
          // Surgical patch for the detail key; invalidate the list for the table.
          if (payload.new) {
            queryClient.setQueryData(getDetailKey(table, uid, id), payload.new);
          } else {
            queryClient.removeQueries({ queryKey: getDetailKey(table, uid, id) });
          }
          queryClient.invalidateQueries({ queryKey: getAllKey(table, uid) });
        }
      );
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  return <NetworkContext.Provider value={{ isOnline }}>{children}</NetworkContext.Provider>;
}

function getAllKey(table: SyncedTable, uid: string) {
  switch (table) {
    case 'transactions':    return keys.transactions.all(uid);
    case 'wallets':         return keys.wallets.all(uid);
    case 'categories':      return keys.categories.all(uid);
    case 'budgets':         return keys.budgets.all(uid);
    case 'recurring_rules': return keys.recurring_rules.all(uid);
    case 'profiles':        return keys.profiles.current(uid);
  }
}

function getDetailKey(table: SyncedTable, uid: string, id: string) {
  switch (table) {
    case 'transactions':    return keys.transactions.detail(uid, id);
    case 'wallets':         return keys.wallets.detail(uid, id);
    case 'categories':      return keys.categories.detail(uid, id);
    case 'budgets':         return keys.budgets.detail(uid, id);
    case 'recurring_rules': return keys.recurring_rules.detail(uid, id);
    case 'profiles':        return keys.profiles.current(uid);
  }
}
