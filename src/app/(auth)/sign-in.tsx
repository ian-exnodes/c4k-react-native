import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { View } from 'react-native';

export default function SignInPlaceholder() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <Text variant="display">Finance</Text>
        <Card>
          <Text variant="title">Sign in</Text>
          <Text variant="muted">Authentication ships in Phase 2.</Text>
        </Card>
      </View>
    </Screen>
  );
}
