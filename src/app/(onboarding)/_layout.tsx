import { Redirect, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { WizardProvider } from '@/features/onboarding';
import { supabase } from '@/services/supabase/client';
import { keys } from '@/services/query/keys';

export default function OnboardingLayout() {
  const { session, isLoading: authLoading } = useAuth();
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
  if (profile)  return <Redirect href={'/(app)' as never} />;

  return (
    <WizardProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </WizardProvider>
  );
}
