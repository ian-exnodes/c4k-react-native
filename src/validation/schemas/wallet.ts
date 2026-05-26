// src/validation/schemas/wallet.ts
import { z } from 'zod';

export const walletKindSchema = z.enum(['cash', 'bank', 'credit_card', 'savings', 'other']);

export const walletSchema = z.object({
  id:              z.string().uuid(),
  user_id:         z.string().uuid(),
  name:            z.string().min(1),
  kind:            walletKindSchema,
  initial_balance: z.number().int(),       // BIGINT minor units; JS number is safe up to 2^53
  color:           z.string().nullable(),
  icon:            z.string().nullable(),
  is_archived:     z.boolean(),
  position:        z.number().int(),
  created_at:      z.string(),
  updated_at:      z.string(),
  deleted_at:      z.string().nullable(),
});

export type Wallet = z.infer<typeof walletSchema>;
export type WalletKind = z.infer<typeof walletKindSchema>;
