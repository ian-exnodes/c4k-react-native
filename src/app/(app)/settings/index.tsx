import { Pressable, ScrollView, Switch, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useBiometric } from '@/hooks/use-biometric';

type ThemeMode = 'system' | 'light' | 'dark';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { tokens, mode, setMode } = useTheme();
  const { isAvailable, isEnabled, setEnabled } = useBiometric();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: tokens.space[4], paddingTop: tokens.space[4] }}>
        <Text variant="display">Settings</Text>

        <Card>
          <Text variant="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: tokens.space[2] }}>
            Account
          </Text>
          <Text>{user?.email ?? 'unknown'}</Text>
        </Card>

        <Card>
          <Text variant="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: tokens.space[3] }}>
            Appearance
          </Text>
          <View style={{ gap: tokens.space[2] }}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: tokens.space[2],
                  paddingHorizontal: tokens.space[2],
                  borderRadius: tokens.radius.sm,
                  backgroundColor: mode === m ? tokens.color.bgSubtle : 'transparent',
                }}
              >
                <Text style={{ textTransform: 'capitalize' }}>{m}</Text>
                {mode === m ? <Text style={{ color: tokens.color.primary }}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: tokens.space[3] }}>
            Security
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text>Biometric unlock</Text>
              <Text variant="muted" style={{ fontSize: 12 }}>
                {isAvailable
                  ? 'Require FaceID or TouchID when opening the app'
                  : 'Not available on this device'}
              </Text>
            </View>
            <Switch value={isEnabled} onValueChange={setEnabled} disabled={!isAvailable} />
          </View>
        </Card>

        <View style={{ marginTop: tokens.space[6] }}>
          <Button label="Sign out" variant="secondary" onPress={signOut} />
        </View>
      </ScrollView>
    </Screen>
  );
}
