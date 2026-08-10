import React, { createElement } from 'react';
import { StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type CustomInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  label?: string;
  secureTextEntry?: boolean;
  type?: 'text' | 'date' | 'time' | 'email' | 'number';
};

export function CustomInput({ value, onChangeText, placeholder, label, secureTextEntry, type = 'text' }: CustomInputProps) {
  const { fontSize, spacing } = useResponsive();
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={{
        width: '100%',
        marginBottom: spacing.md,
      }}
    >
      {label ? (
        <Text
          style={{
            color: isDark ? '#d8b4fe' : '#0f172a',
            fontSize: fontSize.sm,
            fontWeight: '600',
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}

      {Platform.OS === 'web' && type === 'date' ? (
        createElement('input', {
          type: 'date',
          value: value,
          onChange: (e: any) => onChangeText(e.target.value),
          placeholder: placeholder,
          style: {
            borderWidth: 1,
            borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#93c5fd',
            borderRadius: 14,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : '#fff',
            color: isDark ? '#FFFFFF' : '#0f172a',
            fontSize: fontSize.base,
            outline: 'none',
            fontFamily: 'inherit',
            width: '100%',
            boxSizing: 'border-box'
          }
        })
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          secureTextEntry={secureTextEntry}
          style={{
            borderWidth: 1,
            borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#93c5fd',
            borderRadius: 14,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            backgroundColor: isDark ? 'rgba(15, 10, 44, 0.88)' : '#fff',
            color: isDark ? '#FFFFFF' : '#0f172a',
            fontSize: fontSize.base,
          }}
          autoCapitalize="none"
        />
      )}
    </View>
  );
}
