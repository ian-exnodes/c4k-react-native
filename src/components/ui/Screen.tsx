import { View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  edges?: Edge[];
  padded?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, edges = ['top', 'bottom'], padded = true, style }: Props) {
  const { tokens } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: tokens.color.bg }, style]}
    >
      <View style={[{ flex: 1 }, padded && { paddingHorizontal: tokens.space[4] }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
