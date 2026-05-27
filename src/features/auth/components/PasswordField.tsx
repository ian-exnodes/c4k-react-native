// src/features/auth/components/PasswordField.tsx
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { TextField } from '@/components/ui/TextField';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: 'current-password' | 'new-password';
  textContentType?: 'password' | 'newPassword';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
};

export function PasswordField({
  label = 'Password',
  value,
  onChangeText,
  onBlur,
  error,
  autoComplete = 'current-password',
  textContentType = 'password',
  returnKeyType,
  onSubmitEditing,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const { tokens } = useTheme();
  return (
    <View style={{ position: 'relative' }}>
      <TextField
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={error}
        secureTextEntry={!revealed}
        autoCapitalize="none"
        autoComplete={autoComplete}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
      <Pressable
        onPress={() => setRevealed((r) => !r)}
        hitSlop={8}
        style={{
          position: 'absolute',
          right: tokens.space[3],
          top: 36,
          padding: 4,
        }}
      >
        <Text variant="muted" style={{ color: tokens.color.primary, fontSize: 12 }}>
          {revealed ? 'Hide' : 'Show'}
        </Text>
      </Pressable>
    </View>
  );
}
