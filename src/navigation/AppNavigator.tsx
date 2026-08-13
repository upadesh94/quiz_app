import React from 'react';
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

  return (
    <Stack.Navigator
      initialRouteName={isAdminSecret ? 'SuperAdminLogin' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ title: 'QuizMaster', headerShown: true }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SuperAdminLogin"
        component={SuperAdminLoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SuperAdminDashboard"
        component={SuperAdminDashboardScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Create Account',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Reset Password',
        }}
      />
      <Stack.Screen
        name="StudentDashboard"
        component={StudentNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherDashboard"
        component={TeacherNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
