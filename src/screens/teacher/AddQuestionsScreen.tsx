import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QuestionForm } from '../../components/forms/QuestionForm';
import { CustomCard } from '../../components/common/CustomCard';
import { RootStackParamList } from '../../navigation/types';
import { QuestionService } from '../../services/quiz/QuestionService';
import { QuizService } from '../../services/quiz/QuizService';
import { Question, Quiz } from '../../types/models';
import { useResponsive } from '../../utils/responsive';
import { colors, radii } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddQuestions'>;

export function AddQuestionsScreen({ route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const quizData = await QuizService.getQuizById(route.params.quizId);
    setQuiz(quizData);
    const data = await QuestionService.getQuestionsByQuizId(route.params.quizId);
    setQuestions(data);
  };

  useEffect(() => {
    loadData();
  }, [route.params.quizId]);

  const handlePublish = async () => {
    await QuizService.updateQuizStatus(route.params.quizId, true);
    setQuiz((prev) => prev ? { ...prev, isPublished: true, status: 'published' } : null);
    setMessage('Quiz has been published successfully!');
  };

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
    const data = await QuestionService.getQuestionsByQuizId(route.params.quizId);
    setQuestions(data);
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
          {quiz && (!quiz.isPublished || quiz.status === 'draft') && (
            <View style={{ marginTop: spacing.md, backgroundColor: '#fff7ed', padding: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: '#fdba74' }}>
              <Text style={{ color: '#c2410c', fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs }}>
                This quiz is currently a Draft.
              </Text>
              <Text style={{ color: '#9a3412', fontSize: fontSize.xs, marginBottom: spacing.sm }}>
                Students cannot see this quiz until it is published.
              </Text>
              <View style={{ alignSelf: 'flex-start' }}>
                <Text
                  onPress={handlePublish}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radii.sm,
                    fontWeight: '700',
                    fontSize: fontSize.sm,
                    overflow: 'hidden'
                  }}
                >
                  Publish Quiz Now
                </Text>
              </View>
            </View>
          )}
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
