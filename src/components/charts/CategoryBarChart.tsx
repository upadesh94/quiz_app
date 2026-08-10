import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClassBarPoint } from '../../types/models';

type Props = {
  title: string;
  data: ClassBarPoint[];
  suffix?: string;
  isDark?: boolean;
};

export function CategoryBarChart({ title, data, suffix = '%', isDark = false }: Props) {
  if (data.length === 0) {
    return (
      <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
        <Text style={[styles.emptyTitle, isDark && styles.titleDark]}>{title}</Text>
        <Text style={[styles.emptyText, isDark && styles.textDark]}>No data available for this filter.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      <View style={styles.list}>
        {data.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={[styles.label, isDark && styles.textDark]}>{item.label}</Text>
            <View style={[styles.track, isDark && styles.trackDark]}>
              <View
                style={[
                  styles.fill,
                  isDark && styles.fillDark,
                  {
                    width: `${Math.max((item.value / maxValue) * 100, 5)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.value, isDark && styles.valueDark]}>{item.value}{suffix}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    width: 90,
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#16a34a',
  },
  value: {
    width: 58,
    textAlign: 'right',
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
  },
  containerDark: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 1,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#cbd5e1',
  },
  valueDark: {
    color: '#f8fafc',
  },
  trackDark: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
  },
  fillDark: {
    backgroundColor: '#4ade80',
  },
  emptyStateDark: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 1,
  },
});
