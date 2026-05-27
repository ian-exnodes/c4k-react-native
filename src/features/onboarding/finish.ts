import { queryClient } from '@/services/query/client';
import { keys } from '@/services/query/keys';
import * as outbox from '@/services/sync/outbox';
import { uuid } from '@/lib/uuid';
import { DEFAULT_CATEGORIES } from './default-categories';
import type { WizardData } from './wizard-context';

type FinishArgs = {
  uid:        string;
  profile:    NonNullable<WizardData['profile']>;
  wallet:     NonNullable<WizardData['wallet']>;
  categories: string[];
};

export async function finish({ uid, profile, wallet, categories }: FinishArgs): Promise<void> {
  const now = new Date().toISOString();

  // 1. Optimistic profile cache write so the (app) gate stops redirecting to onboarding.
  const profileRow = {
    id: uid,
    display_name:     profile.display_name,
    default_currency: profile.default_currency,
    locale:           'en-US',
    created_at:       now,
    updated_at:       now,
  };
  queryClient.setQueryData(keys.profiles.current(uid), profileRow);

  // 2. Profile insert.
  await outbox.enqueue({
    table:  'profiles',
    kind:   'insert',
    rowId:  uid,
    payload: {
      display_name:     profile.display_name,
      default_currency: profile.default_currency,
      locale:           'en-US',
    },
  });

  // 3. Wallet insert.
  const walletId = uuid();
  await outbox.enqueue({
    table:  'wallets',
    kind:   'insert',
    rowId:  walletId,
    payload: {
      user_id:         uid,
      name:            wallet.name,
      kind:            'cash',
      initial_balance: wallet.initial_balance,
      position:        0,
    },
  });

  // Optimistic wallet detail write.
  const walletRow = {
    id: walletId,
    user_id: uid,
    name: wallet.name,
    kind: 'cash' as const,
    initial_balance: wallet.initial_balance,
    color: null,
    icon: null,
    is_archived: false,
    position: 0,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  queryClient.setQueryData(keys.wallets.detail(uid, walletId), walletRow);

  // 4. Categories inserts.
  for (const name of categories) {
    const preset = DEFAULT_CATEGORIES.find((c) => c.name === name);
    if (!preset) continue;
    const id = uuid();
    await outbox.enqueue({
      table:  'categories',
      kind:   'insert',
      rowId:  id,
      payload: {
        user_id:  uid,
        name:     preset.name,
        kind:     preset.kind,
        color:    preset.color,
        icon:     preset.icon,
        position: preset.position,
      },
    });
  }
}
