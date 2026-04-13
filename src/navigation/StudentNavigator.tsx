import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { StudentDashboard } from '../screens/student/StudentDashboard';
import { AvailableQuizzesScreen } from '../screens/student/AvailableQuizzesScreen';
import { QuizAttemptScreen } from '../screens/student/QuizAttemptScreen';
import { QuizResultScreen } from '../screens/student/QuizResultScreen';
import { PerformanceAnalyticsScreen } from '../screens/student/PerformanceAnalyticsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { NotificationsScreen } from '../screens/common/NotificationsScreen';

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

function AnimatedStudentTabItem({
  focused,
  emoji,
  label,
}: {
  focused: boolean;
  emoji: string;
  label: string;
}) {
  const scale = useRef(new Animated.Value(focused ? 1.02 : 0.96)).current;
  const translateY = useRef(new Animated.Value(focused ? -3 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.02 : 0.96,
        useNativeDriver: true,
        speed: 20,
        bounciness: 7,
      }),
      Animated.timing(translateY, {
        toValue: focused ? -3 : 0,
        duration: 170,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.tabItem,
        focused ? styles.tabItemActive : styles.tabItemInactive,
        {
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabText, focused ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
    </Animated.View>
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
  return (
    <QuizzesStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Available Quizzes',
        headerStyle: { backgroundColor: '#eef6ff' },
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
  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Performance Analytics',
        headerStyle: { backgroundColor: '#eef6ff' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <AnalyticsStack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} />
    </AnalyticsStack.Navigator>
  );
}

export function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
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
            tabBarStyle: [styles.tabBar, hideTabBar ? { display: 'none' } : null],
            tabBarIcon: ({ focused }) => <AnimatedStudentTabItem focused={focused} emoji="🏠" label="Home" />,
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
            tabBarStyle: [styles.tabBar, hideTabBar ? { display: 'none' } : null],
            tabBarIcon: ({ focused }) => <AnimatedStudentTabItem focused={focused} emoji="📝" label="Quizzes" />,
          };
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={StudentAnalyticsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedStudentTabItem focused={focused} emoji="📊" label="Stats" />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedStudentTabItem focused={focused} emoji="🔔" label="Alerts" />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedStudentTabItem focused={focused} emoji="👤" label="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopWidth: 0,
    elevation: 0,
    height: 76,
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabItem: {
    minWidth: 66,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: '#1e3a8a',
  },
  tabItemInactive: {
    backgroundColor: 'transparent',
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabTextInactive: {
    color: '#bfdbfe',
  },
});
