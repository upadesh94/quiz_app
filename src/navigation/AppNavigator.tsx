import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/common/SplashScreen';
import { LandingScreen } from '../screens/common/LandingScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { SuperAdminLoginScreen } from '../screens/admin/SuperAdminLoginScreen';
import { SuperAdminDashboardScreen } from '../screens/admin/SuperAdminDashboardScreen';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { useAppTheme } from '../utils/theme';
import { useAppSelector } from '../hooks/useAppSelector';

const Stack = createNativeStackNavigator<RootStackParamList>();

function checkIsAdminSecretUrl(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const search = window.location.search || '';
    const pathname = window.location.pathname || '';
    return (
      search.includes('adminPortal') ||
      search.includes('quizapp_superadminupadesh') ||
      search.includes('admin=true') ||
      pathname.includes('/admin')
    );
  }
  return false;
}

export function AppNavigator() {
  const { colors } = useAppTheme();
  const isAdminSecret = checkIsAdminSecretUrl();
  const { token, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Artificial delay to show splash, in a real app this might wait for fonts or auth rehydration
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!isAuthenticated ? (
        // Unauthenticated Stack
        <Stack.Group>
          {isAdminSecret ? (
            <Stack.Screen name="SuperAdminLogin" component={SuperAdminLoginScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: 'QuizMaster' }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            </>
          )}
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
        </Stack.Group>
      ) : (
        // Authenticated Stack
        <Stack.Group>
          {user?.role === 'superadmin' && (
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} options={{ headerShown: false }} />
          )}
          {user?.role === 'teacher' && (
            <Stack.Screen name="TeacherDashboard" component={TeacherNavigator} options={{ headerShown: false }} />
          )}
          {user?.role === 'student' && (
            <Stack.Screen name="StudentDashboard" component={StudentNavigator} options={{ headerShown: false }} />
          )}
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
