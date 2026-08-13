import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const lightColors = {
  primary: '#2563EB',       // Blue 600
  primaryHover: '#1D4ED8',  // Blue 700
  primaryLight: '#EFF6FF',  // Blue 50
  secondary: '#4F46E5',     // Indigo 600
  secondaryLight: '#EEF2FF',// Indigo 50
  background: '#F8FAFC',    // Slate 50
  surface: '#FFFFFF',       // Pure white
  card: '#FFFFFF',          // Card surface
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8',     // Slate 400
  success: '#16A34A',       // Green 600
  successBg: '#DCFCE7',     // Green 100
  successText: '#15803D',   // Green 700
  error: '#DC2626',         // Red 600
  errorBg: '#FEE2E2',       // Red 100
  errorText: '#B91C1C',     // Red 700
  warning: '#D97706',       // Amber 600
  warningBg: '#FEF3C7',     // Amber 100
  warningText: '#B45309',   // Amber 700
  info: '#0284C7',          // Sky 600
  infoBg: '#E0F2FE',        // Sky 100
  infoText: '#0369A1',      // Sky 700
  border: '#E2E8F0',        // Slate 200
  borderFocus: '#2563EB',   // Slate focus border
  darkBackground: '#020617',
} as const;

export const darkColors = {
  primary: '#3B82F6',       // Blue 500
  primaryHover: '#60A5FA',  // Blue 400
  primaryLight: '#1E3A8A',  // Blue 900/opacity
  secondary: '#6366F1',     // Indigo 500
  secondaryLight: '#312E81',// Indigo 900/opacity
  background: '#0F172A',    // Slate 900
  surface: '#1E293B',       // Slate 800
  card: '#1E293B',          // Slate 800
  textPrimary: '#F8FAFC',   // Slate 50
  textSecondary: '#CBD5E1', // Slate 300
  textMuted: '#64748B',     // Slate 500
  success: '#22C55E',       // Green 500
  successBg: '#064E3B',     // Green 900/dark
  successText: '#86EFAC',   // Green 300
  error: '#EF4444',         // Red 500
  errorBg: '#7F1D1D',       // Red 900/dark
  errorText: '#FCA5A5',     // Red 300
  warning: '#F59E0B',       // Amber 500
  warningBg: '#78350F',     // Amber 900/dark
  warningText: '#FDE68A',   // Amber 300
  info: '#38BDF8',          // Sky 400
  infoBg: '#0C4A6E',        // Sky 900/dark
  infoText: '#BAE6FD',      // Sky 200
  border: '#334155',        // Slate 700
  borderFocus: '#3B82F6',   // Blue focus border
  darkBackground: '#020617',
} as const;

// Backward compatibility
export const colors = lightColors;

export type ThemeColors = typeof lightColors;

export function useAppTheme() {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const themeColors = mode === 'dark' ? darkColors : lightColors;
  return { colors: themeColors, isDark: mode === 'dark' };
}

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
} as const;

export const touchTargets = {
  minHeight: 44,
  minWidth: 44,
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;
