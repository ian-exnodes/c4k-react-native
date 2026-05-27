import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useBiometric } from '@/hooks/use-biometric';

export function LockScreen() {
  const { tokens } = useTheme();
  const { signOut } = useAuth();
  const { unlock } = useBiometric();
  const [attempting, setAttempting] = useState(false);

  const tryUnlock = async () => {
    if (attempting) return;
    setAttempting(true);
    try {
      await unlock();
    } finally {
      setAttempting(false);
    }
  };

  useEffect(() => {
    void tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.space[6] }}>
        <View
          style={{
            width: 64, height: 64, borderRadius: tokens.radius.lg,
            backgroundColor: tokens.color.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 28 }}>C</Text>
        </View>

        <View style={{ alignItems: 'center', gap: tokens.space[1] }}>
          <Text variant="display">c4k Finance</Text>
          <Text variant="muted">Locked</Text>
        </View>

        <View style={{ width: '100%', gap: tokens.space[3], marginTop: tokens.space[4] }}>
          <Button
            label={attempting ? 'Unlocking...' : 'Unlock'}
            onPress={tryUnlock}
            disabled={attempting}
          />
          <Button label="Sign out" variant="ghost" onPress={signOut} />
        </View>
      </View>
    </Screen>
  );
}
