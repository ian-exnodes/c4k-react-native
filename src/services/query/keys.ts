// src/services/query/keys.ts
// Centralized query-key factories. Every consumer goes through this object —
// no raw string keys anywhere in features/.

export type ListFilters = Record<string, unknown> | undefined;

export const keys = {
  transactions: {
    all:    (uid: string) => ['transactions', uid] as const,
    list:   (uid: string, filters?: ListFilters) =>
              [...keys.transactions.all(uid), 'list', filters ?? null] as const,
    detail: (uid: string, id: string) =>
              [...keys.transactions.all(uid), 'detail', id] as const,
  },
  wallets: {
    all:    (uid: string) => ['wallets', uid] as const,
    detail: (uid: string, id: string) => [...keys.wallets.all(uid), 'detail', id] as const,
  },
  categories: {
    all:    (uid: string) => ['categories', uid] as const,
    detail: (uid: string, id: string) => [...keys.categories.all(uid), 'detail', id] as const,
  },
  budgets: {
    all:    (uid: string) => ['budgets', uid] as const,
    detail: (uid: string, id: string) => [...keys.budgets.all(uid), 'detail', id] as const,
  },
  recurring_rules: {
    all:    (uid: string) => ['recurring_rules', uid] as const,
    detail: (uid: string, id: string) => [...keys.recurring_rules.all(uid), 'detail', id] as const,
  },
  profiles: {
    current: (uid: string) => ['profiles', uid] as const,
  },
} as const;
