import { useWindowDimensions } from 'react-native';

/**
 * Responsive design utilities for 320px mobile to large desktop screens
 */

export interface ResponsiveValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
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
    '2xl': number;
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
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const getSpacing = () => {
    if (isDesktop) {
      return { xs: 6, sm: 12, md: 20, lg: 28, xl: 36, '2xl': 48 };
    }
    if (isTablet) {
      return { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 40 };
    }
    // Mobile (320px+)
    return { xs: 4, sm: 8, md: 14, lg: 18, xl: 24, '2xl': 32 };
  };

  const getFontSize = () => {
    if (isDesktop) {
      return { xs: 12, sm: 13, base: 15, lg: 18, xl: 22, '2xl': 28, '3xl': 36 };
    }
    if (isTablet) {
      return { xs: 11, sm: 12, base: 14, lg: 17, xl: 20, '2xl': 26, '3xl': 32 };
    }
    // Mobile (320px+)
    return { xs: 10, sm: 12, base: 14, lg: 16, xl: 18, '2xl': 24, '3xl': 28 };
  };

  const getContainerPadding = () => {
    if (isDesktop) return 36;
    if (isTablet) return 24;
    return 16;
  };

  const getButtonHeight = () => {
    if (isDesktop) return 48;
    if (isTablet) return 46;
    return 44; // Touch target rule (min 44px)
  };

  const getInputHeight = () => {
    if (isDesktop) return 48;
    if (isTablet) return 46;
    return 44; // Touch target rule (min 44px)
  };

  const getMaxContentWidth = () => {
    if (isDesktop) return 1140;
    if (isTablet) return 840;
    return width - 32;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
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

export function getGridColumns(screenWidth: number, isTablet?: boolean): number {
  if (isTablet === false || screenWidth < 640) return 1;
  if (screenWidth < 1024) return 2;
  if (screenWidth < 1400) return 3;
  return 4;
}
