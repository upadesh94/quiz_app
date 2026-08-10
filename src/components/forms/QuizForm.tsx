import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii, shadows } from '../../utils/theme';
import { getSubjectsForClass } from '../../services/utils/Constants';

type QuizFormProps = {
  onSubmit: (payload: {
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
    availableFrom?: string;
    availableUntil?: string;
  }) => void;
};

type QuizSubmitPayload = Parameters<QuizFormProps['onSubmit']>[0];

export function QuizForm({ onSubmit }: QuizFormProps) {
  const { fontSize, spacing } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('10');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [passPercentage, setPassPercentage] = useState('40');
  const [negativeMarking, setNegativeMarking] = useState('0');
  const [instructions, setInstructions] = useState('');
  const [tags, setTags] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [allowReview, setAllowReview] = useState(true);
  const [publishNow, setPublishNow] = useState(true);
  const [limitToToday, setLimitToToday] = useState(false);
  const [error, setError] = useState('');
  const selectedClassLevel = [8, 9, 10].includes(Number(classLevel)) ? (Number(classLevel) as 8 | 9 | 10) : 10;
  const subjectPresets = getSubjectsForClass(selectedClassLevel);

  const applyTemplate = (template: 'quick-test' | 'exam-mode') => {
    if (template === 'quick-test') {
      setTimeLimitMinutes('20');
      setDifficulty('easy');
      setPassPercentage('40');
      setNegativeMarking('0');
      setShuffleQuestions(false);
      setAllowReview(true);
      setInstructions('Read each question carefully. You can review your answers before submitting.');
      return;
    }

    setTimeLimitMinutes('45');
    setDifficulty('medium');
    setPassPercentage('40');
    setNegativeMarking('1');
    setShuffleQuestions(true);
    setAllowReview(false);
    setInstructions('No external help allowed. Once submitted, answers cannot be changed.');
  };

  const toggleChip = (value: string, setter: (value: string) => void) => setter(value);

  const buildPayload = (overrideIsPublished?: boolean): QuizSubmitPayload | null => {
    const trimmedTitle = title.trim();
    const trimmedSubject = subject.trim();
    const parsedTimeLimit = Number(timeLimitMinutes);
    const parsedPass = Number(passPercentage);
    const parsedNegative = Number(negativeMarking);

    if (!trimmedTitle || !trimmedSubject) {
      setError('Please fill quiz title and subject.');
      return null;
    }

    if (![8, 9, 10].includes(Number(classLevel))) {
      setError('Class level must be 8, 9, or 10.');
      return null;
    }

    if (!Number.isFinite(parsedTimeLimit) || parsedTimeLimit < 1 || parsedTimeLimit > 240) {
      setError('Time limit should be between 1 and 240 minutes.');
      return null;
    }

    if (!Number.isFinite(parsedPass) || parsedPass < 0 || parsedPass > 100) {
      setError('Pass percentage should be between 0 and 100.');
      return null;
    }

    if (!Number.isFinite(parsedNegative) || parsedNegative < 0 || parsedNegative > 10) {
      setError('Negative marking should be between 0 and 10.');
      return null;
    }

    setError('');

    const shouldPublish = overrideIsPublished ?? publishNow;

    return {
      title: trimmedTitle,
      subject: trimmedSubject,
      description: description.trim(),
      classLevel: Number(classLevel) as 8 | 9 | 10,
      timeLimitMinutes: parsedTimeLimit,
      difficulty,
      passPercentage: parsedPass,
      negativeMarking: parsedNegative,
      instructions: instructions.trim(),
      shuffleQuestions,
      allowReview,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      status: shouldPublish ? 'published' : 'draft',
      isPublished: shouldPublish,
      availableFrom: limitToToday ? new Date(new Date().setHours(0, 0, 0, 0)).toISOString() : undefined,
      availableUntil: limitToToday ? new Date(new Date().setHours(23, 59, 59, 999)).toISOString() : undefined,
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();
    if (!payload) return;
    onSubmit(payload);
  };

  const handlePublish = () => {
    const payload = buildPayload(true);
    if (!payload) return;
    onSubmit(payload);
  };

  const canCreateQuiz = title.trim().length > 0 && subject.trim().length > 0;

  const handleClassLevelChange = (value: string) => {
    setClassLevel(value);
    const nextClassLevel = Number(value) as 8 | 9 | 10;
    const subjectsForClass = getSubjectsForClass(nextClassLevel);

    if (subject && !subjectsForClass.includes(subject as never)) {
      setSubject('');
    }
  };

  return (
    <View>
      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Quick Setup</Text>
        <Text style={[styles.quickHelp, { fontSize: fontSize.sm, marginBottom: spacing.sm }, isDark && { color: '#cbd5e1' }]}>Choose a template to prefill settings and create faster.</Text>
        <View style={styles.row}>
          <Pressable style={[styles.chip, isDark ? styles.chipInactiveDark : styles.chipInactiveLight]} onPress={() => applyTemplate('quick-test')}>
            <Text style={isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight}>Quick Test</Text>
          </Pressable>
          <Pressable style={[styles.chip, isDark ? styles.chipInactiveDark : styles.chipInactiveLight]} onPress={() => applyTemplate('exam-mode')}>
            <Text style={isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight}>Exam Mode</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Basic Details</Text>
        <CustomInput value={title} onChangeText={setTitle} placeholder="e.g. Algebra Unit Test" label="Quiz Title" />
        <CustomInput value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" label="Subject" />
        <View style={[styles.row, { marginBottom: spacing.md }]}>
          {subjectPresets.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setSubject(preset)}
              style={[
                styles.chip,
                subject === preset
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={
                subject === preset
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>{preset}</Text>
            </Pressable>
          ))}
        </View>
        <CustomInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short summary for students"
          label="Description"
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Class and Duration</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }, isDark && { color: '#a78bfa' }]}>Class Level</Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}> 
          {['8', '9', '10'].map((value) => (
            <Pressable
              key={value}
              onPress={() => toggleChip(value, handleClassLevelChange)}
              style={[
                styles.chip,
                classLevel === value
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={
                classLevel === value
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>Class {value}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }, isDark && { color: '#a78bfa' }]}>Time Limit</Text>
        <View style={styles.row}>
          {[10, 20, 30, 45, 60].map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => setTimeLimitMinutes(String(minutes))}
              style={[
                styles.chip,
                timeLimitMinutes === String(minutes)
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={
                timeLimitMinutes === String(minutes)
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>
                {minutes}m
              </Text>
            </Pressable>
          ))}
        </View>

        <CustomInput
          value={timeLimitMinutes}
          onChangeText={setTimeLimitMinutes}
          placeholder="Custom minutes (1-240)"
          label="Custom Time Limit"
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Difficulty and Scoring</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }, isDark && { color: '#a78bfa' }]}>Difficulty</Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}> 
          {['easy', 'medium', 'hard'].map((value) => (
            <Pressable
              key={value}
              onPress={() => setDifficulty(value as 'easy' | 'medium' | 'hard')}
              style={[
                styles.chip,
                difficulty === value
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={
                difficulty === value
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.rowWrap}>
          <View style={styles.halfField}>
            <CustomInput
              value={passPercentage}
              onChangeText={setPassPercentage}
              placeholder="40"
              label="Pass %"
            />
          </View>
          <View style={styles.halfField}>
            <CustomInput
              value={negativeMarking}
              onChangeText={setNegativeMarking}
              placeholder="0"
              label="Negative Marks"
            />
          </View>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Advanced Options</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }, isDark && { color: '#a78bfa' }]}>Instructions for Students</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Add quiz rules, allowed tools, or attempt guidance"
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          style={[styles.multilineInput, {
            backgroundColor: isDark ? 'rgba(15, 10, 44, 0.5)' : '#ffffff',
            borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#93c5fd',
            color: isDark ? '#FFFFFF' : '#0f172a'
          }]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <CustomInput
          value={tags}
          onChangeText={setTags}
          placeholder="algebra, chapter-2, revision"
          label="Tags (comma separated)"
        />

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, isDark && { color: '#cbd5e1' }]}>Shuffle question order</Text>
          <Pressable
            onPress={() => setShuffleQuestions((prev) => !prev)}
            style={[styles.toggleButton, shuffleQuestions ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{shuffleQuestions ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, isDark && { color: '#cbd5e1' }]}>Allow answer review</Text>
          <Pressable
            onPress={() => setAllowReview((prev) => !prev)}
            style={[styles.toggleButton, allowReview ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{allowReview ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, isDark && { color: '#cbd5e1' }]}>Publish immediately</Text>
          <Pressable
            onPress={() => setPublishNow((prev) => !prev)}
            style={[styles.toggleButton, publishNow ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{publishNow ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, isDark && { color: '#cbd5e1' }]}>Limit to today only</Text>
          <Pressable
            onPress={() => setLimitToToday((prev) => !prev)}
            style={[styles.toggleButton, limitToToday ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{limitToToday ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <CustomButton
        title={publishNow ? 'Create and Publish Quiz' : 'Save as Draft'}
        onPress={handleSubmit}
        disabled={!canCreateQuiz}
        variant={publishNow ? 'primary' : 'secondary'}
      />

      <CustomButton
        title="Publish Quiz"
        onPress={handlePublish}
        disabled={!canCreateQuiz}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    marginBottom: 14,
    ...shadows.soft,
  },
  sectionTitle: {
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 10,
  },
  quickHelp: {
    color: '#64748b',
  },
  fieldLabel: {
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  halfField: {
    flex: 1,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipActiveLight: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  chipInactiveLight: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  chipTextActiveLight: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactiveLight: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  chipActiveDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: '#a855f7',
  },
  chipInactiveDark: {
    backgroundColor: 'rgba(15, 10, 44, 0.5)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  chipTextActiveDark: {
    color: '#f3e8ff',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactiveDark: {
    color: '#c4b5fd',
    fontWeight: '600',
    fontSize: 12,
  },
  multilineInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  switchText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 13,
  },
  toggleButton: {
    minWidth: 56,
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
  },
  toggleOff: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
  },
  toggleLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 13,
  },
});
