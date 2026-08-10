import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandLogo } from '../../components/common/BrandLogo';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

export function RoleSelectionScreen({ navigation }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.background, { backgroundColor: isDark ? '#160629' : colors.background }]}>
        {isDark && <View style={styles.topGlow} />}
        {isDark && <View style={styles.bottomGlow} />}

        <View style={[styles.container, { paddingHorizontal: containerPadding }]}> 
          <View style={{ maxWidth: isTablet ? 520 : '100%', alignSelf: 'center', width: '100%' }}>
            <View style={styles.logoSection}>
              <BrandLogo size={isTablet ? 190 : 160} />
            </View>

            <View style={[
              styles.heroCard,
              !isDark && { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }
            ]}>
              <Text style={[styles.heroTitle, { fontSize: fontSize['3xl'] }, !isDark && { color: colors.textPrimary }]}>QuizMaster</Text>
              <Text style={[styles.heroSubtitle, { fontSize: fontSize.xl }, !isDark && { color: colors.primary }]}>Learn faster. Quiz smarter.</Text>
              <Text style={[styles.heroText, { fontSize: fontSize.base }, !isDark && { color: colors.textSecondary }]}>Pick your role to continue into a focused quiz experience built for students and teachers.</Text>

              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Fast quizzes</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Live progress</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Teacher tools</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.welcomeTitle, { fontSize: fontSize['2xl'] }, !isDark && { color: colors.textPrimary }]}>Welcome!</Text>
            <Text style={[styles.welcomeText, { fontSize: fontSize.base }, !isDark && { color: colors.textSecondary }]}>Choose how you want to continue</Text>

            <View style={styles.roleStack}>
              <Pressable
                onPress={() => navigation.navigate('Login', { role: 'student' })}
                style={({ pressed }) => [
                  styles.roleButton,
                  !isDark && { backgroundColor: colors.card, borderColor: colors.border },
                  pressed ? styles.roleButtonPressed : null
                ]}
              >
                <Text style={styles.roleEmoji}>🎓</Text>
                <View style={styles.roleContent}>
                  <Text style={[styles.roleTitle, !isDark && { color: colors.textPrimary }]}>Student</Text>
                  <Text style={[styles.roleDesc, !isDark && { color: colors.textSecondary }]}>Take quizzes and view your results</Text>
                </View>
                <Text style={styles.roleArrow}>→</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Login', { role: 'teacher' })}
                style={({ pressed }) => [
                  styles.roleButton,
                  !isDark && { backgroundColor: colors.card, borderColor: colors.border },
                  pressed ? styles.roleButtonPressed : null
                ]}
              >
                <Text style={styles.roleEmoji}>👩‍🏫</Text>
                <View style={styles.roleContent}>
                  <Text style={[styles.roleTitle, !isDark && { color: colors.textPrimary }]}>Teacher</Text>
                  <Text style={[styles.roleDesc, !isDark && { color: colors.textSecondary }]}>Create quizzes and track class performance</Text>
                </View>
                <Text style={styles.roleArrow}>→</Text>
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
    top: -110,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(113, 50, 255, 0.16)',
  },
  bottomGlow: {
    position: 'absolute',
    right: -120,
    bottom: -120,
    width: 320,
    height: 320,
    borderRadius: 320,
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
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.72)',
    shadowColor: '#a855f7',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    color: '#d8b4fe',
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroText: {
    textAlign: 'center',
    marginBottom: 18,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(124, 58, 237, 0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.24)',
  },
  pillText: {
    color: '#d8b4fe',
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 18,
    color: '#cbd5e1',
  },
  roleStack: {
    gap: 12,
  },
  roleButton: {
    minHeight: 74,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.42)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  roleButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  roleEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  roleDesc: {
    color: '#a78bfa',
    fontSize: 13,
    lineHeight: 18,
  },
  roleArrow: {
    color: '#d8b4fe',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 10,
  },
});
