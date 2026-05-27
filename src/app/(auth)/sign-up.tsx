import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { AuthFormShell, PasswordField, signUpSchema, type SignUpForm } from '@/features/auth';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { tokens } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await signUp(email, password);
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    router.push((`/(auth)/check-email?email=${encodeURIComponent(email)}`) as never);
  });

  return (
    <AuthFormShell
      title="Create account"
      subtitle="We'll send you a verification email"
      footer={
        <View style={{ alignItems: 'center' }}>
          <Text variant="muted">
            Already have an account?{' '}
            <Link href={'/(auth)/sign-in' as never}>
              <Text style={{ color: tokens.color.primary, fontWeight: '600' }}>Sign in</Text>
            </Link>
          </Text>
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
            textContentType="emailAddress"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
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
            label="Confirm password"
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

      <Button label={isSubmitting ? 'Creating...' : 'Create account'} onPress={onSubmit} disabled={isSubmitting} />
    </AuthFormShell>
  );
}
