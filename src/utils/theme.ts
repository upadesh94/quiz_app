import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const lightColors = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#16A34A',
  error: '#DC2626',
  border: '#E2E8F0',
  darkBackground: '#020617',
} as const;

export const darkColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  background: '#0F172A',
  card: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  success: '#22C55E',
  error: '#EF4444',
  border: '#334155',
  darkBackground: '#020617',
} as const;

// Backward compatibility for components not yet refactored to useAppTheme
export const colors = lightColors;

export function useAppTheme() {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const themeColors = mode === 'dark' ? darkColors : lightColors;
  return { colors: themeColors, isDark: mode === 'dark' };
}

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
} as const;

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;
