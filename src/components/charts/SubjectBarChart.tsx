import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubjectAnalytics } from '../../types/models';

type Props = {
  data: SubjectAnalytics[];
};

export function SubjectBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No subject analytics available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject-wise Performance</Text>
      <View style={styles.list}>
        {data.map((item) => (
          <View key={item.subject} style={styles.row}>
            <Text style={styles.subjectLabel}>{item.subject}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(Math.max(item.averagePercentage, 0), 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.valueLabel}>{item.averagePercentage}%</Text>
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
});
