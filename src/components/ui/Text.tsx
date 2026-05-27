import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'body' | 'muted';

type Props = TextProps & { variant?: Variant };

export function Text({ variant = 'body', style, ...rest }: Props) {
  const { tokens } = useTheme();
  const base = variants(tokens)[variant];
  return <RNText {...rest} style={[base, style]} />;
}

function variants(t: ReturnType<typeof useTheme>['tokens']): Record<Variant, TextStyle> {
  return {
    display: { fontSize: t.typography.size.display, fontWeight: '700', color: t.color.text },
    title:   { fontSize: t.typography.size.lg, fontWeight: '600', color: t.color.text },
    body:    { fontSize: t.typography.size.md, fontWeight: '400', color: t.color.text },
    muted:   { fontSize: t.typography.size.sm, fontWeight: '400', color: t.color.textMuted },
  };
}
