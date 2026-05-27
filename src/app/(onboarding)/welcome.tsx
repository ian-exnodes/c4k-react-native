import { View } from 'react-native';
import { WizardChrome, useWizard } from '@/features/onboarding';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/use-theme';

export default function WelcomeStep() {
  const { next } = useWizard();
  const { tokens } = useTheme();

  return (
    <WizardChrome
      title="Welcome to c4k Finance"
      subtitle="Three quick steps and you're set up"
      footer={<Button label="Get started" onPress={next} />}
      showBack={false}
    >
      <View style={{ gap: tokens.space[3] }}>
        <Card>
          <Text variant="title">Track what you spend</Text>
          <Text variant="muted">Log expenses fast across wallets and categories.</Text>
        </Card>
        <Card>
          <Text variant="title">See where it goes</Text>
          <Text variant="muted">Charts and budgets arrive in later updates.</Text>
        </Card>
        <Card>
          <Text variant="title">Works offline</Text>
          <Text variant="muted">{"Add transactions anywhere; they sync when you're back online."}</Text>
        </Card>
      </View>
    </WizardChrome>
  );
}
