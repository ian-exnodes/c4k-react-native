import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  left?: ReactNode;
};

export function Button({ label, variant = 'primary', left, style, ...rest }: Props) {
  const { tokens } = useTheme();
  return (
    <Pressable
      {...rest}
      style={(state) => [
        styles.base,
        { borderRadius: tokens.radius.md, paddingVertical: tokens.space[3], paddingHorizontal: tokens.space[4] },
        bgFor(variant, tokens, state.pressed),
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <View style={styles.row}>
        {left}
        <Text style={{ color: textColorFor(variant, tokens), fontWeight: '600' }}>{label}</Text>
      </View>
    </Pressable>
  );
}

function bgFor(v: Variant, t: ReturnType<typeof useTheme>['tokens'], pressed: boolean) {
  const opacity = pressed ? 0.85 : 1;
  if (v === 'primary')   return { backgroundColor: t.color.primary, opacity };
  if (v === 'secondary') return { backgroundColor: t.color.surface, borderWidth: 1, borderColor: t.color.border, opacity };
  return { backgroundColor: 'transparent', opacity };
}

function textColorFor(v: Variant, t: ReturnType<typeof useTheme>['tokens']) {
  if (v === 'primary') return '#FFFFFF';
  return t.color.text;
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
