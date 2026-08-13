import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsScreenProps {
  badgeCount?: number;
}

export function NotificationsScreen({ badgeCount = 0 }: NotificationsScreenProps) {
  const { fontSize, spacing, containerPadding } = useResponsive();
  const { colors } = useAppTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const newNotifications: Notification[] = [];
        
        // Base login success notification
        newNotifications.push({
          id: 'login-success',
          title: 'Welcome!',
          message: 'You have successfully logged in to QuizMaster.',
          type: 'success',
          timestamp: new Date().toISOString(), // In a real app this would be login time
          read: true,
        });

        if (user?.role === 'teacher') {
          newNotifications.unshift({
            id: 'teacher-req',
            title: 'Pending Student Request',
            message: 'You have 1 student registration request waiting for approval.',
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
          });
        }

        if (user?.role === 'student' && user?.classLevel) {
          // Fetch quizzes to dynamically generate notifications for newly available quizzes
          const { QuizService } = await import('../../services/quiz/QuizService');
          const availableQuizzes = await QuizService.getAvailableQuizzes();
          
          // Filter for the student's class
          const myClassQuizzes = availableQuizzes.filter(q => q.classLevel === user.classLevel);
          
          myClassQuizzes.forEach(quiz => {
             // Only notify if it's available now (not expired or future)
             const now = new Date().getTime();
             const isFuture = quiz.availableFrom && now < new Date(quiz.availableFrom).getTime();
             const isExpired = quiz.availableUntil && now > new Date(quiz.availableUntil).getTime();
             
             if (!isFuture && !isExpired) {
               newNotifications.unshift({
                 id: `quiz-${quiz.id}`,
                 title: 'New Quiz Arrived! 🚀',
                 message: `A new ${quiz.subject} quiz "${quiz.title}" is available for Class ${user.classLevel}.`,
                 type: 'info',
                 timestamp: quiz.createdAt || new Date().toISOString(),
                 read: false,
               });
             }
          });
        }
        
        // Sort notifications by timestamp descending
        newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [user]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: containerPadding, paddingVertical: spacing.lg }}>
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.lg,
            color: colors.textPrimary,
          }}
        >
          🔔 Notifications
        </Text>

        {isLoading ? (
          <LoadingState type="spinner" message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You're all caught up! Check back later for updates."
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderLeftColor:
                      notification.type === 'success'
                        ? colors.success
                        : notification.type === 'error'
                        ? colors.error
                        : notification.type === 'warning'
                        ? colors.warning
                        : colors.info,
                    opacity: notification.read ? 0.6 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1, alignItems: 'flex-start' }}>
                  <Badge label={notification.type} variant={notification.type} size="sm" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs }}>
                      {notification.title}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.4 }}>
                      {notification.message}
                    </Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs }}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    borderWidth: 1,
  },
});
