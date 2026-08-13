import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setAuth } from '../../store/slices/authSlice';
import { AuthService } from '../../services/auth/AuthService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SuperAdminLogin'>;

export function SuperAdminLoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { fontSize, containerPadding, isTablet } = useResponsive();
  const { isDark } = useAppTheme();
  
  const [username] = useState('quizapp_superadminupadesh');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSuperAdminLogin = async () => {
    if (!password.trim()) {
      setError('System security key required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await AuthService.login(username, password, 'superadmin');
      dispatch(setAuth(response));
      navigation.replace('SuperAdminDashboard');
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
        <View style={[styles.container, { paddingHorizontal: containerPadding }]}> 
          <View style={{ maxWidth: isTablet ? 440 : '100%', alignSelf: 'center', width: '100%' }}>
            
            {/* Professional Security Header */}
            <View style={styles.headerBox}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>SYS</Text>
              </View>
              <Text style={styles.headerTitle}>System Control Console</Text>
              <Text style={styles.headerSub}>QuizMaster Root Administrator Authentication</Text>
            </View>

            {/* Portal Login Card */}
            <View style={styles.card}>
              <View style={styles.secStatusRow}>
                <View style={styles.secDot} />
                <Text style={styles.secStatusText}>ENCRYPTED CHANNEL • TLS 1.3</Text>
              </View>

              <Text style={[styles.cardTitle, { fontSize: fontSize['xl'] }]}>Root Administrator Sign In</Text>
              <Text style={styles.cardSubtitle}>
                Target Account: <Text style={{ color: '#818cf8', fontFamily: 'monospace' }}>{username}</Text>
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Security Key / Passcode</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter root passcode"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoFocus
                  />
                  <Pressable onPress={() => setShowPassword((curr) => !curr)} style={styles.toggleBtn}>
                    <Text style={styles.toggleBtnText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Action Button */}
              <Pressable
                onPress={onSuperAdminLogin}
                disabled={isLoading || !password.trim()}
                style={({ pressed }) => [
                  styles.authButton,
                  (!password.trim() || isLoading) && styles.authButtonDisabled,
                  pressed && password.trim() && !isLoading && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.authButtonText}>
                  {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}
                </Text>
              </Pressable>

              <Text style={styles.securityFooterNotice}>
                Restricted access. All system actions and authentication attempts are audited.
              </Text>
            </View>

          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090d16' },
  scrollContent: { flexGrow: 1 },
  background: { flex: 1, minHeight: '100%', justifyContent: 'center' },
  container: { paddingVertical: 40 },
  headerBox: { alignItems: 'center', marginBottom: 24 },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandIconText: { color: '#6366f1', fontSize: 13, fontWeight: '900', fontFamily: 'monospace' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  secStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  secDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  secStatusText: { color: '#10b981', fontSize: 10, fontWeight: '700', fontFamily: 'monospace' },
  cardTitle: { color: '#FFFFFF', fontWeight: '800' },
  cardSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 20 },
  errorText: {
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6, fontFamily: 'monospace' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 12,
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14, fontFamily: 'monospace' },
  toggleBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  toggleBtnText: { color: '#6366f1', fontSize: 11, fontWeight: '800', fontFamily: 'monospace' },
  authButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authButtonDisabled: { opacity: 0.4 },
  authButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 0.5 },
  securityFooterNotice: { color: '#475569', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
