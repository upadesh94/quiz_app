import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomInput } from '../common/CustomInput';
import { CustomButton } from '../common/CustomButton';
import { colors, radii, shadows } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';

type QuestionFormProps = {
  onSubmit: (payload: { question: string; options: string[]; correctAnswer: string; marks: number }) => void;
};

export function QuestionForm({ onSubmit }: QuestionFormProps) {
  const { spacing, fontSize } = useResponsive();
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [marks, setMarks] = useState('1');
  const [pasteInput, setPasteInput] = useState('');
  const [error, setError] = useState('');

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionValues = [optionA, optionB, optionC, optionD];

  const setOptionByIndex = (index: number, value: string) => {
    if (index === 0) {
      setOptionA(value);
      return;
    }
    if (index === 1) {
      setOptionB(value);
      return;
    }
    if (index === 2) {
      setOptionC(value);
      return;
    }
    setOptionD(value);
  };

  const clearForm = () => {
    setQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('');
    setMarks('1');
    setError('');
  };

  const parsePastedQuestion = () => {
    const lines = pasteInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError('Paste content first, then tap Parse Pasted Content.');
      return;
    }

    let detectedQuestion = '';
    const parsedOptions = ['', '', '', ''];
    let detectedAnswer = '';
    let detectedMarks = marks;

    lines.forEach((line) => {
      const normalized = line.replace(/^\d+[.)-]\s*/, '').trim();
      const optionMatch = normalized.match(/^([A-Da-d])[.):-]\s*(.+)$/);
      const answerMatch = normalized.match(/^(answer|correct answer)\s*[:=-]\s*([A-Da-d]|.+)$/i);
      const marksMatch = normalized.match(/^marks\s*[:=-]\s*(\d+)$/i);

      if (optionMatch) {
        const index = optionMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (index >= 0 && index <= 3) {
          parsedOptions[index] = optionMatch[2].trim();
        }
        return;
      }

      if (answerMatch) {
        const answerValue = answerMatch[2].trim();
        if (/^[A-Da-d]$/.test(answerValue)) {
          const idx = answerValue.toUpperCase().charCodeAt(0) - 65;
          detectedAnswer = parsedOptions[idx] || '';
        } else {
          detectedAnswer = answerValue;
        }
        return;
      }

      if (marksMatch) {
        detectedMarks = marksMatch[1];
        return;
      }

      if (!detectedQuestion) {
        detectedQuestion = normalized;
      }
    });

    if (!detectedQuestion) {
      detectedQuestion = lines[0];
    }

    setQuestion(detectedQuestion);
    parsedOptions.forEach((value, index) => setOptionByIndex(index, value));
    setMarks(detectedMarks);

    if (detectedAnswer) {
      setCorrectAnswer(detectedAnswer);
    }

    setError('');
  };

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    const cleanedOptions = optionValues.map((value) => value.trim());
    const validOptions = cleanedOptions.filter((value) => value.length > 0);
    const parsedMarks = Number(marks);

    if (!trimmedQuestion) {
      setError('Please enter a question.');
      return;
    }

    if (validOptions.length < 2) {
      setError('Please provide at least 2 options.');
      return;
    }

    if (!correctAnswer.trim()) {
      setError('Please select the correct answer.');
      return;
    }

    if (!validOptions.includes(correctAnswer.trim())) {
      setError('Correct answer must match one of the options.');
      return;
    }

    if (!Number.isFinite(parsedMarks) || parsedMarks < 1 || parsedMarks > 20) {
      setError('Marks should be between 1 and 20.');
      return;
    }

    setError('');
    onSubmit({
      question: trimmedQuestion,
      options: cleanedOptions,
      correctAnswer: correctAnswer.trim(),
      marks: parsedMarks,
    });

    clearForm();
    setPasteInput('');
  };

  return (
    <View>
      <View style={[styles.sectionCard, { marginBottom: spacing.md }]}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.base }]}>Quick Paste (Copy from anywhere)</Text>
        <Text style={[styles.helperText, { fontSize: fontSize.sm }]}>Example format: question on first line, options as A) B) C) D), then Answer: B</Text>
        <TextInput
          value={pasteInput}
          onChangeText={setPasteInput}
          multiline
          numberOfLines={6}
          placeholder={"What is 2 + 2?\nA) 3\nB) 4\nC) 5\nD) 6\nAnswer: B\nMarks: 2"}
          textAlignVertical="top"
          style={[styles.pasteInput, { marginTop: spacing.sm }]}
        />
        <CustomButton title="Parse Pasted Content" variant="secondary" onPress={parsePastedQuestion} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.base }]}>Question Details</Text>
        <CustomInput value={question} onChangeText={setQuestion} placeholder="Enter question" label="Question" />
        <CustomInput value={optionA} onChangeText={setOptionA} placeholder="Option A" label="Option A" />
        <CustomInput value={optionB} onChangeText={setOptionB} placeholder="Option B" label="Option B" />
        <CustomInput value={optionC} onChangeText={setOptionC} placeholder="Option C" label="Option C" />
        <CustomInput value={optionD} onChangeText={setOptionD} placeholder="Option D" label="Option D" />

        <Text style={styles.correctAnswerLabel}>Select Correct Answer</Text>
        <View style={styles.answerRow}>
          {optionValues.map((option, index) => {
            const value = option.trim();
            const selected = value.length > 0 && correctAnswer === value;
            return (
              <Pressable
                key={optionLabels[index]}
                onPress={() => {
                  if (value.length > 0) {
                    setCorrectAnswer(value);
                  }
                }}
                style={[styles.answerChip, selected ? styles.answerChipSelected : styles.answerChipDefault]}
              >
                <Text style={selected ? styles.answerChipTextSelected : styles.answerChipTextDefault}>
                  {optionLabels[index]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <CustomInput value={correctAnswer} onChangeText={setCorrectAnswer} placeholder="Correct answer text" label="Correct Answer" />
        <CustomInput value={marks} onChangeText={setMarks} placeholder="1" label="Marks (1-20)" />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <CustomButton title="Add Question" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadows.soft,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperText: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  pasteInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  correctAnswerLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  answerChip: {
    minWidth: 42,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
  },
  answerChipDefault: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  answerChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: colors.primary,
  },
  answerChipTextDefault: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  answerChipTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },
});
