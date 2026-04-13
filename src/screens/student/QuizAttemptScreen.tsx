import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { CustomButton } from '../../components/common/CustomButton';
import { RootStackParamList } from '../../navigation/types';
import { Question } from '../../types/models';
import { QuestionService } from '../../services/quiz/QuestionService';
import { AttemptService } from '../../services/quiz/AttemptService';
import { QuizService } from '../../services/quiz/QuizService';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizAttempt'>;

export function QuizAttemptScreen({ navigation, route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const user = useAppSelector((state) => state.auth.user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(10 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startedAt] = useState(new Date().toISOString());
  const [quizMeta, setQuizMeta] = useState<{ title: string; subject: string; classLevel: 8 | 9 | 10; teacherId?: string } | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      const [data, quiz] = await Promise.all([
        QuestionService.getQuestionsByQuizId(route.params.quizId),
        QuizService.getQuizById(route.params.quizId),
      ]);

      if (quiz) {
        setQuizMeta({
          title: quiz.title,
          subject: quiz.subject,
          classLevel: quiz.classLevel,
          teacherId: quiz.createdBy,
        });
        setSecondsRemaining(quiz.timeLimitMinutes * 60);
      }

      setQuestions(data);
    };

    loadQuestions();
  }, [route.params.quizId]);

  useEffect(() => {
    if (questions.length === 0) {
      return;
    }

    const timerId = setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          clearInterval(timerId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [questions.length]);

  const totalMarks = useMemo(
    () => questions.reduce((total, question) => total + (question.marks ?? 1), 0),
    [questions],
  );

  const attemptedCount = useMemo(() => Object.keys(answers).length, [answers]);

  const remainingCount = useMemo(() => {
    return Math.max(questions.length - attemptedCount - skippedQuestionIds.length, 0);
  }, [questions.length, attemptedCount, skippedQuestionIds.length]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const hasSelectedCurrentAnswer = !!(currentQuestion && answers[currentQuestion.id]);
  const isTimeLow = secondsRemaining <= 60;

  const navigateQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) {
      return;
    }

    setCurrentQuestionIndex(index);
  };

  const onSelectOption = (option: string) => {
    if (!currentQuestion) {
      return;
    }

    setAnswers((current) => ({ ...current, [currentQuestion.id]: option }));
    setSkippedQuestionIds((current) => current.filter((item) => item !== currentQuestion.id));
  };

  const onSkipCurrent = () => {
    if (!currentQuestion) {
      return;
    }

    if (!answers[currentQuestion.id]) {
      setSkippedQuestionIds((current) => (current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]));
    }

    navigateQuestion(Math.min(currentQuestionIndex + 1, questions.length - 1));
  };

  const onSubmit = async () => {
    if (questions.length === 0) {
      return;
    }

    if (!user?.id || user.role !== 'student') {
      setError('Please login with your student account to submit this quiz.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const score = questions.reduce((total, question) => {
        const chosen = answers[question.id];
        if (chosen === question.correctAnswer) {
          return total + (question.marks ?? 1);
        }
        return total;
      }, 0);

      const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;

      await AttemptService.submitAttempt({
        studentId: user.id,
        studentName: user.fullName ?? user.username,
        quizId: route.params.quizId,
        quizTitle: quizMeta?.title,
        teacherId: quizMeta?.teacherId,
        subject: quizMeta?.subject ?? 'General',
        classLevel: quizMeta?.classLevel ?? user.classLevel ?? 10,
        score,
        totalMarks,
        percentage,
        passed: percentage >= 40,
        answers,
        startedAt,
        completedAt: new Date().toISOString(),
      });

      navigation.replace('QuizResult', {
        quizId: route.params.quizId,
        score,
        totalMarks,
        percentage,
      });
    } catch {
      setError('Unable to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmSubmit = () => {
    Alert.alert(
      'Submit Quiz',
      'Are you sure you want to submit your quiz? You cannot change answers after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'default',
          onPress: onSubmit,
        },
      ],
    );
  };

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: fontSize.base, color: '#334155' }}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ ...styles.container, paddingHorizontal: containerPadding }}
      contentContainerStyle={{ gap: spacing.lg, paddingVertical: spacing.lg }}
    >
      <View
        style={{
          maxWidth: isTablet ? 980 : '100%',
          alignSelf: 'center',
          width: '100%',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.md,
            ...shadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: fontSize.lg, fontWeight: '700' }}>←</Text>
            </Pressable>
            <View>
              <Text style={{ fontSize: fontSize['2xl'], fontWeight: '800', color: colors.textPrimary }}>
                {quizMeta?.title ?? 'Quiz Test'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                Solve carefully and track your progress
              </Text>
            </View>
          </View>

          <View
            style={{
              borderRadius: 999,
              backgroundColor: isTimeLow ? '#FEE2E2' : '#DBEAFE',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            }}
          >
            <Text
              style={{
                fontSize: fontSize.base,
                fontWeight: '800',
                color: isTimeLow ? colors.error : colors.primary,
              }}
            >
              {minutes}:{String(seconds).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
            <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '600' }}>Progress</Text>
            <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '600' }}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
          <View style={{ height: 10, borderRadius: 999, backgroundColor: '#DBEAFE' }}>
            <View
              style={{
                width: `${Math.max(progressPercent, 3)}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: colors.primary,
              }}
            />
          </View>
          {!hasSelectedCurrentAnswer ? (
            <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontSize: fontSize.sm }}>
              Select an option or tap Skip to move ahead.
            </Text>
          ) : null}
        </View>

        <QuestionCard
          question={`${currentQuestionIndex + 1}. ${currentQuestion.question}`}
          options={currentQuestion.options}
          selectedOption={answers[currentQuestion.id]}
          onSelect={onSelectOption}
        />

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
          <View style={{ flex: 1, backgroundColor: '#FEE2E2', borderRadius: radii.md, paddingVertical: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.error, fontWeight: '700', fontSize: fontSize.lg }}>Skipped</Text>
            <Text style={{ color: colors.error, fontWeight: '800', fontSize: fontSize['2xl'] }}>{skippedQuestionIds.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#EEF2FF', borderRadius: radii.md, paddingVertical: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.secondary, fontWeight: '700', fontSize: fontSize.lg }}>Remaining</Text>
            <Text style={{ color: colors.secondary, fontWeight: '800', fontSize: fontSize['2xl'] }}>{remainingCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#DCFCE7', borderRadius: radii.md, paddingVertical: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.success, fontWeight: '700', fontSize: fontSize.lg }}>Attempted</Text>
            <Text style={{ color: colors.success, fontWeight: '800', fontSize: fontSize['2xl'] }}>{attemptedCount}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.lg }}>
          {questions.map((question, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isAttempted = !!answers[question.id];
            const isSkipped = skippedQuestionIds.includes(question.id);

            let backgroundColor = '#E2E8F0';
            let borderColor = 'transparent';
            if (isAttempted) {
              backgroundColor = '#DCFCE7';
            }
            if (isSkipped) {
              backgroundColor = '#FEE2E2';
            }
            if (isCurrent) {
              backgroundColor = '#DBEAFE';
              borderColor = colors.primary;
            }

            return (
              <Pressable
                key={question.id}
                onPress={() => navigateQuestion(index)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor,
                  borderWidth: 2,
                  borderColor,
                }}
              >
                <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: fontSize.sm }}>{index + 1}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Pressable
            onPress={() => navigateQuestion(currentQuestionIndex - 1)}
            disabled={isFirstQuestion}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
              opacity: isFirstQuestion ? 0.5 : 1,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: fontSize.lg }}>PREVIOUS</Text>
          </Pressable>
          <Pressable
            onPress={onSkipCurrent}
            style={{
              flex: 1,
              backgroundColor: '#EEF2FF',
              borderRadius: radii.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.secondary, fontWeight: '700', fontSize: fontSize.lg }}>SKIP</Text>
          </Pressable>
          <Pressable
            onPress={() => navigateQuestion(currentQuestionIndex + 1)}
            disabled={isLastQuestion}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: radii.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
              opacity: isLastQuestion ? 0.5 : 1,
              ...shadows.soft,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: fontSize.lg }}>NEXT</Text>
          </Pressable>
        </View>

        {isLastQuestion ? (
          <View style={{ marginTop: spacing.lg }}>
            <CustomButton
              title={isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              onPress={onConfirmSubmit}
              loading={isSubmitting}
            />
          </View>
        ) : null}

        {error ? (
          <Text
            style={{
              color: '#dc2626',
              fontSize: fontSize.sm,
              marginTop: spacing.md,
            }}
          >
            {error}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
