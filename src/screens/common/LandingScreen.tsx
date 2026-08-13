import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';
import { BrandLogo } from '../../components/common/BrandLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { fontSize, containerPadding, isTablet } = useResponsive();
  const { isDark } = useAppTheme();

  const handleGoToLogin = (role: 'student' | 'teacher' = 'student') => {
    navigation.navigate('Login', { role });
  };

  const handleExplore = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: isDark ? '#090514' : '#f8fafc' }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Decorative Mesh / Ambient Glow */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Header NavBar */}
      <View style={[styles.header, { paddingHorizontal: containerPadding }]}>
        <View style={styles.logoRow}>
          <Text style={{ fontSize: 28, marginRight: 10 }}>🎓</Text>
          <Text style={[styles.logoText, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>
            Quiz<Text style={{ color: '#6366f1' }}>Master</Text>
          </Text>
        </View>

        <Pressable
          style={[styles.headerLoginBtn, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', borderColor: '#6366f1' }]}
          onPress={() => handleGoToLogin('student')}
        >
          <Text style={[styles.headerLoginBtnText, { color: '#6366f1' }]}>Login →</Text>
        </Pressable>
      </View>

      {/* Main Minimal Hero Section */}
      <View style={[styles.heroContainer, { paddingHorizontal: containerPadding }]}>
        {/* Brand Emblem / Logo Centerpiece */}
        <View style={styles.logoWrapper}>
          <BrandLogo size={isTablet ? 200 : 160} />
        </View>

        {/* Minimal Hero Tagline */}
        <View style={[styles.tagBadge, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : '#f3e8ff' }]}>
          <Text style={[styles.tagBadgeText, { color: isDark ? '#d8b4fe' : '#7e22ce' }]}>✨ Modern Learning Platform</Text>
        </View>

        <Text style={[styles.mainTitle, { fontSize: isTablet ? 52 : 38, color: isDark ? '#FFFFFF' : '#0f172a' }]}>
          Empowering Every{'\n'}
          <Text style={{ color: '#6366f1' }}>Student & Teacher</Text>
        </Text>

        <Text style={[styles.subTitle, { color: isDark ? '#94a3b8' : '#475569', fontSize: fontSize.lg }]}>
          A minimal, classic, and powerful quiz app designed to sharpen your skills with instant analytics and chapter-wise tests.
        </Text>

        {/* Direct Action Buttons */}
        <View style={[styles.actionRow, { flexDirection: isTablet ? 'row' : 'column' }]}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: '#6366f1' },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => handleGoToLogin('student')}
          >
            <Text style={styles.primaryBtnText}>Log In to QuizMaster</Text>
            <Text style={styles.btnArrow}>→</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: isDark ? 'rgba(148, 163, 184, 0.3)' : '#cbd5e1', backgroundColor: isDark ? 'rgba(15, 10, 44, 0.6)' : '#ffffff' },
              pressed && { opacity: 0.9 },
            ]}
            onPress={handleExplore}
          >
            <Text style={[styles.secondaryBtnText, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Select Role</Text>
            <Text style={{ fontSize: 16, marginLeft: 6 }}>👥</Text>
          </Pressable>
        </View>

        {/* Minimal Classic Quick Role Cards */}
        <View style={[styles.quickRoleContainer, { flexDirection: isTablet ? 'row' : 'column' }]}>
          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.7)' : '#ffffff', borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#e2e8f0' },
              pressed && { transform: [{ translateY: -2 }] },
            ]}
            onPress={() => handleGoToLogin('student')}
          >
            <View style={[styles.roleCardIcon, { backgroundColor: isDark ? '#1e1b4b' : '#e0e7ff' }]}>
              <Text style={{ fontSize: 26 }}>🎓</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.roleCardTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Student Login</Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 13, marginTop: 2 }}>
                Take quizzes, track score trends & earn badges
              </Text>
            </View>
            <Text style={[styles.roleCardArrow, { color: '#6366f1' }]}>→</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              { backgroundColor: isDark ? 'rgba(15, 10, 44, 0.7)' : '#ffffff', borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#e2e8f0' },
              pressed && { transform: [{ translateY: -2 }] },
            ]}
            onPress={() => handleGoToLogin('teacher')}
          >
            <View style={[styles.roleCardIcon, { backgroundColor: isDark ? '#3b0764' : '#f3e8ff' }]}>
              <Text style={{ fontSize: 26 }}>👩‍🏫</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.roleCardTitle, { color: isDark ? '#FFFFFF' : '#0f172a' }]}>Teacher Login</Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 13, marginTop: 2 }}>
                Create live quizzes, schedule tests & manage results
              </Text>
            </View>
            <Text style={[styles.roleCardArrow, { color: '#a855f7' }]}>→</Text>
          </Pressable>
        </View>

        {/* Footer info */}
        <Text style={[styles.footerText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
          Protected by QuizMaster Security • Version 1.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  ambientGlowTop: {
    position: 'absolute',
    top: -100,
    left: '25%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -80,
    right: '20%',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  header: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  headerLoginBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  headerLoginBtnText: { fontWeight: '800', fontSize: 14 },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  logoWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 20,
  },
  tagBadgeText: { fontSize: 13, fontWeight: '700' },
  mainTitle: {
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 54,
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  subTitle: {
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 580,
    marginBottom: 36,
  },
  actionRow: {
    gap: 14,
    marginBottom: 44,
    width: '100%',
    maxWidth: 500,
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    shadowColor: '#6366f1',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  btnArrow: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginLeft: 8 },
  secondaryBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
  },
  secondaryBtnText: { fontWeight: '700', fontSize: 15 },
  quickRoleContainer: {
    width: '100%',
    maxWidth: 720,
    gap: 16,
    marginBottom: 40,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  roleCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardTitle: { fontSize: 16, fontWeight: '800' },
  roleCardArrow: { fontSize: 22, fontWeight: '800', marginLeft: 8 },
  footerText: { fontSize: 12, textAlign: 'center', marginTop: 10 },
});
