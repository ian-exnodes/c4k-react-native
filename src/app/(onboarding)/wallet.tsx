import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WizardChrome, useWizard } from '@/features/onboarding';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { fromDecimalString } from '@/lib/money';

const schema = z.object({
  name: z.string().min(1, 'Wallet needs a name').max(40),
  initial_balance_str: z.string().refine(
    (v) => {
      try { fromDecimalString(v); return true; }
      catch { return false; }
    },
    { message: 'Enter an amount like 100.00' }
  ),
});
type FormShape = z.infer<typeof schema>;

export default function WalletStep() {
  const { setWallet, next, data } = useWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.wallet?.name ?? 'Cash',
      initial_balance_str: data.wallet ? (data.wallet.initial_balance / 100).toFixed(2) : '0.00',
    },
  });

  const onSubmit = handleSubmit(({ name, initial_balance_str }) => {
    setWallet({ name, initial_balance: fromDecimalString(initial_balance_str) });
    next();
  });

  return (
    <WizardChrome
      title="Your first wallet"
      subtitle="Cash, bank account, anything that holds money you track"
      footer={<Button label="Continue" onPress={onSubmit} />}
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Wallet name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            autoCapitalize="words"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="initial_balance_str"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Starting balance"
            helper="Amount currently in this wallet"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.initial_balance_str?.message}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        )}
      />
    </WizardChrome>
  );
}
