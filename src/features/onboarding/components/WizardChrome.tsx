import { Pressable, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';
import { useWizard } from '../wizard-context';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
};

export function WizardChrome({ title, subtitle, children, footer, showBack = true }: Props) {
  const { step, back } = useWizard();
  const { tokens } = useTheme();
  const totalSteps = 4;
  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: tokens.space[2],
        }}
      >
        {showBack && step > 1 ? (
          <Pressable onPress={back} hitSlop={8} style={{
            width: 32, height: 32, borderRadius: tokens.radius.sm,
            backgroundColor: tokens.color.bgSubtle,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18, color: tokens.color.text }}>‹</Text>
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}

        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => {
            const active = i + 1 === step;
            return (
              <View
                key={i}
                style={{
                  width: active ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: active ? tokens.color.primary : tokens.color.bgSubtle,
                }}
              />
            );
          })}
        </View>

        <View style={{ width: 32 }} />
      </View>

      <View style={{ flex: 1, paddingTop: tokens.space[6] }}>
        <Text variant="display" style={{ marginBottom: tokens.space[1] }}>{title}</Text>
        {subtitle ? <Text variant="muted" style={{ marginBottom: tokens.space[6] }}>{subtitle}</Text> : null}
        <View style={{ flex: 1 }}>{children}</View>
        {footer ? <View style={{ marginTop: tokens.space[4] }}>{footer}</View> : null}
      </View>
    </Screen>
  );
}
