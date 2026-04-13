import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useResponsive } from '../../utils/responsive';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface NotificationsScreenProps {
  badgeCount?: number;
}

export function NotificationsScreen({ badgeCount = 0 }: NotificationsScreenProps) {
  const { fontSize, spacing, containerPadding } = useResponsive();
  const user = useAppSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome!',
      message: 'You have successfully logged in to QuizMaster.',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'teacher') {
      setNotifications((prev) => [
        {
          id: '2',
          title: 'Pending Student Request',
          message: 'You have 1 student registration request waiting for approval.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    }
  }, [user?.role]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#16a34a';
      case 'error':
        return '#dc2626';
      case 'warning':
        return '#ea580c';
      default:
        return '#2563eb';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ paddingHorizontal: containerPadding, paddingVertical: spacing.lg }}>
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.lg,
            color: '#0f172a',
          }}
        >
          🔔 Notifications
        </Text>

        {isLoading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl }}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>You&apos;re all caught up!</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  {
                    borderLeftColor: getTypeColor(notification.type),
                    opacity: notification.read ? 0.6 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1 }}>
                  <Text style={{ fontSize: 20 }}>{getTypeEmoji(notification.type)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: '#0f172a', marginBottom: spacing.xs }}>
                      {notification.title}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: '#334155', lineHeight: fontSize.sm * 1.4 }}>
                      {notification.message}
                    </Text>
                    <Text style={{ fontSize: fontSize.xs, color: '#94a3b8', marginTop: spacing.xs }}>
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
    backgroundColor: '#f8fafc',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#475569',
  },
});
