import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

export function QuizResultScreen({ navigation, route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();

  const passed = route.params.percentage >= 40;

  return (
    <ScrollView style={[styles.container, { paddingHorizontal: containerPadding }]}>
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
            color: passed ? '#16a34a' : '#dc2626',
          }}
        >
          {passed ? '🎉 Excellent!' : '📚 Keep Practicing'}
        </Text>

        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.md,
            color: '#0f172a',
          }}
        >
          Quiz Result
        </Text>

        <View
          style={{
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: '#f0f9ff',
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
              color: passed ? '#16a34a' : '#dc2626',
              marginBottom: spacing.md,
            }}
          >
            {route.params.score}/{route.params.totalMarks}
          </Text>
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: spacing.sm,
            }}
          >
            {route.params.percentage}%
          </Text>
          <Text
            style={{
              fontSize: fontSize.base,
              color: '#334155',
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
    backgroundColor: '#f9fafb',
  },
});
