import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

export function RoleSelectionScreen({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#eef7ff' }}>
      <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
        <View
          style={{
            maxWidth: isTablet ? 500 : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: fontSize['3xl'],
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: spacing.md,
              color: '#1d4ed8',
            }}
          >
            🎯 QuizMaster
          </Text>
          <Text
            style={{
              fontSize: fontSize['2xl'],
              fontWeight: '700',
              marginBottom: spacing.sm,
              textAlign: 'center',
              color: '#0f172a',
            }}
          >
            Welcome!
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginBottom: spacing.xl,
              color: '#334155',
              fontSize: fontSize.base,
              lineHeight: fontSize.base * 1.5,
            }}
          >
            Choose how you want to continue
          </Text>

          <CustomButton
            title="🎓 Student"
            onPress={() => navigation.navigate('Login', { role: 'student' })}
          />
          <CustomButton
            title="👩‍🏫 Teacher"
            onPress={() => navigation.navigate('Login', { role: 'teacher' })}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
    minHeight: '100%',
  },
});
