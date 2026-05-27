// src/components/ui/TextField.tsx
import { TextInput, type TextInputProps, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
import { forwardRef } from 'react';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, helper, style, ...rest },
  ref
) {
  const { tokens } = useTheme();
  const borderColor = error ? tokens.color.danger : tokens.color.border;
  return (
    <View style={{ marginBottom: tokens.space[3] }}>
      {label ? (
        <Text variant="muted" style={{ marginBottom: tokens.space[1], fontWeight: '600' }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={tokens.color.textMuted}
        {...rest}
        style={[
          {
            backgroundColor: tokens.color.surface,
            borderColor,
            borderWidth: 1,
            borderRadius: tokens.radius.md,
            paddingVertical: tokens.space[3],
            paddingHorizontal: tokens.space[4],
            fontSize: tokens.typography.size.md,
            color: tokens.color.text,
          },
          style,
        ]}
      />
      {error ? (
        <Text variant="muted" style={{ color: tokens.color.danger, marginTop: tokens.space[1] }}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="muted" style={{ marginTop: tokens.space[1] }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});
