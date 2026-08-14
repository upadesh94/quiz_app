import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { RootStackParamList } from '../../navigation/types';
import { AuthService } from '../../services/auth/AuthService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const ALL_SUBJECT_OPTIONS = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies', 'Computer Science'];

export function RegisterScreen({ navigation, route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const { colors, isDark } = useAppTheme();
  
  // Common Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');

  // Student Fields
  const [classLevel, setClassLevel] = useState('10');
  const [parentName, setParentName] = useState('');
  const [parentMobileNumber, setParentMobileNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('other');

  // Teacher Specific Fields
  const [qualification, setQualification] = useState('M.Sc Mathematics');
  const [assignedClasses, setAssignedClasses] = useState<number[]>([8, 9, 10]);
  const [teachingSubjects, setTeachingSubjects] = useState<string[]>(['Mathematics', 'Science']);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isTeacher = route.params.role === 'teacher';
  const isStudent = route.params.role === 'student';

  const toggleAssignedClass = (cls: number) => {
    setAssignedClasses((prev) =>
      prev.includes(cls) ? (prev.length > 1 ? prev.filter((c) => c !== cls) : prev) : [...prev, cls].sort()
    );
  };

  const toggleTeachingSubject = (subj: string) => {
    setTeachingSubjects((prev) =>
      prev.includes(subj) ? (prev.length > 1 ? prev.filter((s) => s !== subj) : prev) : [...prev, subj]
    );
  };

  const onRegister = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password to confirm.');
      setIsLoading(false);
      return;
    }

    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError('Mobile number must be exactly 10 digits.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await AuthService.register({
        username,
        password,
        fullName,
        role: route.params.role,
        classLevel: isStudent ? (Number(classLevel) as 8 | 9 | 10) : undefined,
        mobileNumber,
        parentName: isStudent ? parentName : undefined,
        parentMobileNumber: isStudent ? parentMobileNumber : undefined,
        email,
        address,
        rollNumber,
        admissionNumber,
        dateOfBirth,
        gender: gender as 'male' | 'female' | 'other',
        assignedClasses: isTeacher ? assignedClasses : undefined,
        teachingSubjects: isTeacher ? teachingSubjects : undefined,
        qualification: isTeacher ? qualification : undefined,
      });

      if (result.requiresApproval && isStudent) {
        setMessage('Registration request submitted. Please wait for teacher approval before login.');
        return;
      }

      navigation.replace('Login', { role: route.params.role });
    } catch (registrationError) {
      setError(ErrorHandler.toMessage(registrationError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#160629' : '#eef7ff' }}>
      <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
        <View
          style={{
            maxWidth: isTablet ? 540 : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: fontSize['3xl'],
              fontWeight: '700',
              marginBottom: spacing.md,
              color: isDark ? '#FFFFFF' : '#0f172a',
            }}
          >
            Create {isTeacher ? 'Teacher' : 'Student'} Account
          </Text>
          <Text
            style={{
              fontSize: fontSize.base,
              marginBottom: spacing.lg,
              color: isDark ? '#cbd5e1' : '#334155',
              lineHeight: fontSize.base * 1.5,
            }}
          >
            {isTeacher ? 'Fill in your teaching details, assigned classes, and credentials' : 'Create your account to start taking quizzes'}
          </Text>

          {/* Account Credentials */}
          <CustomInput
            label="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Dr. Rajesh Kumar"
          />
          <CustomInput
            label="Username *"
            value={username}
            onChangeText={setUsername}
            placeholder="Choose username"
          />
          <CustomInput
            label="Password *"
            value={password}
            onChangeText={setPassword}
            placeholder="Create password"
            secureTextEntry
          />
          <CustomInput
            label="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password to confirm"
            secureTextEntry
          />

          {/* TEACHER SPECIFIC FIELDS */}
          {isTeacher ? (
            <>
              <CustomInput
                label="Qualification / Designation *"
                value={qualification}
                onChangeText={setQualification}
                placeholder="e.g. M.Sc Mathematics, B.Ed"
              />
              <CustomInput
                label="Mobile Number *"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="10-digit mobile number"
              />
              <CustomInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. rajesh@quizmaster.com"
              />

              {/* Multi-Class Teaching Selector */}
              <Text style={{ color: isDark ? '#d8b4fe' : '#0f172a', fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.xs }}>
                Classes You Teach (Select one or multiple classes):
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                {[8, 9, 10].map((cls) => {
                  const isSelected = assignedClasses.includes(cls);
                  return (
                    <Pressable
                      key={cls}
                      onPress={() => toggleAssignedClass(cls)}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        alignItems: 'center',
                        borderRadius: 14,
                        borderWidth: 2,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe')
                          : (isDark ? 'rgba(15, 10, 44, 0.88)' : '#ffffff'),
                        borderColor: isSelected
                          ? (isDark ? '#a855f7' : '#2563eb')
                          : (isDark ? 'rgba(168, 85, 247, 0.3)' : '#cbd5e1'),
                      }}
                    >
                      <Text style={{
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected
                          ? (isDark ? '#ffffff' : '#1e40af')
                          : (isDark ? '#94a3b8' : '#64748b')
                      }}>
                        {isSelected ? '✓ ' : ''}Class {cls}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Multi-Subject Selection */}
              <Text style={{ color: isDark ? '#d8b4fe' : '#0f172a', fontSize: fontSize.sm, fontWeight: '700', marginBottom: spacing.xs }}>
                Subjects You Teach:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                {ALL_SUBJECT_OPTIONS.map((subj) => {
                  const isSelected = teachingSubjects.includes(subj);
                  return (
                    <Pressable
                      key={subj}
                      onPress={() => toggleTeachingSubject(subj)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(168, 85, 247, 0.25)' : '#e0e7ff')
                          : (isDark ? '#0f172a' : '#ffffff'),
                        borderColor: isSelected
                          ? (isDark ? '#a855f7' : '#4f46e5')
                          : (isDark ? 'rgba(148, 163, 184, 0.2)' : '#cbd5e1'),
                      }}
                    >
                      <Text style={{
                        fontSize: fontSize.xs,
                        fontWeight: isSelected ? '800' : '500',
                        color: isSelected
                          ? (isDark ? '#f3e8ff' : '#4338ca')
                          : (isDark ? '#94a3b8' : '#64748b')
                      }}>
                        {isSelected ? '✓ ' : ''}{subj}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* STUDENT SPECIFIC FIELDS */}
          {isStudent ? (
            <>
              <Text style={{ color: isDark ? '#d8b4fe' : '#0f172a', fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.xs }}>
                🎓 Select Class *
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                {[8, 9, 10].map((cls) => {
                  const isSelected = classLevel === String(cls);
                  return (
                    <Pressable
                      key={cls}
                      onPress={() => setClassLevel(String(cls))}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        alignItems: 'center',
                        borderRadius: 14,
                        borderWidth: 2,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(168, 85, 247, 0.3)' : '#dbeafe')
                          : (isDark ? 'rgba(15, 10, 44, 0.88)' : '#ffffff'),
                        borderColor: isSelected
                          ? (isDark ? '#a855f7' : '#2563eb')
                          : (isDark ? 'rgba(168, 85, 247, 0.3)' : '#cbd5e1'),
                      }}
                    >
                      <Text style={{
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected
                          ? (isDark ? '#ffffff' : '#1e40af')
                          : (isDark ? '#94a3b8' : '#64748b')
                      }}>
                        {isSelected ? '✓ ' : ''}Class {cls}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <CustomInput
                label="Mobile Number *"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="10-digit mobile number"
              />
              <CustomInput
                label="Parent/Guardian Name"
                value={parentName}
                onChangeText={setParentName}
                placeholder="Parent name"
              />
              <CustomInput
                label="Parent Mobile Number"
                value={parentMobileNumber}
                onChangeText={setParentMobileNumber}
                placeholder="Parent mobile"
              />
              <CustomInput
                label="Roll Number"
                value={rollNumber}
                onChangeText={setRollNumber}
                placeholder="Optional"
              />
              <CustomInput
                label="Admission Number"
                value={admissionNumber}
                onChangeText={setAdmissionNumber}
                placeholder="Optional"
              />
              <CustomInput
                label="Date of Birth"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                type="date"
              />
              
              <Text style={{ color: isDark ? '#d8b4fe' : '#0f172a', fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs }}>
                Gender
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                {['male', 'female', 'other'].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setGender(item)}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.sm,
                      alignItems: 'center',
                      borderRadius: 14,
                      borderWidth: 1,
                      backgroundColor: gender === item 
                        ? (isDark ? 'rgba(168, 85, 247, 0.25)' : '#dbeafe')
                        : (isDark ? 'rgba(15, 10, 44, 0.88)' : '#ffffff'),
                      borderColor: gender === item
                        ? (isDark ? '#a855f7' : '#3b82f6')
                        : (isDark ? 'rgba(168, 85, 247, 0.4)' : '#93c5fd'),
                    }}
                  >
                    <Text style={{
                      fontWeight: gender === item ? '700' : '500',
                      color: gender === item
                        ? (isDark ? '#f3e8ff' : '#1d4ed8')
                        : (isDark ? '#cbd5e1' : '#475569')
                    }}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <CustomInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Optional email"
              />
            </>
          ) : null}

          <CustomInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Optional address"
          />

          {error ? (
            <Text
              style={{
                color: isDark ? '#fca5a5' : '#dc2626',
                marginBottom: spacing.md,
                fontSize: fontSize.sm,
              }}
            >
              {error}
            </Text>
          ) : null}

          {message ? (
            <Text
              style={{
                color: isDark ? '#86efac' : '#166534',
                marginBottom: spacing.md,
                fontSize: fontSize.sm,
              }}
            >
              {message}
            </Text>
          ) : null}

          <CustomButton
            title={isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={onRegister}
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
