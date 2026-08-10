import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QuizForm } from '../../components/forms/QuizForm';
import { RootStackParamList } from '../../navigation/types';
import { QuizService } from '../../services/quiz/QuizService';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateQuiz'>;

export function CreateQuizScreen({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [message, setMessage] = useState('');

  const onCreateQuiz = async (payload: {
    title: string;
    subject: string;
    description?: string;
    classLevel: 8 | 9 | 10;
    timeLimitMinutes: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    passPercentage?: number;
    negativeMarking?: number;
    instructions?: string;
    shuffleQuestions?: boolean;
    allowReview?: boolean;
    tags?: string[];
    status?: 'draft' | 'published';
    isPublished?: boolean;
  }) => {
    if (!user?.id) {
      setMessage('Please login as teacher again.');
      return;
    }

    const quizId = await QuizService.createQuiz({
      ...payload,
      createdBy: user.id,
      isPublished: payload.isPublished ?? true,
    });

    setMessage(payload.isPublished === false ? 'Draft saved. You can add questions and publish later.' : 'Quiz created and published successfully. Add questions now.');
    navigation.navigate('AddQuestions', { quizId });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#160629' : colors.background, paddingHorizontal: containerPadding }]}>
      <View
        style={{
          maxWidth: isTablet ? 600 : '100%',
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.lg,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          ✏️ Create New Quiz
        </Text>
        <View
          style={{
            backgroundColor: isDark ? 'rgba(124, 58, 237, 0.1)' : '#EEF2FF',
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : '#C7D2FE',
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ color: isDark ? '#a78bfa' : colors.secondary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: spacing.xs }}>
            Step 1 of 2: Quiz Setup
          </Text>
          <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.5 }}>
            Fill quiz details, choose settings, then continue to Step 2 to add questions using manual input or quick paste.
          </Text>
        </View>
        <QuizForm onSubmit={onCreateQuiz} />
        {message ? (
          <Text
            style={{
              marginTop: spacing.lg,
              color: '#166534',
              fontWeight: '600',
              fontSize: fontSize.sm,
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
