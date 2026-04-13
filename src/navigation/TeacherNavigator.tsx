import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeacherDashboard } from '../screens/teacher/TeacherDashboard';
import { CreateQuizScreen } from '../screens/teacher/CreateQuizScreen';
import { ManageStudentsScreen } from '../screens/teacher/ManageStudentsScreen';
import { ClassAnalyticsScreen } from '../screens/teacher/ClassAnalyticsScreen';
import { AddQuestionsScreen } from '../screens/teacher/AddQuestionsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { NotificationsScreen } from '../screens/common/NotificationsScreen';
import { StudentService } from '../services/teacher/StudentService';

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

function AnimatedTeacherTabItem({
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
      <View style={styles.notificationIcon}>
        <Text style={styles.tabEmoji}>{emoji}</Text>
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabText, focused ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
    </Animated.View>
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
  return (
    <CreateStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Create Quiz',
        headerStyle: { backgroundColor: '#f0fdf4' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <CreateStack.Screen name="CreateQuiz" component={CreateQuizScreen} />
      <CreateStack.Screen name="AddQuestions" component={AddQuestionsScreen} />
    </CreateStack.Navigator>
  );
}

function TeacherStudentsStackScreen() {
  return (
    <StudentsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Manage Students',
        headerStyle: { backgroundColor: '#f0fdf4' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <StudentsStack.Screen name="ManageStudents" component={ManageStudentsScreen} />
    </StudentsStack.Navigator>
  );
}

function TeacherAnalyticsStackScreen() {
  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Class Analytics',
        headerStyle: { backgroundColor: '#f0fdf4' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <AnalyticsStack.Screen name="ClassAnalytics" component={ClassAnalyticsScreen} />
    </AnalyticsStack.Navigator>
  );
}

export function TeacherNavigator() {
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
        component={TeacherHomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTeacherTabItem focused={focused} emoji="🏠" label="Home" />,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={TeacherCreateStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTeacherTabItem focused={focused} emoji="➕" label="Create" />,
        }}
      />
      <Tab.Screen
        name="StudentsTab"
        component={TeacherStudentsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTeacherTabItem focused={focused} emoji="👥" label="Students" />,
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={TeacherAnalyticsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTeacherTabItem focused={focused} emoji="📊" label="Analytics" />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTeacherTabItem focused={focused} emoji="🔔" label="Alerts" badgeCount={badgeCount} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTeacherTabItem focused={focused} emoji="👤" label="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#064e3b',
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
    backgroundColor: '#065f46',
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
    color: '#dcfce7',
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#064e3b',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
  },
});
