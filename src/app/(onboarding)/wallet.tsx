import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { WizardChrome, useWizard } from '@/features/onboarding';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { fromDecimalString } from '@/lib/money';

// Strip thousand-separator commas (and any non-numeric/non-dot character)
// before validation/parsing. The visible input may contain "10,000,000" but
// fromDecimalString needs raw digits.
function cleanBalance(s: string): string {
  return s.replace(/[^\d.-]/g, '');
}

// Add thousand-separator commas for display. Decimal portion (if any) is left
// untouched so the user keeps their precision (e.g. "100.5" stays "100.5"
// while "10000000" becomes "10,000,000"). Negative sign preserved.
function formatBalance(s: string): string {
  if (!s) return s;
  const cleaned = cleanBalance(s);
  if (!cleaned) return s;
  const negative = cleaned.startsWith('-');
  const abs = cleaned.replace(/^-/, '');
  const [whole, frac] = abs.split('.');
  const wholeNum = whole === '' ? 0 : Number(whole);
  if (!Number.isFinite(wholeNum)) return s;
  const wholeFormatted = wholeNum.toLocaleString('en-US');
  const body = frac !== undefined ? `${wholeFormatted}.${frac}` : wholeFormatted;
  return negative ? `-${body}` : body;
}

const schema = z.object({
  name: z.string().min(1, 'Wallet needs a name').max(40),
  initial_balance_str: z.string().refine(
    (v) => {
      try { fromDecimalString(cleanBalance(v)); return true; }
      catch { return false; }
    },
    { message: 'Enter an amount like 100.00' }
  ),
});
type FormShape = z.infer<typeof schema>;

export default function WalletStep() {
  const { setWallet, next, data } = useWizard();
  const [focused, setFocused] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.wallet?.name ?? 'Cash',
      initial_balance_str: data.wallet ? formatBalance((data.wallet.initial_balance / 100).toFixed(2)) : '0.00',
    },
  });

  const onSubmit = handleSubmit(({ name, initial_balance_str }) => {
    setWallet({ name, initial_balance: fromDecimalString(cleanBalance(initial_balance_str)) });
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
            // While focused show the raw editable value (no commas); on blur,
            // reformat. This avoids fighting the cursor as the user types.
            value={focused ? cleanBalance(value) : formatBalance(value)}
            onChangeText={(t) => onChange(cleanBalance(t))}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur();
            }}
            error={errors.initial_balance_str?.message}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        )}
      />
    </WizardChrome>
  );
}
