import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomCard } from '../../components/common/CustomCard';
import { RootStackParamList } from '../../navigation/types';
import { Quiz } from '../../types/models';
import { QuizService } from '../../services/quiz/QuizService';
import { useResponsive, getGridColumns } from '../../utils/responsive';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCollection, where } from '../../firebase/firestore';
import { CLASS_LEVELS, getSubjectsForClass } from '../../services/utils/Constants';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AvailableQuizzes'>;

export function AvailableQuizzesScreen({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState<Set<string>>(new Set());
  const [selectedClassLevel] = useState<8 | 9 | 10>(user?.classLevel ?? 8);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const numColumns = getGridColumns(screenWidth, isTablet);

  const subjectOptions = useMemo(() => getSubjectsForClass(selectedClassLevel), [selectedClassLevel]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (quiz.classLevel !== selectedClassLevel) {
        return false;
      }

      if (selectedSubject !== 'all' && quiz.subject !== selectedSubject) {
        return false;
      }

      return true;
    });
  }, [quizzes, selectedClassLevel, selectedSubject]);

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

  useEffect(() => {
    const hasSelectedSubject = selectedSubject === 'all' || subjectOptions.some((subject) => subject === selectedSubject);

    if (!hasSelectedSubject) {
      setSelectedSubject('all');
    }
  }, [selectedClassLevel, subjectOptions, selectedSubject]);

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
              color: isDark ? '#FFFFFF' : colors.textPrimary,
            }}
          >
            {quiz.title}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
            Subject: {quiz.subject}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
            Class: {quiz.classLevel}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
            Questions: {quiz.totalQuestions}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.md }}>
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

  const renderHeader = () => (
    <View style={{ paddingBottom: 16 }}>
      <View style={[styles.headerCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : '#eff6ff', borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : '#dbeafe' }]}>
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '800',
            marginBottom: spacing.xs,
            color: isDark ? '#FFFFFF' : '#0f172a',
          }}
        >
          📚 Subject Quizzes
        </Text>
        <Text style={{ fontSize: fontSize.base, color: isDark ? '#cbd5e1' : '#475569', lineHeight: fontSize.base * 1.5 }}>
          Choose your class and subject to see only the quizzes that match the school syllabus.
        </Text>
      </View>

      <View style={[styles.filterCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : '#ffffff', borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : '#e2e8f0', marginBottom: 0 }]}>
        <Text style={[styles.filterLabel, { fontSize: fontSize.sm, marginTop: spacing.md, color: isDark ? '#FFFFFF' : '#0f172a' }]}>Filter by Subject for Class {selectedClassLevel}</Text>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setSelectedSubject('all')}
            style={[
              styles.chip,
              selectedSubject === 'all' 
                ? [styles.chipActive, isDark && { backgroundColor: '#a855f7', borderColor: '#a855f7' }]
                : [styles.chipInactive, isDark && { backgroundColor: 'transparent', borderColor: 'rgba(168, 85, 247, 0.5)' }]
            ]}
          >
            <Text style={[
              selectedSubject === 'all' ? styles.chipTextActive : styles.chipTextInactive,
              isDark && selectedSubject !== 'all' && { color: '#d8b4fe' }
            ]}>All Subjects</Text>
          </Pressable>
          {subjectOptions.map((subject) => (
            <Pressable
              key={subject}
              onPress={() => setSelectedSubject(subject)}
              style={[
                styles.chip,
                selectedSubject === subject
                  ? [styles.chipActive, isDark && { backgroundColor: '#a855f7', borderColor: '#a855f7' }]
                  : [styles.chipInactive, isDark && { backgroundColor: 'transparent', borderColor: 'rgba(168, 85, 247, 0.5)' }]
              ]}
            >
              <Text style={[
                selectedSubject === subject ? styles.chipTextActive : styles.chipTextInactive,
                isDark && selectedSubject !== subject && { color: '#d8b4fe' }
              ]}>{subject}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <Text style={{ fontSize: fontSize.base, color: isDark ? '#94a3b8' : '#666', marginTop: spacing.xl, textAlign: 'center' }}>
      No quizzes available for Class {selectedClassLevel}{selectedSubject !== 'all' ? ` / ${selectedSubject}` : ''}.
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#160629' : '#f9fafb' }}>
      <FlatList
        data={filteredQuizzes}
        renderItem={renderQuizCard}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: containerPadding, paddingBottom: 100, paddingTop: 16 }}
        columnWrapperStyle={numColumns > 1 ? { gap: spacing.sm } : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  headerCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  filterCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  filterLabel: {
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  chipInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#bfdbfe',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactive: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 12,
  },
});
