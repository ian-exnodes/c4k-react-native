// src/validation/schemas/recurring-rule.ts
import { z } from 'zod';
import { transactionKindSchema } from './transaction';

export const recurrenceFreqSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const recurringRuleSchema = z.object({
  id:           z.string().uuid(),
  user_id:      z.string().uuid(),
  wallet_id:    z.string().uuid(),
  category_id:  z.string().uuid().nullable(),
  kind:         transactionKindSchema,
  amount:       z.number().int().positive(),
  note:         z.string().nullable(),
  freq:         recurrenceFreqSchema,
  interval:     z.number().int().positive(),
  starts_on:    z.string(),                   // YYYY-MM-DD
  ends_on:      z.string().nullable(),
  next_run_on:  z.string(),
  last_run_on:  z.string().nullable(),
  is_paused:    z.boolean(),
  created_at:   z.string(),
  updated_at:   z.string(),
  deleted_at:   z.string().nullable(),
});

export type RecurringRule = z.infer<typeof recurringRuleSchema>;
export type RecurrenceFreq = z.infer<typeof recurrenceFreqSchema>;
