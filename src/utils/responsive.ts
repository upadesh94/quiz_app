import { useWindowDimensions } from 'react-native';

/**
 * Responsive design utilities for tablet and phone optimization
 */

export interface ResponsiveValues {
  isTablet: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  containerPadding: number;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  buttonHeight: number;
  inputHeight: number;
  maxContentWidth: number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Determine if device is tablet (width > 600 or width > 800 in landscape)
  const isTablet = width > 600;

  const getSpacing = () => {
    if (isTablet) {
      return {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      };
    }
    return {
      xs: 3,
      sm: 6,
      md: 12,
      lg: 16,
      xl: 24,
    };
  };

  const getFontSize = () => {
    if (isTablet) {
      return {
        xs: 10,
        sm: 12,
        base: 14,
        lg: 18,
        xl: 22,
        '2xl': 28,
        '3xl': 36,
      };
    }
    return {
      xs: 9,
      sm: 11,
      base: 13,
      lg: 16,
      xl: 20,
      '2xl': 25,
      '3xl': 32,
    };
  };

  const getContainerPadding = () => {
    if (isTablet) {
      return isLandscape ? 32 : 24;
    }
    return isLandscape ? 16 : 12;
  };

  const getButtonHeight = () => {
    return isTablet ? 56 : 48;
  };

  const getInputHeight = () => {
    return isTablet ? 56 : 48;
  };

  const getMaxContentWidth = () => {
    if (isTablet) {
      return Math.min(width - 48, 800);
    }
    return width - 24;
  };

  return {
    isTablet,
    isLandscape,
    screenWidth: width,
    screenHeight: height,
    containerPadding: getContainerPadding(),
    spacing: getSpacing(),
    fontSize: getFontSize(),
    buttonHeight: getButtonHeight(),
    inputHeight: getInputHeight(),
    maxContentWidth: getMaxContentWidth(),
  };
}

export function getGridColumns(screenWidth: number, isTablet: boolean): number {
  if (!isTablet) return 1;
  if (screenWidth < 768) return 2;
  return 3;
}
