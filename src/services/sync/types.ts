// src/services/sync/types.ts

export type SyncedTable =
  | 'profiles'
  | 'wallets'
  | 'categories'
  | 'transactions'
  | 'recurring_rules'
  | 'budgets';

export type OutboxOpKind = 'insert' | 'update';

export type OutboxOp = {
  id: string;                              // op uuid (not row uuid)
  table: SyncedTable;
  kind: OutboxOpKind;
  rowId: string;                           // entity uuid
  payload: Record<string, unknown>;        // columns to write
  prevUpdatedAt?: string;                  // optimistic-lock value for updates
  enqueuedAt: number;
  attemptCount: number;
  lastError?: { code: string; message: string };
};

export type DeadLetter = OutboxOp & { droppedAt: number };
