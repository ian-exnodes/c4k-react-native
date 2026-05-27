// src/validation/schemas/transaction.ts
import { z } from 'zod';

export const transactionKindSchema = z.enum(['expense', 'income', 'transfer']);

export const transactionSchema = z.object({
  id:                 z.string().uuid(),
  user_id:            z.string().uuid(),
  wallet_id:          z.string().uuid(),
  transfer_wallet_id: z.string().uuid().nullable(),
  category_id:        z.string().uuid().nullable(),
  kind:               transactionKindSchema,
  amount:             z.number().int().positive(),  // minor units, always positive
  occurred_at:        z.string(),
  note:               z.string().nullable(),
  tags:               z.array(z.string()),
  receipt_path:       z.string().nullable(),
  recurring_rule_id:  z.string().uuid().nullable(),
  created_at:         z.string(),
  updated_at:         z.string(),
  deleted_at:         z.string().nullable(),
}).superRefine((val, ctx) => {
  // Mirror the DB CHECK: transfer_wallet_id is NULL iff kind <> 'transfer',
  // and source != destination on a transfer.
  if (val.kind === 'transfer') {
    if (val.transfer_wallet_id === null) {
      ctx.addIssue({ code: 'custom', message: 'transfer requires transfer_wallet_id' });
    } else if (val.transfer_wallet_id === val.wallet_id) {
      ctx.addIssue({ code: 'custom', message: 'transfer source and destination must differ' });
    }
  } else if (val.transfer_wallet_id !== null) {
    ctx.addIssue({ code: 'custom', message: 'transfer_wallet_id only valid for kind=transfer' });
  }
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionKind = z.infer<typeof transactionKindSchema>;
