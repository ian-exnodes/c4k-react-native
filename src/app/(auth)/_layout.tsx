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
  // typedRoutes workaround: router.d.ts not yet regenerated for (app) group;
  // regenerates on next `expo start`. Route is correct at runtime.
  if (session) return <Redirect href={'/(app)' as never} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
