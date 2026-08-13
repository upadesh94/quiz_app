import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ViewStyle } from 'react-native';
import { useAppTheme, radii } from '../../utils/theme';
import { useResponsive } from '../../utils/responsive';
import { EmptyState } from './EmptyState';

export type Column<T> = {
  key: string;
  title: string;
  flex?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (item: T) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  style?: ViewStyle;
  minWidth?: number;
};

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  emptyTitle = 'No data available',
  emptySubtitle = 'There are no records to display at this time.',
  style,
  minWidth = 600,
}: DataTableProps<T>) {
  const { colors, isDark } = useAppTheme();
  const { fontSize, spacing, isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return (
      <View
        style={[
          styles.tableCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radii.md,
          },
          style,
        ]}
      >
        <EmptyState title={emptyTitle} description={emptySubtitle} />
      </View>
    );
  }

  const renderTableContent = () => (
    <View style={[styles.tableContainer, { minWidth: isMobile ? minWidth : '100%' }]}>
      {/* Table Header */}
      <View
        style={[
          styles.headerRow,
          {
            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        {columns.map((col) => (
          <View
            key={col.key}
            style={[
              styles.headerCell,
              col.flex ? { flex: col.flex } : col.width ? { width: col.width } : { flex: 1 },
              { alignItems: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' },
            ]}
          >
            <Text style={[styles.headerText, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              {col.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Table Body */}
      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        const RowWrapper = onRowPress ? Pressable : View;

        return (
          <RowWrapper
            key={keyExtractor(item, index)}
            onPress={onRowPress ? () => onRowPress(item) : undefined}
            style={({ pressed }: { pressed?: boolean }) => [
              styles.bodyRow,
              {
                borderBottomColor: isLast ? 'transparent' : colors.border,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                backgroundColor: index % 2 === 1 ? (isDark ? '#1E293B33' : '#F8FAFC') : colors.card,
              },
              pressed && onRowPress ? { backgroundColor: isDark ? '#334155' : '#E2E8F0' } : null,
            ]}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={[
                  styles.bodyCell,
                  col.flex ? { flex: col.flex } : col.width ? { width: col.width } : { flex: 1 },
                  { alignItems: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' },
                ]}
              >
                {col.render ? (
                  col.render(item, index)
                ) : (
                  <Text style={[styles.cellText, { color: colors.textPrimary, fontSize: fontSize.sm }]}>
                    {String((item as any)[col.key] ?? '')}
                  </Text>
                )}
              </View>
            ))}
          </RowWrapper>
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.tableCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radii.md,
        },
        style,
      ]}
    >
      {isMobile ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTableContent()}
        </ScrollView>
      ) : (
        renderTableContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
  },
  tableContainer: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerCell: {
    paddingRight: 8,
  },
  headerText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  bodyCell: {
    paddingRight: 8,
  },
  cellText: {
    fontWeight: '400',
  },
});
