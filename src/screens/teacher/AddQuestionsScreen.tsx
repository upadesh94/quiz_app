import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QuestionForm } from '../../components/forms/QuestionForm';
import { CustomCard } from '../../components/common/CustomCard';
import { RootStackParamList } from '../../navigation/types';
import { QuestionService } from '../../services/quiz/QuestionService';
import { Question } from '../../types/models';
import { useResponsive } from '../../utils/responsive';
import { colors, radii } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddQuestions'>;

export function AddQuestionsScreen({ route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState('');

  const loadQuestions = async () => {
    const data = await QuestionService.getQuestionsByQuizId(route.params.quizId);
    setQuestions(data);
  };

  useEffect(() => {
    loadQuestions();
  }, [route.params.quizId]);

  const onAddQuestion = async (payload: {
    question: string;
    options: string[];
    correctAnswer: string;
    marks: number;
  }) => {
    const cleanedOptions = payload.options.filter((item) => item.trim().length > 0);
    await QuestionService.createQuestion({
      quizId: route.params.quizId,
      question: payload.question,
      options: cleanedOptions,
      correctAnswer: payload.correctAnswer,
      marks: payload.marks,
    });
    setMessage('Question added successfully.');
    await loadQuestions();
  };

  return (
    <ScrollView style={[styles.container, { paddingHorizontal: containerPadding }]}>
      <View
        style={{
          maxWidth: isTablet ? 700 : '100%',
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.md,
            color: colors.textPrimary,
          }}
        >
          ➕ Add Questions
        </Text>

        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: spacing.xs }}>
            Step 2 of 2: Build Question Bank
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.5 }}>
            Tip: You can copy questions from another source and paste them in Quick Paste format. Then parse and add instantly.
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
            Quiz ID: {route.params.quizId}
          </Text>
        </View>

        <QuestionForm onSubmit={onAddQuestion} />
        {message ? (
          <Text
            style={{
              color: '#166534',
              fontWeight: '600',
              marginTop: spacing.lg,
              marginBottom: spacing.lg,
              fontSize: fontSize.sm,
            }}
          >
            {message}
          </Text>
        ) : null}

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.xl,
            marginBottom: spacing.lg,
            color: colors.textPrimary,
          }}
        >
          Current Questions ({questions.length})
        </Text>
        {questions.map((question, index) => (
          <CustomCard key={question.id}>
            <Text
              style={{
                fontWeight: '700',
                marginBottom: spacing.sm,
                fontSize: fontSize.base,
                color: colors.textPrimary,
              }}
            >
              {index + 1}. {question.question}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.xs }}>
              ✓ Correct: {question.correctAnswer}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.xs }}>
              Options: {question.options.join(' | ')}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: '#334155' }}>
              🎯 Marks: {question.marks ?? 1}
            </Text>
          </CustomCard>
        ))}
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
