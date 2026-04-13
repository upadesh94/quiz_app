export const colors = {
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
