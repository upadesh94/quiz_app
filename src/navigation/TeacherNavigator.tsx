import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeacherDashboard } from '../screens/teacher/TeacherDashboard';
import { CreateQuizScreen } from '../screens/teacher/CreateQuizScreen';
import { ManageStudentsScreen } from '../screens/teacher/ManageStudentsScreen';
import { ClassAnalyticsScreen } from '../screens/teacher/ClassAnalyticsScreen';
import { AddQuestionsScreen } from '../screens/teacher/AddQuestionsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { NotificationsScreen } from '../screens/common/NotificationsScreen';
import { StudentService } from '../services/teacher/StudentService';
import { useAppTheme, radii } from '../utils/theme';

export type TeacherHomeStackParamList = {
  TeacherDashboard: undefined;
  CreateQuiz: undefined;
  AddQuestions: { quizId: string };
  ManageStudents: undefined;
  ClassAnalytics: undefined;
};

export type TeacherCreateStackParamList = {
  CreateQuiz: undefined;
  AddQuestions: { quizId: string };
};

export type TeacherStudentsStackParamList = {
  ManageStudents: undefined;
};

export type TeacherAnalyticsStackParamList = {
  ClassAnalytics: undefined;
};

export type TeacherTabParamList = {
  Home: undefined;
  CreateTab: undefined;
  StudentsTab: undefined;
  AnalyticsTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

const HomeStack = createNativeStackNavigator<TeacherHomeStackParamList>();
const CreateStack = createNativeStackNavigator<TeacherCreateStackParamList>();
const StudentsStack = createNativeStackNavigator<TeacherStudentsStackParamList>();
const AnalyticsStack = createNativeStackNavigator<TeacherAnalyticsStackParamList>();
const Tab = createBottomTabNavigator<TeacherTabParamList>();

function TeacherTabIcon({
  focused,
  emoji,
  label,
  badgeCount = 0,
}: {
  focused: boolean;
  emoji: string;
  label: string;
  badgeCount?: number;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.tabItem,
        {
          borderRadius: radii.md,
          backgroundColor: focused ? colors.primaryLight : 'transparent',
        },
      ]}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.tabEmoji}>{emoji}</Text>
        {badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.surface }]}>
            <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.tabText,
          {
            color: focused ? colors.primary : isDark ? colors.textSecondary : colors.textMuted,
            fontWeight: focused ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function TeacherHomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <HomeStack.Screen name="CreateQuiz" component={CreateQuizScreen} />
      <HomeStack.Screen name="AddQuestions" component={AddQuestionsScreen} />
      <HomeStack.Screen name="ManageStudents" component={ManageStudentsScreen} />
      <HomeStack.Screen name="ClassAnalytics" component={ClassAnalyticsScreen} />
    </HomeStack.Navigator>
  );
}

function TeacherCreateStackScreen() {
  const { colors } = useAppTheme();

  return (
    <CreateStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Create Quiz',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <CreateStack.Screen name="CreateQuiz" component={CreateQuizScreen} />
      <CreateStack.Screen name="AddQuestions" component={AddQuestionsScreen} />
    </CreateStack.Navigator>
  );
}

function TeacherStudentsStackScreen() {
  const { colors } = useAppTheme();

  return (
    <StudentsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Manage Students',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <StudentsStack.Screen name="ManageStudents" component={ManageStudentsScreen} />
    </StudentsStack.Navigator>
  );
}

function TeacherAnalyticsStackScreen() {
  const { colors } = useAppTheme();

  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Class Analytics',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <AnalyticsStack.Screen name="ClassAnalytics" component={ClassAnalyticsScreen} />
    </AnalyticsStack.Navigator>
  );
}

export function TeacherNavigator() {
  const { colors } = useAppTheme();
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const requests = await StudentService.getPendingRegistrationRequests();
        setBadgeCount(requests.length);
      } catch (error) {
        console.error('Failed to load pending count:', error);
      }
    };

    loadPendingCount();
    const interval = setInterval(loadPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

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
        component={TeacherHomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TeacherTabIcon focused={focused} emoji="🏠" label="Home" />,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={TeacherCreateStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TeacherTabIcon focused={focused} emoji="➕" label="Create" />,
        }}
      />
      <Tab.Screen
        name="StudentsTab"
        component={TeacherStudentsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TeacherTabIcon focused={focused} emoji="👥" label="Students" />,
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={TeacherAnalyticsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TeacherTabIcon focused={focused} emoji="📊" label="Analytics" />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TeacherTabIcon focused={focused} emoji="🔔" label="Alerts" badgeCount={badgeCount} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TeacherTabIcon focused={focused} emoji="👤" label="Profile" />,
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
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 9,
  },
});
