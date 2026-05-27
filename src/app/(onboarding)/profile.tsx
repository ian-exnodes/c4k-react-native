import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pressable } from 'react-native';
import { useState } from 'react';
import { WizardChrome, useWizard, CURRENCIES } from '@/features/onboarding';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/use-theme';

const schema = z.object({
  display_name:     z.string().min(1, 'Enter a display name').max(60),
  default_currency: z.string().length(3),
});
type FormShape = z.infer<typeof schema>;

export default function ProfileStep() {
  const { setProfile, next, data } = useWizard();
  const { tokens } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: data.profile ?? { display_name: '', default_currency: 'USD' },
  });

  const currency = watch('default_currency');

  const onSubmit = handleSubmit((values) => {
    setProfile(values);
    next();
  });

  return (
    <WizardChrome
      title="Your profile"
      subtitle="A name on receipts and a default currency for amounts"
      footer={<Button label="Continue" onPress={onSubmit} />}
    >
      <Controller
        control={control}
        name="display_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Display name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.display_name?.message}
            autoCapitalize="words"
            returnKeyType="next"
          />
        )}
      />

      <Text variant="muted" style={{ marginBottom: tokens.space[1], fontWeight: '600' }}>Currency</Text>
      <Pressable
        onPress={() => setPickerOpen((o) => !o)}
        style={{
          backgroundColor: tokens.color.surface,
          borderColor: tokens.color.border,
          borderWidth: 1,
          borderRadius: tokens.radius.md,
          paddingVertical: tokens.space[3],
          paddingHorizontal: tokens.space[4],
        }}
      >
        <Text>
          {CURRENCIES.find((c) => c.code === currency)?.code} — {CURRENCIES.find((c) => c.code === currency)?.label}  ▾
        </Text>
      </Pressable>

      {pickerOpen ? (
        <Card style={{ marginTop: tokens.space[2], padding: tokens.space[2] }}>
          {CURRENCIES.map((c) => (
            <Controller
              key={c.code}
              control={control}
              name="default_currency"
              render={({ field: { onChange } }) => (
                <Pressable
                  onPress={() => { onChange(c.code); setPickerOpen(false); }}
                  style={{
                    paddingVertical: tokens.space[2],
                    paddingHorizontal: tokens.space[3],
                    borderRadius: tokens.radius.sm,
                    backgroundColor: c.code === currency ? tokens.color.bgSubtle : 'transparent',
                  }}
                >
                  <Text>
                    <Text style={{ fontWeight: '600' }}>{c.code}</Text>
                    <Text variant="muted">  {c.label}</Text>
                  </Text>
                </Pressable>
              )}
            />
          ))}
        </Card>
      ) : null}
    </WizardChrome>
  );
}
