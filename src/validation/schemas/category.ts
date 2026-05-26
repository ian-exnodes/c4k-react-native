// src/validation/schemas/category.ts
import { z } from 'zod';

export const categoryKindSchema = z.enum(['expense', 'income']);

export const categorySchema = z.object({
  id:          z.string().uuid(),
  user_id:     z.string().uuid(),
  name:        z.string().min(1),
  kind:        categoryKindSchema,
  color:       z.string().nullable(),
  icon:        z.string().nullable(),
  parent_id:   z.string().uuid().nullable(),
  is_archived: z.boolean(),
  position:    z.number().int(),
  created_at:  z.string(),
  updated_at:  z.string(),
  deleted_at:  z.string().nullable(),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryKind = z.infer<typeof categoryKindSchema>;
