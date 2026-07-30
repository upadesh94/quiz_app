import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomCard } from '../../components/common/CustomCard';
import { RootStackParamList } from '../../navigation/types';
import { Quiz } from '../../types/models';
import { QuizService } from '../../services/quiz/QuizService';
import { useResponsive, getGridColumns } from '../../utils/responsive';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCollection, where } from '../../firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'AvailableQuizzes'>;

export function AvailableQuizzesScreen({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const user = useAppSelector((state) => state.auth.user);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState<Set<string>>(new Set());
  const numColumns = getGridColumns(screenWidth, isTablet);

  useEffect(() => {
    const loadQuizzes = async () => {
      const data = await QuizService.getAvailableQuizzes();
      setQuizzes(data);

      if (user?.id) {
        const attempts = await getCollection<{ quizId: string }>('attempts', [where('studentId', '==', user?.id)]);
        const ids = new Set(attempts.map((a) => a.quizId));
        setAttemptedQuizIds(ids);
      }
    };

    loadQuizzes();
  }, [user?.id]);

  const renderQuizCard = ({ item: quiz }: { item: Quiz }) => {
    let buttonTitle = 'Start Quiz';
    let disabled = false;
    
    if (attemptedQuizIds.has(quiz.id)) {
      buttonTitle = 'Already Attempted';
      disabled = true;
    } else {
      const now = new Date().getTime();
      if (quiz.availableFrom && now < new Date(quiz.availableFrom).getTime()) {
        buttonTitle = 'Available Later';
        disabled = true;
      } else if (quiz.availableUntil && now > new Date(quiz.availableUntil).getTime()) {
        buttonTitle = 'Expired';
        disabled = true;
      }
    }

    return (
      <View style={{ flex: 1 / numColumns, padding: spacing.sm }}>
        <CustomCard>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '600',
              marginBottom: spacing.sm,
            }}
          >
            {quiz.title}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.xs }}>
            Subject: {quiz.subject}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.xs }}>
            Class: {quiz.classLevel}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.xs }}>
            Questions: {quiz.totalQuestions}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: '#334155', marginBottom: spacing.md }}>
            Duration: {quiz.timeLimitMinutes} min
          </Text>
          <CustomButton
            title={buttonTitle}
            disabled={disabled}
            variant={disabled ? 'secondary' : 'primary'}
            onPress={() => navigation.navigate('QuizAttempt', { quizId: quiz.id })}
          />
        </CustomCard>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
      <Text
        style={{
          fontSize: fontSize['2xl'],
          fontWeight: '700',
          marginBottom: spacing.lg,
        }}
      >
        📚 Available Quizzes
      </Text>
      {quizzes.length === 0 ? (
        <Text style={{ fontSize: fontSize.base, color: '#666', marginTop: spacing.xl }}>
          No quizzes available yet.
        </Text>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuizCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          columnWrapperStyle={numColumns > 1 ? { gap: spacing.sm } : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
  },
});
