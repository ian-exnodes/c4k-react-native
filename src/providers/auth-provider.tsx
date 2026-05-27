// src/providers/auth-provider.tsx
import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { queryClient } from '@/services/query/client';
import * as outbox from '@/services/sync/outbox';
import { createLogger } from '@/lib/log';

const log = createLogger('auth');

type MutationResult = { error?: { message: string; code?: string } };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut:                   () => Promise<void>;
  signUp:                    (email: string, password: string) => Promise<MutationResult>;
  signIn:                    (email: string, password: string) => Promise<MutationResult>;
  resetPasswordForEmail:     (email: string) => Promise<MutationResult>;
  updatePassword:            (newPassword: string) => Promise<MutationResult>;
  resendVerificationEmail:   (email: string) => Promise<MutationResult>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const REDIRECT_CALLBACK = 'c4kfinance://auth/callback';
const REDIRECT_RESET    = 'c4kfinance://auth/reset-password';

function toResult(error: AuthError | null): MutationResult {
  if (!error) return {};
  return { error: { message: error.message, code: error.code } };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session restore + auth state subscription
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      log.debug('auth event', event);
      setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Deep-link handler — auth callbacks and password-reset links
  useEffect(() => {
    const handler = ({ url }: { url: string }) => {
      log.debug('deep link', url);
      if (url.includes('/auth/callback')) {
        void supabase.auth.exchangeCodeForSession(url);
        return;
      }
      if (url.includes('/auth/reset-password')) {
        // Route first so the user sees the form, then exchange. The (auth)
        // gate suppresses its session-based redirect while the reset-password
        // route is active (see (auth)/_layout.tsx).
        router.push('/(auth)/reset-password' as never);
        void supabase.auth.exchangeCodeForSession(url).catch((e) => {
          log.warn('reset-password exchange failed', e);
        });
        return;
      }
    };
    const sub = Linking.addEventListener('url', handler);
    void Linking.getInitialURL().then((url) => {
      if (url) handler({ url });
    });
    return () => sub.remove();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await outbox.clear();
    queryClient.clear();
  };

  const signUp: AuthContextValue['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: REDIRECT_CALLBACK },
    });
    return toResult(error);
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return toResult(error);
  };

  const resetPasswordForEmail: AuthContextValue['resetPasswordForEmail'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_RESET,
    });
    return toResult(error);
  };

  const updatePassword: AuthContextValue['updatePassword'] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return toResult(error);
  };

  const resendVerificationEmail: AuthContextValue['resendVerificationEmail'] = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: REDIRECT_CALLBACK },
    });
    return toResult(error);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signOut,
        signUp,
        signIn,
        resetPasswordForEmail,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
