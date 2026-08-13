import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { StudentDashboard } from '../screens/student/StudentDashboard';
import { AvailableQuizzesScreen } from '../screens/student/AvailableQuizzesScreen';
import { QuizAttemptScreen } from '../screens/student/QuizAttemptScreen';
import { QuizResultScreen } from '../screens/student/QuizResultScreen';
import { PerformanceAnalyticsScreen } from '../screens/student/PerformanceAnalyticsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { NotificationsScreen } from '../screens/common/NotificationsScreen';
import { useAppTheme, radii } from '../utils/theme';

export type StudentHomeStackParamList = {
  StudentDashboard: undefined;
  AvailableQuizzes: undefined;
  PerformanceAnalytics: undefined;
  QuizAttempt: { quizId: string };
  QuizResult: { quizId: string; score: number; totalMarks: number; percentage: number };
};

export type StudentQuizzesStackParamList = {
  AvailableQuizzes: undefined;
  QuizAttempt: { quizId: string };
  QuizResult: { quizId: string; score: number; totalMarks: number; percentage: number };
};

export type StudentAnalyticsStackParamList = {
  PerformanceAnalytics: undefined;
};

export type StudentTabParamList = {
  Home: undefined;
  QuizzesTab: undefined;
  AnalyticsTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

const HomeStack = createNativeStackNavigator<StudentHomeStackParamList>();
const QuizzesStack = createNativeStackNavigator<StudentQuizzesStackParamList>();
const AnalyticsStack = createNativeStackNavigator<StudentAnalyticsStackParamList>();
const Tab = createBottomTabNavigator<StudentTabParamList>();

function StudentTabIcon({
  focused,
  emoji,
  label,
}: {
  focused: boolean;
  emoji: string;
  label: string;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.tabItem,
        {
          borderRadius: radii.md,
          backgroundColor: focused
            ? colors.primaryLight
            : 'transparent',
        },
      ]}
    >
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.tabText,
          {
            color: focused
              ? colors.primary
              : isDark
              ? colors.textSecondary
              : colors.textMuted,
            fontWeight: focused ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function StudentHomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="StudentDashboard" component={StudentDashboard} />
      <HomeStack.Screen name="AvailableQuizzes" component={AvailableQuizzesScreen} />
      <HomeStack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} />
      <HomeStack.Screen name="QuizAttempt" component={QuizAttemptScreen} />
      <HomeStack.Screen name="QuizResult" component={QuizResultScreen} />
    </HomeStack.Navigator>
  );
}

function StudentQuizzesStackScreen() {
  const { colors } = useAppTheme();

  return (
    <QuizzesStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Available Quizzes',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <QuizzesStack.Screen name="AvailableQuizzes" component={AvailableQuizzesScreen} />
      <QuizzesStack.Screen name="QuizAttempt" component={QuizAttemptScreen} />
      <QuizzesStack.Screen name="QuizResult" component={QuizResultScreen} />
    </QuizzesStack.Navigator>
  );
}

function StudentAnalyticsStackScreen() {
  const { colors } = useAppTheme();

  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Performance Analytics',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <AnalyticsStack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} />
    </AnalyticsStack.Navigator>
  );
}

export function StudentNavigator() {
  const { colors } = useAppTheme();

  const tabBarStyle = {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 6,
    paddingTop: 6,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: tabBarStyle,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentHomeStackScreen}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'StudentDashboard';
          const hideTabBar = routeName === 'QuizAttempt';

          return {
            tabBarStyle: [tabBarStyle, hideTabBar ? { display: 'none' } : null],
            tabBarIcon: ({ focused }) => <StudentTabIcon focused={focused} emoji="🏠" label="Home" />,
          };
        }}
      />
      <Tab.Screen
        name="QuizzesTab"
        component={StudentQuizzesStackScreen}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'AvailableQuizzes';
          const hideTabBar = routeName === 'QuizAttempt';

          return {
            tabBarStyle: [tabBarStyle, hideTabBar ? { display: 'none' } : null],
            tabBarIcon: ({ focused }) => <StudentTabIcon focused={focused} emoji="📝" label="Quizzes" />,
          };
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={StudentAnalyticsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <StudentTabIcon focused={focused} emoji="📊" label="Stats" />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => <StudentTabIcon focused={focused} emoji="🔔" label="Alerts" />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <StudentTabIcon focused={focused} emoji="👤" label="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 11,
    marginTop: 2,
  },
});
