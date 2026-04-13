import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { RootStackParamList } from '../../navigation/types';
import { AuthService } from '../../services/auth/AuthService';
import { ErrorHandler } from '../../services/utils/ErrorHandler';
import { useResponsive } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation, route }: Props) {
  const { fontSize, spacing, containerPadding, isTablet } = useResponsive();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState('10');
  const [mobileNumber, setMobileNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobileNumber, setParentMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('other');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onRegister = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await AuthService.register({
        username,
        password,
        fullName,
        role: route.params.role,
        classLevel: route.params.role === 'student' ? (Number(classLevel) as 8 | 9 | 10) : undefined,
        mobileNumber: route.params.role === 'student' ? mobileNumber : undefined,
        parentName: route.params.role === 'student' ? parentName : undefined,
        parentMobileNumber: route.params.role === 'student' ? parentMobileNumber : undefined,
        email,
        address,
        rollNumber,
        section,
        admissionNumber,
        dateOfBirth,
        gender: gender as 'male' | 'female' | 'other',
      });

      if (result.requiresApproval && route.params.role === 'student') {
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
    <ScrollView style={{ flex: 1, backgroundColor: '#eef7ff' }}>
      <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
        <View
          style={{
            maxWidth: isTablet ? 500 : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: fontSize['3xl'],
              fontWeight: '700',
              marginBottom: spacing.md,
              color: '#0f172a',
            }}
          >
            📝 Register ({route.params.role})
          </Text>
          <Text
            style={{
              fontSize: fontSize.base,
              marginBottom: spacing.lg,
              color: '#334155',
              lineHeight: fontSize.base * 1.5,
            }}
          >
            Create your account to start quizzes
          </Text>

          <CustomInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
          />
          <CustomInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
          />
          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          {route.params.role === 'student' ? (
            <>
              <CustomInput
                label="Class"
                value={classLevel}
                onChangeText={setClassLevel}
                placeholder="Class (8/9/10)"
              />
              <CustomInput
                label="Mobile Number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="10-digit number"
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
                label="Section"
                value={section}
                onChangeText={setSection}
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
              />
              <CustomInput
                label="Gender"
                value={gender}
                onChangeText={setGender}
                placeholder="male/female/other"
              />
            </>
          ) : null}

          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Optional email"
          />
          <CustomInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Optional address"
          />

          {error ? (
            <Text
              style={{
                color: '#dc2626',
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
                color: '#166534',
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
