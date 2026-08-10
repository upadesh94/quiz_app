import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

export function QuizResultScreen({ navigation, route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();

  const passed = route.params.percentage >= 40;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#160629' : '#f9fafb', paddingHorizontal: containerPadding }]}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: isTablet ? 500 : '100%',
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.xl,
          minHeight: '100%',
        }}
      >
        <Text
          style={{
            fontSize: fontSize['3xl'],
            fontWeight: '800',
            marginBottom: spacing.lg,
            color: passed ? (isDark ? '#86efac' : '#16a34a') : (isDark ? '#fca5a5' : '#dc2626'),
          }}
        >
          {passed ? '🎉 Excellent!' : '📚 Keep Practicing'}
        </Text>

        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.md,
            color: isDark ? '#FFFFFF' : '#0f172a',
          }}
        >
          Quiz Result
        </Text>

        <View
          style={{
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : '#f0f9ff',
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(168, 85, 247, 0.5)',
            borderRadius: 16,
            marginBottom: spacing.xl,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fontSize['2xl'],
              fontWeight: '700',
              color: passed ? (isDark ? '#86efac' : '#16a34a') : (isDark ? '#fca5a5' : '#dc2626'),
              marginBottom: spacing.md,
            }}
          >
            {route.params.score}/{route.params.totalMarks}
          </Text>
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: '600',
              color: isDark ? '#FFFFFF' : '#0f172a',
              marginBottom: spacing.sm,
            }}
          >
            {route.params.percentage}%
          </Text>
          <Text
            style={{
              fontSize: fontSize.base,
              color: isDark ? '#cbd5e1' : '#334155',
            }}
          >
            {passed ? '✓ You passed!' : '✗ You need 40% to pass'}
          </Text>
        </View>

        <CustomButton
          title="🏠 Back to Dashboard"
          onPress={() => navigation.replace('StudentDashboard')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
