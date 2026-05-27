import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, ...rest }: ViewProps) {
  const { tokens } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tokens.color.surface,
          borderRadius: tokens.radius.lg,
          padding: tokens.space[4],
          borderWidth: 1,
          borderColor: tokens.color.border,
        },
        style,
      ]}
    />
  );
}
