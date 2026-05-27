import { Pressable, ScrollView, View } from 'react-native';
import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { WizardChrome, useWizard, DEFAULT_CATEGORIES } from '@/features/onboarding';
import { finish } from '@/features/onboarding/finish';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';

export default function CategoriesStep() {
  const { data, setCategories } = useWizard();
  const { tokens } = useTheme();
  const { session } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(data.categories ?? DEFAULT_CATEGORIES.map((c) => c.name))
  );
  const [submitting, setSubmitting] = useState(false);

  // If the user landed here via deep link / fast-refresh / hardware back
  // without completing steps 2 and 3, restart the wizard. Without these
  // earlier values the finish() inserts would be malformed.
  if (!data.profile || !data.wallet) {
    return <Redirect href={'/(onboarding)/welcome' as never} />;
  }
  const profileData = data.profile;
  const walletData = data.wallet;

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleFinish = async () => {
    if (!session?.user) return;
    setSubmitting(true);
    const picked = Array.from(selected);
    setCategories(picked);
    try {
      await finish({
        uid: session.user.id,
        profile: profileData,
        wallet:  walletData,
        categories: picked,
      });
      router.replace('/(app)' as never);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!session?.user) return;
    setSubmitting(true);
    setCategories([]);
    try {
      await finish({
        uid: session.user.id,
        profile: profileData,
        wallet:  walletData,
        categories: [],
      });
      router.replace('/(app)' as never);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WizardChrome
      title="Pick your categories"
      subtitle="You can edit these later. Tap to uncheck any you don't need."
      footer={
        <View style={{ gap: tokens.space[2] }}>
          <Button label={submitting ? 'Finishing...' : 'Finish'} onPress={handleFinish} disabled={submitting} />
          <Button label="Skip for now" variant="ghost" onPress={handleSkip} disabled={submitting} />
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ gap: tokens.space[2] }}>
        {DEFAULT_CATEGORIES.map((cat) => {
          const isOn = selected.has(cat.name);
          return (
            <Pressable
              key={cat.name}
              onPress={() => toggle(cat.name)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: tokens.space[3],
                padding: tokens.space[3],
                borderRadius: tokens.radius.md,
                borderWidth: 1,
                borderColor: isOn ? cat.color : tokens.color.border,
                backgroundColor: isOn ? tokens.color.bgSubtle : tokens.color.surface,
              }}
            >
              <View style={{
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: cat.color,
                opacity: isOn ? 1 : 0.5,
              }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{cat.name}</Text>
                <Text variant="muted" style={{ fontSize: 11 }}>{cat.kind === 'expense' ? 'Expense' : 'Income'}</Text>
              </View>
              <Text style={{ fontSize: 18, color: isOn ? tokens.color.primary : tokens.color.textMuted }}>
                {isOn ? '✓' : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </WizardChrome>
  );
}
