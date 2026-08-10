import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandLogo } from '../../components/common/BrandLogo';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setAuth } from '../../store/slices/authSlice';
import { AuthService } from '../../services/auth/AuthService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { fontSize, containerPadding, isTablet } = useResponsive();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const demoCredentials = AuthService.getDemoCredentials();
  const isFormValid = username.trim().length > 0 && password.trim().length > 0;
  const roleLabel = route.params.role === 'teacher' ? 'Teacher' : 'Student';

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.background}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
        <View style={styles.dots} />

        <View style={[styles.container, { paddingHorizontal: containerPadding }]}> 
          <View style={{ maxWidth: isTablet ? 520 : '100%', alignSelf: 'center', width: '100%' }}>
            <View style={styles.logoSection}>
              <BrandLogo size={isTablet ? 190 : 160} />
            </View>

            <View style={styles.card}>
              <View style={styles.lockBadge}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>

              <Text style={[styles.title, { fontSize: fontSize['3xl'] }]}>Welcome Back!</Text>
              <Text style={[styles.subtitle, { fontSize: fontSize.base }]}>Login to continue your quiz journey</Text>

              <View style={styles.roleChip}>
                <Text style={styles.roleChipText}>{roleLabel} Login</Text>
              </View>

              <View style={styles.divider} />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.inputRow}>
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>✉</Text>
                </View>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your email"
                  placeholderTextColor="#a78bfa"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>🔒</Text>
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#a78bfa"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  style={({ pressed }) => [styles.eyeButton, pressed ? { opacity: 0.7 } : null]}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={onLogin}
                disabled={!isFormValid || isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!isFormValid || isLoading) ? styles.primaryButtonDisabled : null,
                  pressed && isFormValid && !isLoading ? { opacity: 0.92, transform: [{ scale: 0.99 }] } : null,
                ]}
              >
                <Text style={styles.primaryButtonText}>{isLoading ? 'LOGGING IN...' : 'LOGIN'}</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </Pressable>

              <View style={styles.linksRow}>
                <View style={styles.linkLine} />
                <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.linkText}>Forgot password?</Text>
                </Pressable>
                <View style={styles.linkLine} />
              </View>

              <View style={styles.createAccountRow}>
                <Text style={styles.createAccountMuted}>Don’t have an account? </Text>
                <Pressable onPress={() => navigation.navigate('Register', { role: route.params.role })}>
                  <Text style={styles.createAccountLink}>Create Account</Text>
                </Pressable>
              </View>

              <View style={styles.demoRow}>
                <Pressable
                  onPress={() => {
                    if (route.params.role === 'student') {
                      setUsername(demoCredentials.student.username);
                      setPassword(demoCredentials.student.password);
                      return;
                    }

                    setUsername(demoCredentials.teacher.username);
                    setPassword(demoCredentials.teacher.password);
                  }}
                  style={({ pressed }) => [styles.demoButton, pressed ? { opacity: 0.85 } : null]}
                >
                  <Text style={styles.demoButtonText}>Use Demo {roleLabel}</Text>
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
  screen: {
    flex: 1,
    backgroundColor: '#160629',
  },
  scrollContent: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#160629',
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    left: -110,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(113, 50, 255, 0.16)',
  },
  bottomGlow: {
    position: 'absolute',
    right: -120,
    bottom: -100,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(78, 37, 181, 0.18)',
  },
  dots: {
    position: 'absolute',
    top: 130,
    right: 28,
    width: 80,
    height: 110,
    opacity: 0.35,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: '#a855f7',
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: 28,
    paddingTop: 34,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.8)',
    shadowColor: '#a855f7',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  lockBadge: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#24104f',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  lockIcon: {
    fontSize: 26,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  roleChip: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.55)',
    backgroundColor: 'rgba(124, 58, 237, 0.14)',
    marginBottom: 16,
  },
  roleChipText: {
    color: '#d8b4fe',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  divider: {
    width: 42,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    backgroundColor: '#9b5cff',
    marginBottom: 18,
  },
  errorText: {
    color: '#fca5a5',
    backgroundColor: 'rgba(127, 29, 29, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.28)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.36)',
    backgroundColor: 'rgba(30, 19, 68, 0.78)',
    marginBottom: 16,
    paddingLeft: 10,
    paddingRight: 8,
  },
  inputIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.92)',
    marginRight: 12,
  },
  inputIconText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    color: '#c4b5fd',
    fontSize: 18,
  },
  primaryButton: {
    minHeight: 60,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  primaryButtonArrow: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 26,
    marginTop: -2,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  linkLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.28)',
  },
  linkText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 14,
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  createAccountMuted: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  createAccountLink: {
    color: '#c084fc',
    fontSize: 14,
    fontWeight: '700',
  },
  demoRow: {
    alignItems: 'center',
  },
  demoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.28)',
  },
  demoButtonText: {
    color: '#d8b4fe',
    fontSize: 13,
    fontWeight: '700',
  },
});
