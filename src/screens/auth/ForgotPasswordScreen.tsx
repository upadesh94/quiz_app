import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandLogo } from '../../components/common/BrandLogo';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { RootStackParamList } from '../../navigation/types';
import { PasswordResetService } from '../../services/auth/PasswordResetService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { fontSize, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ target: string; username: string } | null>(null);

  const handleSubmitRequest = async () => {
    if (!username.trim()) {
      setError('Please enter your registered username.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessInfo(null);

    try {
      const result = await PasswordResetService.requestPasswordReset(username);
      setSuccessInfo({
        target: result.target,
        username: username.trim(),
      });
    } catch (err) {
      setError(ErrorHandler.toMessage(err));
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
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
          <View style={{ maxWidth: isTablet ? 480 : '100%', alignSelf: 'center', width: '100%' }}>
            
            {/* Header Brand Logo */}
            <View style={styles.logoSection}>
              <BrandLogo size={isTablet ? 140 : 120} />
            </View>

            {/* Main Form Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#0f0a2c' : '#ffffff',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : colors.border,
                },
              ]}
            >
              <Text style={[styles.title, { fontSize: fontSize['2xl'], color: isDark ? '#FFFFFF' : '#0f172a' }]}>
                Password Reset Request
              </Text>
              
              <Text style={[styles.subtitle, { fontSize: fontSize.sm, color: isDark ? '#94a3b8' : '#64748b' }]}>
                Enter your username. Reset notifications for Teachers are routed to the Super Admin, and Student requests are sent to your Teacher.
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {successInfo ? (
                <View style={[styles.successBanner, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', borderColor: '#10b981' }]}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#10b981', fontFamily: 'monospace', marginBottom: 6 }}>
                    NOTIFICATION SENT
                  </Text>
                  <Text style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#0f172a', lineHeight: 20 }}>
                    A password reset request for <Text style={{ fontWeight: '800', fontFamily: 'monospace', color: '#6366f1' }}>@{successInfo.username}</Text> has been dispatched to your <Text style={{ fontWeight: '800', color: '#10b981' }}>{successInfo.target}</Text>.
                  </Text>
                  <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 8 }}>
                    Please contact your {successInfo.target} to approve and set your new account password.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 16, marginBottom: 20 }}>
                  <CustomInput
                    label="Username"
                    value={username}
                    onChangeText={(val) => {
                      setUsername(val);
                      setError('');
                    }}
                    placeholder="Enter your registered username"
                  />

                  <CustomButton
                    title={isLoading ? 'SENDING REQUEST...' : 'SEND RESET NOTIFICATION'}
                    onPress={handleSubmitRequest}
                    variant="primary"
                    disabled={isLoading || !username.trim()}
                  />
                </View>
              )}

              {/* Navigation Actions */}
              <View style={styles.backRow}>
                <Pressable onPress={() => navigation.goBack()}>
                  <Text style={[styles.backLink, { color: isDark ? '#818cf8' : '#6366f1' }]}>
                    Return to Login
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
  title: {
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  errorText: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  successBanner: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  backRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
