import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';
import { useState } from 'react';
import { AuthFormShell } from '@/features/auth';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { resendVerificationEmail } = useAuth();
  const { tokens } = useTheme();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setStatus('sending');
    const { error } = await resendVerificationEmail(email);
    if (error) {
      setStatus('error');
      setErrMsg(error.message);
      return;
    }
    setStatus('sent');
  };

  return (
    <AuthFormShell
      title="Check your email"
      subtitle={email ? `We sent a verification link to ${email}` : 'We sent a verification link'}
      footer={
        <View style={{ alignItems: 'center' }}>
          <Button label="Back to sign in" variant="ghost" onPress={() => router.replace('/(auth)/sign-in' as never)} />
        </View>
      }
    >
      <View style={{ gap: tokens.space[4] }}>
        <Text variant="muted">
          Tap the link in the email to verify your account. Then come back here — the app will pick it up automatically.
        </Text>
        <Button
          label={status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent. Check your inbox.' : 'Resend verification email'}
          variant="secondary"
          onPress={handleResend}
          disabled={status === 'sending' || status === 'sent' || !email}
        />
        {status === 'error' && errMsg ? (
          <Text variant="muted" style={{ color: tokens.color.danger }}>{errMsg}</Text>
        ) : null}
      </View>
    </AuthFormShell>
  );
}
