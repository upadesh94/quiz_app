import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { PieSlice } from '../../types/models';

type Props = {
  title: string;
  data: PieSlice[];
};

export function TeacherPieChart({ title, data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 150;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>No data available for this filter.</Text>
      </View>
    );
  }

  let cumulativePercent = 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrap}>
        <Svg width={size} height={size}>
          {data.map((slice, index) => {
            const percent = slice.value / total;
            const dashLength = percent * circumference;
            const dashGap = circumference - dashLength;
            const rotation = cumulativePercent * 360 - 90;
            cumulativePercent += percent;

            return (
              <Circle
                key={`${slice.label}-${index}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${dashGap}`}
                strokeLinecap="butt"
                originX={size / 2}
                originY={size / 2}
                rotation={rotation}
              />
            );
          })}
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.centerValue}>{total}</Text>
          <Text style={styles.centerText}>Total</Text>
        </View>
      </View>

      <View style={styles.legendWrap}>
        {data.map((slice) => (
          <View key={slice.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendLabel}>{slice.label}</Text>
            <Text style={styles.legendValue}>{slice.value}</Text>
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
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  centerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  legendWrap: {
    marginTop: 14,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  legendValue: {
    color: '#0f172a',
    fontSize: 13,
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
