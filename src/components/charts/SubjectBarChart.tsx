import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubjectAnalytics } from '../../types/models';

type Props = {
  data: SubjectAnalytics[];
  isDark?: boolean;
};

export function SubjectBarChart({ data, isDark = false }: Props) {
  if (data.length === 0) {
    return (
      <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
        <Text style={[styles.emptyStateText, isDark && styles.textDark]}>No subject analytics available yet.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Subject-wise Performance</Text>
      <View style={styles.list}>
        {data.map((item) => (
          <View key={item.subject} style={styles.row}>
            <Text style={[styles.subjectLabel, isDark && styles.textDark]}>{item.subject}</Text>
            <View style={[styles.track, isDark && styles.trackDark]}>
              <View
                style={[
                  styles.fill,
                  isDark && styles.fillDark,
                  {
                    width: `${Math.min(Math.max(item.averagePercentage, 0), 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.valueLabel, isDark && styles.valueDark]}>{item.averagePercentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectLabel: {
    width: 90,
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
  },
  valueLabel: {
    width: 50,
    textAlign: 'right',
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
  emptyState: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  emptyStateText: {
    color: '#475569',
    fontSize: 14,
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
  trackDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  fillDark: {
    backgroundColor: '#38bdf8',
  },
  valueDark: {
    color: '#f8fafc',
  },
  emptyStateDark: {
    backgroundColor: 'rgba(15, 10, 44, 0.88)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 1,
  },
});
