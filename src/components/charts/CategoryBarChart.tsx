import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClassBarPoint } from '../../types/models';

type Props = {
  title: string;
  data: ClassBarPoint[];
  suffix?: string;
};

export function CategoryBarChart({ title, data, suffix = '%' }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>No data available for this filter.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {data.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.max((item.value / maxValue) * 100, 5)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.value}>{item.value}{suffix}</Text>
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
});
