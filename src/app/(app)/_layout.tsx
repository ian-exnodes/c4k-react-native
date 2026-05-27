import { Redirect, Tabs } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useBiometric } from '@/hooks/use-biometric';
import { LockScreen } from '@/features/biometric';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/services/supabase/client';
import { keys } from '@/services/query/keys';

export default function AppLayout() {
  const { session, isLoading: authLoading } = useAuth();
  const { tokens } = useTheme();
  const { isLocked } = useBiometric();
  const uid = session?.user.id;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: uid ? keys.profiles.current(uid) : ['profiles', '__none__'],
    queryFn: async () => {
      if (!uid) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
  });

  if (authLoading || (uid && profileLoading)) {
    return (
      <Screen>
        <Text variant="muted">Loading...</Text>
      </Screen>
    );
  }

  if (!session) return <Redirect href={'/(auth)/sign-in' as never} />;
  if (!session.user.email_confirmed_at) {
    // Don't bounce them to sign-in — they'd just sign in again and loop.
    // Send them where they can act: the verification-email screen.
    const email = encodeURIComponent(session.user.email ?? '');
    return <Redirect href={`/(auth)/check-email?email=${email}` as never} />;
  }
  if (!profile) return <Redirect href={'/(onboarding)/welcome' as never} />;
  if (isLocked) return <LockScreen />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.color.primary,
        tabBarInactiveTintColor: tokens.color.textMuted,
        tabBarStyle: { backgroundColor: tokens.color.surface, borderTopColor: tokens.color.border },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
