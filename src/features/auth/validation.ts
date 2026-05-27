// src/features/auth/validation.ts
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const emailSchema = z.string().email('Enter a valid email');

export const signInSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    email:    emailSchema,
    password: passwordSchema,
    confirm:  z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirm) {
      ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'Passwords do not match' });
    }
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm:  z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirm) {
      ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'Passwords do not match' });
    }
  });

export type SignInForm        = z.infer<typeof signInSchema>;
export type SignUpForm        = z.infer<typeof signUpSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
