import React, { useEffect, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { firebaseAuth } from '../../firebase/config';
import { SessionService } from '../../services/auth/SessionService';
import { TeacherProfileService } from '../../services/teacher/TeacherProfileService';
import { StudentService } from '../../services/teacher/StudentService';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { clearAuth } from '../../store/slices/authSlice';
import { StudentPerformanceAnalytics } from '../../types/models';
import { useResponsive } from '../../utils/responsive';

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const user = useAppSelector((state) => state.auth.user);
  const [username, setUsername] = useState(user?.username ?? '');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber ?? '');
  const [parentName, setParentName] = useState(user?.parentName ?? '');
  const [parentMobileNumber, setParentMobileNumber] = useState(user?.parentMobileNumber ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [analytics, setAnalytics] = useState<StudentPerformanceAnalytics | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        return;
      }

      if (user.role === 'student') {
        const [studentProfile, studentAnalytics] = await Promise.all([
          StudentService.getStudentByUsername(user.username),
          PerformanceService.getStudentPerformance(user.id),
        ]);

        if (studentProfile) {
          setUsername(studentProfile.username ?? user.username);
          setFullName(studentProfile.fullName ?? user.fullName);
          setMobileNumber(studentProfile.mobileNumber ?? '');
          setParentName(studentProfile.parentName ?? '');
          setParentMobileNumber(studentProfile.parentMobileNumber ?? '');
          setEmail(studentProfile.email ?? '');
          setAddress(studentProfile.address ?? '');
        }

        setAnalytics(studentAnalytics);
        return;
      }

      const profile = await TeacherProfileService.getProfile(user.id);
      if (profile) {
        setUsername((profile.username as string) ?? user.username);
        setFullName((profile.fullName as string) ?? user.fullName);
      }
    };

    loadProfile();
  }, [user?.fullName, user?.id, user?.username]);

  const onSave = async () => {
    if (!user?.id || !user?.username) {
      return;
    }

    if (user.role === 'student') {
      await StudentService.updateStudentSelfProfile(user.username, {
        fullName,
        mobileNumber,
        parentName,
        parentMobileNumber,
        email,
        address,
      });
      setMessage('Your profile has been updated successfully.');
      return;
    }

    await TeacherProfileService.saveProfile(user.id, {
      username,
      fullName,
    });
    setMessage('Profile updated successfully.');
  };

  const onLogout = async () => {
    try {
      await SessionService.clearToken();
      await signOut(firebaseAuth);
    } catch {
      // Proceed with local session reset even if remote sign-out fails.
    }

    dispatch(clearAuth());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'RoleSelection' as never }],
      }),
    );
  };

  return (
    <ScrollView style={[styles.container, { paddingHorizontal: containerPadding }]}>
      <View
        style={{
          maxWidth: isTablet ? 500 : '100%',
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.md,
            color: '#0f172a',
          }}
        >
          👤 Profile
        </Text>
        <Text
          style={{
            fontSize: fontSize.base,
            marginBottom: spacing.lg,
            color: '#334155',
            lineHeight: fontSize.base * 1.5,
          }}
        >
          {user?.role === 'student' ? 'View your personal details and your own score summary' : 'Manage your profile details'}
        </Text>

        {user?.role === 'student' ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Average</Text>
              <Text style={styles.scoreValue}>{analytics?.averageScore ?? 0}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Attempts</Text>
              <Text style={styles.scoreValue}>{analytics?.attemptsCount ?? 0}</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Pass Rate</Text>
              <Text style={styles.scoreValue}>{analytics?.passRate ?? 0}%</Text>
            </View>
          </View>
        ) : null}

        <CustomInput value={fullName} onChangeText={setFullName} placeholder="Full name" />
        <CustomInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          label="Username"
        />

        {user?.role === 'student' ? (
          <>
            <CustomInput value={mobileNumber} onChangeText={setMobileNumber} placeholder="Mobile number" label="Mobile Number" />
            <CustomInput value={parentName} onChangeText={setParentName} placeholder="Parent name" label="Parent Name" />
            <CustomInput
              value={parentMobileNumber}
              onChangeText={setParentMobileNumber}
              placeholder="Parent mobile"
              label="Parent Mobile Number"
            />
            <CustomInput value={email} onChangeText={setEmail} placeholder="Email" label="Email" />
            <CustomInput value={address} onChangeText={setAddress} placeholder="Address" label="Address" />
          </>
        ) : null}

        <CustomButton title="Save Profile" onPress={onSave} />
        {message ? (
          <Text
            style={{
              marginTop: spacing.lg,
              color: '#166534',
              fontWeight: '600',
              fontSize: fontSize.sm,
            }}
          >
            {message}
          </Text>
        ) : null}

        <CustomButton title="Logout" variant="secondary" onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  scoreValue: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
});
