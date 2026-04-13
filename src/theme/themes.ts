export interface AppColors {
  background: string;
  card: string;
  cardAlt: string;
  green: string;
  greenDim: string;
  white: string;
  textMuted: string;
  border: string;
  cyan: string;
  orange: string;
  pink: string;
  yellow: string;
  blue: string;
  purple: string;
  red: string;
  tabActive: string;
  tabInactive: string;
  statusBar: 'light-content' | 'dark-content';
}

export const darkTheme: AppColors = {
  background: '#0A0E1A',
  card: '#131929',
  cardAlt: '#1A2340',
  green: '#39FF7E',
  greenDim: '#1A3D2B',
  white: '#FFFFFF',
  textMuted: '#8891A5',
  border: '#1E2A40',
  cyan: '#00C9C8',
  orange: '#FF8C42',
  pink: '#FF6B9D',
  yellow: '#FFD166',
  blue: '#4A90E2',
  purple: '#A855F7',
  red: '#FF4444',
  tabActive: '#39FF7E',
  tabInactive: '#4A5568',
  statusBar: 'light-content',
};

export const lightTheme: AppColors = {
  background: '#F0F4F8',
  card: '#FFFFFF',
  cardAlt: '#E8EDF5',
  green: '#16A34A',
  greenDim: '#DCFCE7',
  white: '#0F172A',
  textMuted: '#64748B',
  border: '#CBD5E1',
  cyan: '#0891B2',
  orange: '#EA580C',
  pink: '#DB2777',
  yellow: '#CA8A04',
  blue: '#2563EB',
  purple: '#7C3AED',
  red: '#DC2626',
  tabActive: '#16A34A',
  tabInactive: '#94A3B8',
  statusBar: 'dark-content',
};
