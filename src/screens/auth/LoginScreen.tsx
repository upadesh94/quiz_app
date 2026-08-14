import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandLogo } from '../../components/common/BrandLogo';
import { CustomInput } from '../../components/common/CustomInput';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setAuth } from '../../store/slices/authSlice';
import { AuthService } from '../../services/auth/AuthService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { fontSize, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();
  
  // Track active role selection dynamically
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>(
    route.params?.role === 'teacher' ? 'teacher' : 'student'
  );
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  const onLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await AuthService.login(username, password, activeRole);
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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.background, { backgroundColor: isDark ? '#090514' : colors.background }]}>
        {/* Ambient Background Lighting */}
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          <View style={{ maxWidth: isTablet ? 480 : '100%', alignSelf: 'center', width: '100%' }}>
            
            {/* Header Brand Logo */}
            <View style={styles.logoSection}>
              <BrandLogo size={isTablet ? 150 : 130} />
            </View>

            {/* Theme-Aligned Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#0f0a2c' : '#ffffff',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : colors.border,
                },
              ]}
            >
              {/* Segmented Role Switcher */}
              <View style={[styles.tabSegmentBg, { backgroundColor: isDark ? '#1e1644' : '#e2e8f0' }]}>
                <Pressable
                  style={[
                    styles.tabSegmentItem,
                    activeRole === 'student'
                      ? [styles.tabSegmentActive, { backgroundColor: '#6366f1' }]
                      : { backgroundColor: 'transparent' },
                  ]}
                  onPress={() => {
                    setActiveRole('student');
                    setError('');
                  }}
                >
                  <Text
                    style={[
                      styles.tabSegmentText,
                      { color: activeRole === 'student' ? '#ffffff' : (isDark ? '#a5b4fc' : '#475569') },
                    ]}
                  >
                    Student
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.tabSegmentItem,
                    activeRole === 'teacher'
                      ? [styles.tabSegmentActive, { backgroundColor: '#8b5cf6' }]
                      : { backgroundColor: 'transparent' },
                  ]}
                  onPress={() => {
                    setActiveRole('teacher');
                    setError('');
                  }}
                >
                  <Text
                    style={[
                      styles.tabSegmentText,
                      { color: activeRole === 'teacher' ? '#ffffff' : (isDark ? '#a5b4fc' : '#475569') },
                    ]}
                  >
                    Teacher
                  </Text>
                </Pressable>
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.title, { fontSize: fontSize['2xl'] }, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>
                Welcome Back
              </Text>
              <Text style={[styles.subtitle, { fontSize: fontSize.sm }, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Log in as {activeRole === 'student' ? 'Student' : 'Teacher'} to access your portal
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Theme-Aligned Input Fields */}
              <View style={{ gap: 14, marginBottom: 16 }}>
                <CustomInput
                  label="Username or Email"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username or email"
                />

                <CustomInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />
              </View>

              {/* Login Button */}
              <Pressable
                onPress={onLogin}
                disabled={!isFormValid || isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: activeRole === 'student' ? '#6366f1' : '#8b5cf6' },
                  (!isFormValid || isLoading) && styles.primaryButtonDisabled,
                  pressed && isFormValid && !isLoading && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'LOGGING IN...' : `SIGN IN AS ${activeRole.toUpperCase()}`}
                </Text>
              </Pressable>

              {/* Auxiliary Links */}
              <View style={styles.linksRow}>
                <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={[styles.linkText, { color: isDark ? '#818cf8' : '#6366f1' }]}>Forgot password?</Text>
                </Pressable>
              </View>

              {/* Create Account Link */}
              <View style={styles.createAccountRow}>
                <Text style={{ color: isDark ? '#cbd5e1' : '#64748b', fontSize: 14 }}>
                  Don’t have an account?{' '}
                </Text>
                <Pressable onPress={() => navigation.navigate('Register', { role: activeRole })}>
                  <Text style={[styles.createAccountLink, { color: isDark ? '#818cf8' : '#6366f1' }]}>
                    Create Account
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  background: { flex: 1, minHeight: '100%' },
  topGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
  },
  bottomGlow: {
    position: 'absolute',
    right: -100,
    bottom: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tabSegmentBg: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabSegmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSegmentActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabSegmentText: {
    fontWeight: '800',
    fontSize: 14,
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  linksRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  createAccountLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
