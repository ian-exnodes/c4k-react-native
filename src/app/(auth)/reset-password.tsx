import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { useState } from 'react';
import { AuthFormShell, PasswordField, resetPasswordSchema, type ResetPasswordForm } from '@/features/auth';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const { tokens } = useTheme();
  const [done, setDone] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    const { error } = await updatePassword(password);
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    setDone(true);
  });

  if (done) {
    return (
      <AuthFormShell
        title="Password updated"
        subtitle="You can now sign in with the new password"
        footer={<Button label="Sign in" onPress={() => router.replace('/(auth)/sign-in' as never)} />}
      >
        <View />
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell title="Set a new password" subtitle="Pick something memorable">
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            label="New password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="confirm"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            label="Confirm new password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirm?.message}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        )}
      />
      {errors.root ? (
        <Text variant="muted" style={{ color: tokens.color.danger, marginBottom: tokens.space[3] }}>
          {errors.root.message}
        </Text>
      ) : null}
      <Button label={isSubmitting ? 'Updating...' : 'Update password'} onPress={onSubmit} disabled={isSubmitting} />
    </AuthFormShell>
  );
}
