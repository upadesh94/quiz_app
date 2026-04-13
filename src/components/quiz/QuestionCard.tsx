import React from 'react';
import { Text, View } from 'react-native';
import { CustomCard } from '../common/CustomCard';
import { OptionSelector } from './OptionSelector';
import { useResponsive } from '../../utils/responsive';
import { colors } from '../../utils/theme';

type QuestionCardProps = {
  question: string;
  options: string[];
  selectedOption?: string;
  onSelect: (option: string) => void;
};

export function QuestionCard({ question, options, selectedOption, onSelect }: QuestionCardProps) {
  const { fontSize, spacing } = useResponsive();

  return (
    <CustomCard>
      <View
        style={{
          alignSelf: 'flex-start',
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 999,
          backgroundColor: '#DBEAFE',
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fontSize.sm }}>Question</Text>
      </View>
      <Text
        style={{
          fontWeight: '700',
          marginBottom: spacing.lg,
          fontSize: fontSize.lg,
          color: colors.textPrimary,
          lineHeight: fontSize.lg * 1.4,
        }}
      >
        {question}
      </Text>
      <OptionSelector options={options} selectedOption={selectedOption} onSelect={onSelect} />
    </CustomCard>
  );
}