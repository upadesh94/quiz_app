import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomCard } from '../../components/common/CustomCard';
import { RootStackParamList } from '../../navigation/types';
import { Quiz } from '../../types/models';
import { QuizService } from '../../services/quiz/QuizService';
import { useResponsive, getGridColumns } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'AvailableQuizzes'>;

export function AvailableQuizzesScreen({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const numColumns = getGridColumns(screenWidth, isTablet);

  useEffect(() => {
    const loadQuizzes = async () => {
      const data = await QuizService.getAvailableQuizzes();
      setQuizzes(data);
    };

    loadQuizzes();
  }, []);

  const renderQuizCard = ({ item: quiz }: { item: Quiz }) => (
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
          title="Start Quiz"
          onPress={() => navigation.navigate('QuizAttempt', { quizId: quiz.id })}
        />
      </CustomCard>
    </View>
  );

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
