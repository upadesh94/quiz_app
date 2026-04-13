import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setAuth } from '../../store/slices/authSlice';
import { AuthService } from '../../services/auth/AuthService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';
import { colors, radii, shadows } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const demoCredentials = AuthService.getDemoCredentials();
  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  const onLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await AuthService.login(username, password, route.params.role);
      dispatch(setAuth(response));

      if (response.user.role === 'teacher') {
        navigation.replace('TeacherDashboard');
        return;
      }

      navigation.replace('StudentDashboard');
    } catch (authError) {
      setError(ErrorHandler.toMessage(authError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
        <View
          style={{
            maxWidth: isTablet ? 500 : '100%',
            alignSelf: 'center',
            width: '100%',
            backgroundColor: colors.card,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: '#DBEAFE',
            padding: spacing.lg,
            ...shadows.card,
          }}
        >
          <Text
            style={{
              fontSize: fontSize['3xl'],
              fontWeight: '700',
              marginBottom: spacing.md,
              color: colors.textPrimary,
            }}
          >
            🔐 {route.params.role === 'teacher' ? 'Teacher' : 'Student'} Login
          </Text>
          <Text
            style={{
              fontSize: fontSize.base,
              marginBottom: spacing.lg,
              color: colors.textSecondary,
              lineHeight: fontSize.base * 1.5,
            }}
          >
            Use your username and password to continue
          </Text>

          <CustomInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            label="Username"
          />
          <CustomInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            label="Password"
            secureTextEntry
          />

          {error ? (
            <Text
              style={{
                color: '#dc2626',
                marginBottom: spacing.md,
                fontSize: fontSize.sm,
                fontWeight: '600',
              }}
            >
              {error}
            </Text>
          ) : null}

          <CustomButton
            title={isLoading ? 'Logging in...' : 'Sign In'}
            onPress={onLogin}
            disabled={!isFormValid}
            loading={isLoading}
          />

          {route.params.role === 'student' ? (
            <CustomButton
              title="Use Demo Student"
              variant="secondary"
              onPress={() => {
                setUsername(demoCredentials.student.username);
                setPassword(demoCredentials.student.password);
              }}
            />
          ) : null}

          {route.params.role === 'teacher' ? (
            <CustomButton
              title="Use Demo Teacher"
              variant="secondary"
              onPress={() => {
                setUsername(demoCredentials.teacher.username);
                setPassword(demoCredentials.teacher.password);
              }}
            />
          ) : null}

          <Text
            style={{
              textAlign: 'center',
              fontSize: fontSize.xs,
              color: '#1d4ed8',
              marginBottom: spacing.lg,
              fontWeight: '500',
              lineHeight: fontSize.xs * 1.5,
            }}
          >
            Demo: {route.params.role === 'student' ? 'student_demo / student123' : 'teacher_demo / teacher123'}
          </Text>

          <CustomButton
            title="Create Account"
            variant="secondary"
            onPress={() => navigation.navigate('Register', { role: route.params.role })}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
    minHeight: '100%',
  },
});
