import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  // Allow the reset-password screen to run even with a verified session —
  // the deep-link handler creates a temporary recovery session that we need
  // active while the user picks a new password.
  const isResetting = segments[segments.length - 1] === 'reset-password';

  if (isLoading) {
    return (
      <Screen>
        <Text variant="muted">Loading...</Text>
      </Screen>
    );
  }

  if (session && session.user.email_confirmed_at && !isResetting) {
    return <Redirect href={'/(app)' as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
