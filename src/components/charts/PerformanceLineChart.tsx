import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendPoint } from '../../types/models';

type Props = {
  data: TrendPoint[];
};

export function PerformanceLineChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No attempts yet. Complete quizzes to see your trend.</Text>
      </View>
    );
  }

  const highest = Math.max(...data.map((item) => item.percentage), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Performance Trend</Text>
      <View style={styles.chartRow}>
        {data.map((point) => {
          const heightPercentage = Math.max((point.percentage / highest) * 100, 6);

          return (
            <View key={point.label} style={styles.column}>
              <Text style={styles.valueLabel}>{point.percentage}%</Text>
              <View style={styles.columnTrack}>
                <View
                  style={[
                    styles.columnFill,
                    {
                      height: `${heightPercentage}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xLabel}>{point.label}</Text>
            </View>
          );
        })}
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
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    color: '#334155',
    marginBottom: 4,
  },
  columnTrack: {
    width: '100%',
    height: 110,
    borderRadius: 999,
    justifyContent: 'flex-end',
    backgroundColor: '#dbeafe',
    overflow: 'hidden',
  },
  columnFill: {
    width: '100%',
    backgroundColor: '#2563eb',
  },
  xLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
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
