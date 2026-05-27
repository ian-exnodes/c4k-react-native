// src/lib/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

// Process.env is statically replaced by Expo's bundler when names begin with EXPO_PUBLIC_.
// Read into a plain object so Zod can validate at module load.
const rawEnv = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

const parsed = EnvSchema.safeParse(rawEnv);
if (!parsed.success) {
  // Throw at module load so a missing env crashes early in dev with a clear message.
  throw new Error(
    `Invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
  );
}

export const env = parsed.data;
