import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { useState } from 'react';
import { AuthFormShell, forgotPasswordSchema, type ForgotPasswordForm } from '@/features/auth';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function ForgotPasswordScreen() {
  const { resetPasswordForEmail } = useAuth();
  const { tokens } = useTheme();
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    const { error } = await resetPasswordForEmail(email);
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    setSent(true);
  });

  if (sent) {
    return (
      <AuthFormShell
        title="Check your email"
        subtitle="We sent a password-reset link. Tap it to set a new password."
        footer={<Button label="Back to sign in" variant="ghost" onPress={() => router.replace('/(auth)/sign-in' as never)} />}
      >
        <View />
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send a reset link"
      footer={
        <View style={{ alignItems: 'center' }}>
          <Link href={'/(auth)/sign-in' as never}>
            <Text style={{ color: tokens.color.primary, fontWeight: '600' }}>Back to sign in</Text>
          </Link>
        </View>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
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
      <Button label={isSubmitting ? 'Sending...' : 'Send reset link'} onPress={onSubmit} disabled={isSubmitting} />
    </AuthFormShell>
  );
}
