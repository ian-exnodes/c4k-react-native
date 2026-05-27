// src/validation/schemas/budget.ts
import { z } from 'zod';

export const budgetSchema = z.object({
  id:              z.string().uuid(),
  user_id:         z.string().uuid(),
  category_id:     z.string().uuid().nullable(),  // NULL = overall budget
  amount:          z.number().int().positive(),
  period_month:    z.string().nullable(),         // YYYY-MM-01 or NULL for recurring
  is_recurring:    z.boolean(),
  alert_threshold: z.number().int().min(1).max(200),
  created_at:      z.string(),
  updated_at:      z.string(),
  deleted_at:      z.string().nullable(),
}).superRefine((val, ctx) => {
  if (val.is_recurring && val.period_month !== null) {
    ctx.addIssue({ code: 'custom', message: 'recurring budgets must have period_month=null' });
  }
  if (!val.is_recurring && val.period_month === null) {
    ctx.addIssue({ code: 'custom', message: 'non-recurring budgets must specify period_month' });
  }
});

export type Budget = z.infer<typeof budgetSchema>;
