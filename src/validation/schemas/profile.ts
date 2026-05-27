// src/validation/schemas/profile.ts
import { z } from 'zod';

export const profileSchema = z.object({
  id:               z.string().uuid(),
  display_name:     z.string().nullable(),
  default_currency: z.string().length(3),
  locale:           z.string(),
  created_at:       z.string(),
  updated_at:       z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
