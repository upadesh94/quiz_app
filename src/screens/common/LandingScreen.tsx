import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandLogo } from '../../components/common/BrandLogo';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { fontSize, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: isDark ? '#160629' : colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.background, { backgroundColor: isDark ? '#160629' : colors.background }]}>
        {isDark && <View style={styles.topGlow} />}
        {isDark && <View style={styles.bottomGlow} />}

        <View style={[styles.container, { paddingHorizontal: containerPadding }]}> 
          <View style={{ maxWidth: isTablet ? 520 : '100%', alignSelf: 'center', width: '100%' }}>
            <View style={styles.logoSection}>
              <BrandLogo size={isTablet ? 220 : 180} />
            </View>

            <View style={[
              styles.heroCard,
              !isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.primary,
              }
            ]}>
              <Text style={[styles.heroTitle, { fontSize: fontSize['3xl'] }, !isDark && { color: colors.textPrimary }]}>EduQuiz</Text>
              <Text style={[styles.heroSubtitle, { fontSize: fontSize.xl }, !isDark && { color: colors.primary }]}>Elevate Your Learning Experience</Text>
              <Text style={[styles.heroText, { fontSize: fontSize.base }, !isDark && { color: colors.textSecondary }]}>
                Join thousands of students and teachers in an interactive, seamless, and smart quiz platform.
              </Text>

              <Pressable
                onPress={() => navigation.navigate('RoleSelection')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : null,
                ]}
              >
                <Text style={styles.primaryButtonText}>GET STARTED</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </Pressable>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    minHeight: '100%',
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
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.72)',
    shadowColor: '#a855f7',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: '#d8b4fe',
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  primaryButton: {
    minHeight: 64,
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  primaryButtonArrow: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 26,
    marginTop: -2,
  },
});
