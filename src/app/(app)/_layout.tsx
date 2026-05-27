import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function AppLayout() {
  const { session, isLoading } = useAuth();
  const { tokens } = useTheme();

  if (isLoading) {
    return (
      <Screen>
        <Text variant="muted">Loading...</Text>
      </Screen>
    );
  }
  // typedRoutes workaround: router.d.ts not yet regenerated for (auth) group;
  // regenerates on next `expo start`. Route is correct at runtime.
  if (!session) return <Redirect href={'/(auth)/sign-in' as never} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.color.primary,
        tabBarInactiveTintColor: tokens.color.textMuted,
        tabBarStyle: { backgroundColor: tokens.color.surface, borderTopColor: tokens.color.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}
