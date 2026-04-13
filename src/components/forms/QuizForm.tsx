import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

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
  }) => void;
};

type QuizSubmitPayload = Parameters<QuizFormProps['onSubmit']>[0];

export function QuizForm({ onSubmit }: QuizFormProps) {
  const { fontSize, spacing } = useResponsive();
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
  const [error, setError] = useState('');
  const subjectPresets = ['Mathematics', 'Science', 'English', 'Social Science'];

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

  return (
    <View>
      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>Quick Setup</Text>
        <Text style={[styles.quickHelp, { fontSize: fontSize.sm, marginBottom: spacing.sm }]}>Choose a template to prefill settings and create faster.</Text>
        <View style={styles.row}>
          <Pressable style={[styles.chip, styles.chipInactive]} onPress={() => applyTemplate('quick-test')}>
            <Text style={styles.chipTextInactive}>Quick Test</Text>
          </Pressable>
          <Pressable style={[styles.chip, styles.chipInactive]} onPress={() => applyTemplate('exam-mode')}>
            <Text style={styles.chipTextInactive}>Exam Mode</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>Basic Details</Text>
        <CustomInput value={title} onChangeText={setTitle} placeholder="e.g. Algebra Unit Test" label="Quiz Title" />
        <CustomInput value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" label="Subject" />
        <View style={[styles.row, { marginBottom: spacing.md }]}>
          {subjectPresets.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setSubject(preset)}
              style={[styles.chip, subject === preset ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={subject === preset ? styles.chipTextActive : styles.chipTextInactive}>{preset}</Text>
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

      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>Class and Duration</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }]}>Class Level</Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}> 
          {['8', '9', '10'].map((value) => (
            <Pressable
              key={value}
              onPress={() => toggleChip(value, setClassLevel)}
              style={[styles.chip, classLevel === value ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={classLevel === value ? styles.chipTextActive : styles.chipTextInactive}>Class {value}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }]}>Time Limit</Text>
        <View style={styles.row}>
          {[10, 20, 30, 45, 60].map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => setTimeLimitMinutes(String(minutes))}
              style={[
                styles.chip,
                timeLimitMinutes === String(minutes) ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text style={timeLimitMinutes === String(minutes) ? styles.chipTextActive : styles.chipTextInactive}>
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

      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>Difficulty and Scoring</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }]}>Difficulty</Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}> 
          {['easy', 'medium', 'hard'].map((value) => (
            <Pressable
              key={value}
              onPress={() => setDifficulty(value as 'easy' | 'medium' | 'hard')}
              style={[styles.chip, difficulty === value ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={difficulty === value ? styles.chipTextActive : styles.chipTextInactive}>
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

      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>Advanced Options</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }]}>Instructions for Students</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Add quiz rules, allowed tools, or attempt guidance"
          style={styles.multilineInput}
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
          <Text style={styles.switchText}>Shuffle question order</Text>
          <Pressable
            onPress={() => setShuffleQuestions((prev) => !prev)}
            style={[styles.toggleButton, shuffleQuestions ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{shuffleQuestions ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Allow answer review</Text>
          <Pressable
            onPress={() => setAllowReview((prev) => !prev)}
            style={[styles.toggleButton, allowReview ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{allowReview ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Publish immediately</Text>
          <Pressable
            onPress={() => setPublishNow((prev) => !prev)}
            style={[styles.toggleButton, publishNow ? styles.toggleOn : styles.toggleOff]}
          >
            <Text style={styles.toggleLabel}>{publishNow ? 'ON' : 'OFF'}</Text>
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
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    marginBottom: 14,
    ...shadows.soft,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 10,
  },
  quickHelp: {
    color: colors.textSecondary,
  },
  fieldLabel: {
    color: colors.primary,
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
  chipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  chipInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextInactive: {
    color: '#334155',
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
    color: colors.textPrimary,
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
    color: colors.error,
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 13,
  },
});
