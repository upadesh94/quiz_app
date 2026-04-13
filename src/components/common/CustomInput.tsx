import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useResponsive } from '../../utils/responsive';

type CustomInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  label?: string;
  secureTextEntry?: boolean;
};

export function CustomInput({ value, onChangeText, placeholder, label, secureTextEntry }: CustomInputProps) {
  const { fontSize, spacing } = useResponsive();

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
            color: '#0f172a',
            fontSize: fontSize.sm,
            fontWeight: '600',
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={{
          borderWidth: 1,
          borderColor: '#93c5fd',
          borderRadius: 14,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          backgroundColor: '#fff',
          color: '#0f172a',
          fontSize: fontSize.base,
        }}
        autoCapitalize="none"
      />
    </View>
  );
}
