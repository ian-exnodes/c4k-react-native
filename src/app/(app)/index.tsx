import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/use-auth';
import { useNetwork } from '@/hooks/use-network';
import { View } from 'react-native';

export default function DashboardPlaceholder() {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  return (
    <Screen>
      <View style={{ gap: 16, paddingTop: 16 }}>
        <Text variant="display">Dashboard</Text>
        <Card>
          <Text variant="title">Welcome</Text>
          <Text variant="muted">Signed in as: {user?.email ?? 'unknown'}</Text>
          <Text variant="muted">Network: {isOnline ? 'online' : 'offline'}</Text>
        </Card>
        <Card>
          <Text variant="muted">Phase 1 foundation is in place. Feature screens ship in later phases.</Text>
        </Card>
      </View>
    </Screen>
  );
}
