// src/features/auth/components/AuthFormShell.tsx
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthFormShell({ title, subtitle, children, footer }: Props) {
  const { tokens } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: tokens.space[8] }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.color.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.space[6],
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20 }}>C</Text>
        </View>
        <Text variant="display" style={{ marginBottom: tokens.space[1] }}>{title}</Text>
        {subtitle ? <Text variant="muted" style={{ marginBottom: tokens.space[6] }}>{subtitle}</Text> : null}
        <View style={{ flex: 1 }}>{children}</View>
        {footer ? <View style={{ marginTop: tokens.space[4] }}>{footer}</View> : null}
      </View>
    </Screen>
  );
}
