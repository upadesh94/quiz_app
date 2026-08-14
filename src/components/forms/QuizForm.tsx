import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';
import { DateTimePickerWrapper } from '../common/DateTimePickerWrapper';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii, shadows } from '../../utils/theme';
import { getSubjectsForClass } from '../../services/utils/Constants';
import { useAppSelector } from '../../hooks/useAppSelector';

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
  
  const [publishOption, setPublishOption] = useState<'draft' | 'publish' | 'schedule'>('publish');
  
  // Launch Presets (including 'custom' for calendar/clock picker)
  const [launchPreset, setLaunchPreset] = useState<'now' | '1h' | 'tomorrow' | 'next-monday' | 'custom'>('now');
  const [customLaunchDate, setCustomLaunchDate] = useState<Date>(new Date());
  
  // Duration Presets (including 'custom' for calendar/clock picker)
  const [durationPreset, setDurationPreset] = useState<'no-limit' | '2h' | '1d' | '3d' | '1w' | 'custom'>('no-limit');
  const [customExpiryDate, setCustomExpiryDate] = useState<Date | null>(null);
  
  const user = useAppSelector((state) => state.auth.user);
  const teacherAssignedSubjects = useMemo(() => {
    if (user?.role === 'teacher' && Array.isArray(user.teachingSubjects) && user.teachingSubjects.length > 0) {
      return user.teachingSubjects;
    }
    return [];
  }, [user]);

  const [error, setError] = useState('');
  const selectedClassLevel = [8, 9, 10].includes(Number(classLevel)) ? (Number(classLevel) as 8 | 9 | 10) : 10;
  const classSubjectPresets = getSubjectsForClass(selectedClassLevel);

  useEffect(() => {
    if (!subject && teacherAssignedSubjects.length > 0) {
      setSubject(teacherAssignedSubjects[0]);
    }
  }, [teacherAssignedSubjects]);

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

  const calculateScheduleDates = (): { launchDate: Date; expiryDate: Date | null } => {
    const now = new Date();
    let launchDate = new Date();

    if (launchPreset === '1h') {
      launchDate = new Date(now.getTime() + 60 * 60 * 1000);
    } else if (launchPreset === 'tomorrow') {
      launchDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    } else if (launchPreset === 'next-monday') {
      const resultDate = new Date();
      resultDate.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
      resultDate.setHours(9, 0, 0, 0);
      launchDate = resultDate;
    } else if (launchPreset === 'custom') {
      launchDate = customLaunchDate || now;
    }

    let expiryDate: Date | null = null;
    if (durationPreset === 'custom') {
      expiryDate = customExpiryDate;
    } else if (durationPreset !== 'no-limit') {
      let durationMs = 0;
      if (durationPreset === '2h') durationMs = 2 * 60 * 60 * 1000;
      else if (durationPreset === '1d') durationMs = 24 * 60 * 60 * 1000;
      else if (durationPreset === '3d') durationMs = 3 * 24 * 60 * 60 * 1000;
      else if (durationPreset === '1w') durationMs = 7 * 24 * 60 * 60 * 1000;

      expiryDate = new Date(launchDate.getTime() + durationMs);
    }

    return { launchDate, expiryDate };
  };

  const getCalculatedScheduleText = () => {
    const { launchDate, expiryDate } = calculateScheduleDates();
    const launchStr = launchDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    if (!expiryDate) {
      return `Quiz will launch on ${launchStr} and remain open indefinitely.`;
    }

    const expiryStr = expiryDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `Quiz will launch on ${launchStr} and automatically close on ${expiryStr}.`;
  };

  const buildPayload = (): QuizSubmitPayload | null => {
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

    let availableFrom: string | undefined;
    let availableUntil: string | undefined;

    if (publishOption === 'schedule') {
      const { launchDate, expiryDate } = calculateScheduleDates();
      availableFrom = launchDate.toISOString();
      if (expiryDate) {
        if (expiryDate.getTime() <= launchDate.getTime()) {
          setError('Expiry time must be after the launch time.');
          return null;
        }
        availableUntil = expiryDate.toISOString();
      }
    }

    setError('');

    const isPublished = publishOption !== 'draft';

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
      status: isPublished ? 'published' : 'draft',
      isPublished,
      availableFrom,
      availableUntil,
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();
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

  const handleDifficultyChange = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    if (level === 'easy') {
      setPassPercentage('50');
    } else if (level === 'medium') {
      setPassPercentage('40');
    } else if (level === 'hard') {
      setPassPercentage('33');
    }
  };

  return (
    <View>
      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Template Presets</Text>
        <Text style={[styles.quickHelp, { fontSize: fontSize.sm, marginBottom: spacing.sm }, isDark && { color: '#cbd5e1' }]}>Prefill defaults instantly based on your quiz type.</Text>
        <View style={styles.row}>
          <Pressable style={[styles.chip, isDark ? styles.chipInactiveDark : styles.chipInactiveLight]} onPress={() => applyTemplate('quick-test')}>
            <Text style={isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight}>⚡ Quick Test</Text>
          </Pressable>
          <Pressable style={[styles.chip, isDark ? styles.chipInactiveDark : styles.chipInactiveLight]} onPress={() => applyTemplate('exam-mode')}>
            <Text style={isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight}>📝 Exam Mode</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Basic Information</Text>
        <CustomInput value={title} onChangeText={setTitle} placeholder="e.g. Quadratic Equations Quiz" label="Quiz Title" />
        <CustomInput value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" label="Subject" />
        {teacherAssignedSubjects.length > 0 && (
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={[styles.fieldLabel, { fontSize: fontSize.xs, color: isDark ? '#a78bfa' : '#6366f1', fontWeight: '800', fontFamily: 'monospace', marginBottom: 6 }]}>
              YOUR ASSIGNED TEACHING SUBJECTS
            </Text>
            <View style={[styles.row, { marginBottom: spacing.sm }]}>
              {teacherAssignedSubjects.map((preset) => (
                <Pressable
                  key={`assigned-${preset}`}
                  onPress={() => setSubject(preset)}
                  style={[
                    styles.chip,
                    { borderColor: '#6366f1' },
                    subject === preset
                      ? { backgroundColor: '#6366f1' }
                      : (isDark ? { backgroundColor: 'rgba(99, 102, 241, 0.15)' } : { backgroundColor: '#e0e7ff' })
                  ]}
                >
                  <Text style={{
                    color: subject === preset ? '#ffffff' : (isDark ? '#a5b4fc' : '#4338ca'),
                    fontWeight: '800',
                    fontSize: fontSize.xs,
                  }}>
                    {preset} [ASSIGNED]
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.fieldLabel, { fontSize: fontSize.xs, color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontFamily: 'monospace', marginBottom: 6 }]}>
          {teacherAssignedSubjects.length > 0 ? 'ALL CLASS SUBJECTS' : 'QUICK SELECT SUBJECT'}
        </Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}>
          {classSubjectPresets.map((preset) => (
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
          placeholder="What should students know before starting?"
          label="Description"
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Target Class & Duration</Text>
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

        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }, isDark && { color: '#a78bfa' }]}>Time Limit (Minutes)</Text>
        <View style={[styles.row, { marginBottom: spacing.sm }]}>
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
          label="Or Custom Time Limit"
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Scoring & Difficulty</Text>
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm }, isDark && { color: '#a78bfa' }]}>Difficulty Level</Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}> 
          {['easy', 'medium', 'hard'].map((value) => (
            <Pressable
              key={value}
              onPress={() => handleDifficultyChange(value as 'easy' | 'medium' | 'hard')}
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
              label="Passing Score (%)"
            />
          </View>
          <View style={styles.halfField}>
            <CustomInput
              value={negativeMarking}
              onChangeText={setNegativeMarking}
              placeholder="0"
              label="Negative Marks/Incorrect"
            />
          </View>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Publish Settings & Scheduling</Text>
        
        <Text style={[styles.fieldLabel, { fontSize: fontSize.sm, marginBottom: spacing.xs }, isDark && { color: '#a78bfa' }]}>Publish Options</Text>
        <View style={[styles.row, { marginBottom: spacing.md }]}>
          {(['draft', 'publish', 'schedule'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setPublishOption(option)}
              style={[
                styles.chip,
                publishOption === option
                  ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                  : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
              ]}
            >
              <Text style={
                publishOption === option
                  ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                  : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
              }>
                {option === 'draft' && '📁 Save Draft'}
                {option === 'publish' && '🚀 Publish Now'}
                {option === 'schedule' && '📅 Schedule Quiz'}
              </Text>
            </Pressable>
          ))}
        </View>

        {publishOption === 'schedule' && (
          <View style={{ marginBottom: spacing.md, gap: spacing.md }}>
            <View>
              <Text style={[styles.fieldLabel, { fontSize: fontSize.sm, marginBottom: spacing.xs }, isDark && { color: '#a78bfa' }]}>When should this quiz launch?</Text>
              <View style={[styles.row, { marginBottom: spacing.xs }]}>
                {(['now', '1h', 'tomorrow', 'next-monday', 'custom'] as const).map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => setLaunchPreset(preset)}
                    style={[
                      styles.chip,
                      launchPreset === preset
                        ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                        : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
                    ]}
                  >
                    <Text style={
                      launchPreset === preset
                        ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                        : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                    }>
                      {preset === 'now' && 'Immediately'}
                      {preset === '1h' && 'In 1 Hour'}
                      {preset === 'tomorrow' && 'Tomorrow Morning'}
                      {preset === 'next-monday' && 'Next Monday'}
                      {preset === 'custom' && '📅 Pick Date/Time'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {launchPreset === 'custom' && (
                <View style={{ marginTop: spacing.xs }}>
                   <DateTimePickerWrapper
                     label="Launch Time"
                     value={customLaunchDate}
                     onChange={setCustomLaunchDate}
                     isDark={isDark}
                     colors={colors}
                   />
                </View>
              )}
            </View>

            <View style={{ marginTop: spacing.xs }}>
              <Text style={[styles.fieldLabel, { fontSize: fontSize.sm, marginBottom: spacing.xs }, isDark && { color: '#a78bfa' }]}>How long should it remain active?</Text>
              <View style={[styles.row, { marginBottom: spacing.xs }]}>
                {(['no-limit', '2h', '1d', '3d', '1w', 'custom'] as const).map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => setDurationPreset(preset)}
                    style={[
                      styles.chip,
                      durationPreset === preset
                        ? (isDark ? styles.chipActiveDark : styles.chipActiveLight)
                        : (isDark ? styles.chipInactiveDark : styles.chipInactiveLight)
                    ]}
                  >
                    <Text style={
                      durationPreset === preset
                        ? (isDark ? styles.chipTextActiveDark : styles.chipTextActiveLight)
                        : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight)
                    }>
                      {preset === 'no-limit' && 'No Limit'}
                      {preset === '2h' && '2 Hours'}
                      {preset === '1d' && '1 Day'}
                      {preset === '3d' && '3 Days'}
                      {preset === '1w' && '1 Week'}
                      {preset === 'custom' && '⏰ Set Expiry'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {durationPreset === 'custom' && (
                <View style={{ marginTop: spacing.xs }}>
                   <DateTimePickerWrapper
                     label="Expiry Time"
                     value={customExpiryDate || new Date()}
                     onChange={setCustomExpiryDate}
                     isDark={isDark}
                     colors={colors}
                   />
                </View>
              )}
            </View>

            <View style={[styles.livePreviewCard, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.1)' : '#f0fdf4', borderColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#bbf7d0' }]}>
               <Text style={{color: isDark ? '#a7f3d0' : '#166534', fontSize: 13, fontWeight: '600'}}>{getCalculatedScheduleText()}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : colors.card, borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe' }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }, isDark && { color: '#FFFFFF' }]}>Advanced Configurations</Text>
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
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <CustomButton
        title={
          publishOption === 'draft'
            ? 'Save as Draft'
            : publishOption === 'schedule'
            ? 'Schedule Quiz'
            : 'Create and Publish Quiz'
        }
        onPress={handleSubmit}
        disabled={!canCreateQuiz}
        variant={publishOption === 'draft' ? 'secondary' : 'primary'}
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
  livePreviewCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10
  }
});
