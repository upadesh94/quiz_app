import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

type OptionSelectorProps = {
  options: string[];
  selectedOption?: string;
  onSelect: (option: string) => void;
};

export function OptionSelector({ options, selectedOption, onSelect }: OptionSelectorProps) {
  const { fontSize, spacing } = useResponsive();
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <View>
      {options.map((option, index) => {
        const selected = selectedOption === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              {
                padding: spacing.md,
                marginBottom: spacing.md,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.optionBadge,
                  selected ? styles.optionBadgeSelected : null,
                ]}
              >
                <Text style={[styles.optionBadgeText, selected ? styles.optionBadgeTextSelected : null]}>
                  {optionLabels[index] ?? `${index + 1}`}
                </Text>
              </View>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: fontSize.base,
                    fontWeight: selected ? '700' : '500',
                  },
                ]}
              >
                {option}
              </Text>
              {selected ? <Text style={styles.check}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    ...shadows.soft,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  optionBadgeSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: colors.primary,
  },
  optionBadgeText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  optionBadgeTextSelected: {
    color: colors.primary,
  },
  text: {
    color: colors.textPrimary,
    flex: 1,
  },
  check: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
});
