import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <Text variant="muted">Loading...</Text>
      </Screen>
    );
  }

  if (session && session.user.email_confirmed_at) {
    return <Redirect href={'/(app)' as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
