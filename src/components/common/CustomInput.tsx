import React, { useState, createElement } from 'react';
import { StyleSheet, Text, TextInput, View, Platform, ViewStyle, Pressable } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme, radii, touchTargets } from '../../utils/theme';

export type SelectOption = {
  label: string;
  value: string | number;
};

export type CustomInputProps = {
  value: string | number;
  onChangeText: (value: string) => void;
  placeholder: string;
  label?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  type?: 'text' | 'date' | 'time' | 'email' | 'number' | 'password' | 'textarea' | 'select';
  options?: SelectOption[];
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

export function CustomInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  secureTextEntry,
  type = 'text',
  options = [],
  multiline = false,
  numberOfLines = 3,
  disabled = false,
  style,
}: CustomInputProps) {
  const { fontSize, spacing, inputHeight } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password' || secureTextEntry;
  const isTextArea = type === 'textarea' || multiline;
  const hasError = !!error;

  const getBorderColor = () => {
    if (hasError) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const renderContent = () => {
    if (Platform.OS === 'web' && type === 'date') {
      return createElement('input', {
        type: 'date',
        value: String(value || ''),
        disabled,
        onChange: (e: any) => onChangeText(e.target.value),
        placeholder: placeholder,
        style: {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: getBorderColor(),
          borderRadius: radii.md,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          backgroundColor: disabled ? (isDark ? '#0F172A' : '#F1F5F9') : colors.card,
          color: colors.textPrimary,
          fontSize: fontSize.base,
          outline: 'none',
          fontFamily: 'inherit',
          width: '100%',
          minHeight: touchTargets.minHeight,
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
        },
      });
    }

    if (Platform.OS === 'web' && type === 'select') {
      return createElement(
        'select',
        {
          value: String(value || ''),
          disabled,
          onChange: (e: any) => onChangeText(e.target.value),
          style: {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: getBorderColor(),
            borderRadius: radii.md,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            backgroundColor: disabled ? (isDark ? '#0F172A' : '#F1F5F9') : colors.card,
            color: colors.textPrimary,
            fontSize: fontSize.base,
            outline: 'none',
            fontFamily: 'inherit',
            width: '100%',
            minHeight: touchTargets.minHeight,
            boxSizing: 'border-box',
            opacity: disabled ? 0.6 : 1,
          },
        },
        [
          createElement('option', { key: '', value: '', disabled: true }, placeholder),
          ...options.map((opt) =>
            createElement('option', { key: String(opt.value), value: String(opt.value) }, opt.label)
          ),
        ]
      );
    }

    return (
      <View style={styles.inputContainer}>
        <TextInput
          value={String(value ?? '')}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          editable={!disabled}
          multiline={isTextArea}
          numberOfLines={isTextArea ? numberOfLines : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default'}
          style={[
            styles.input,
            {
              borderColor: getBorderColor(),
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: isTextArea ? spacing.sm : 0,
              backgroundColor: disabled ? (isDark ? '#0F172A' : '#F1F5F9') : colors.card,
              color: colors.textPrimary,
              fontSize: fontSize.base,
              minHeight: isTextArea ? numberOfLines * 24 + 16 : Math.max(inputHeight, touchTargets.minHeight),
            },
            isPassword && { paddingRight: 48 },
            disabled && { opacity: 0.6 },
          ]}
          autoCapitalize="none"
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '600' }}>
              {showPassword ? 'HIDE' : 'SHOW'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { marginBottom: spacing.md }, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textPrimary, fontSize: fontSize.sm, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}

      {renderContent()}

      {hasError ? (
        <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.xs, marginTop: 4 }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  errorText: {
    fontWeight: '500',
  },
  helperText: {
    fontWeight: '400',
  },
});
