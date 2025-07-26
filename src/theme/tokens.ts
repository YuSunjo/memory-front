/**
 * Design Tokens System
 * Foundational design values for consistent UI across the memory platform
 */

export const designTokens = {
  // Brand Colors - Core visual identity
  colors: {
    brand: {
      primary: '#667eea',
      secondary: '#764ba2',
      gradient: 'linear-gradient(45deg, #667eea, #764ba2)',
      gradientHover: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
    },
    // Semantic Colors - Feature-specific branding
    semantic: {
      memory: '#667eea',      // Individual memories
      together: '#e66465',    // Shared memories  
      discovery: '#f093fb',   // Public exploration
      quest: '#4facfe',       // Adventure/quests
    },
    // Glass Effects
    glass: {
      background: 'rgba(255, 255, 255, 0.95)',
      backgroundLight: 'rgba(255, 255, 255, 0.8)',
      backgroundDark: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(31, 38, 135, 0.37)',
    },
    // Text Colors
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
      tertiary: '#718096',
      onGradient: '#ffffff',
    },
  },

  // Spacing System - Consistent spacing throughout app
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
    '3xl': '6rem',  // 96px
  },

  // Border Radius - Consistent roundedness
  borderRadius: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
    '2xl': '2rem',  // 32px
    '3xl': '3rem',  // 48px
    full: '9999px',
  },

  // Typography Scale
  typography: {
    fontFamily: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Shadows - Elevation system
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
    glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
    glow: '0 0 0 1px rgba(102, 126, 234, 0.3)',
  },

  // Breakpoints - Responsive design
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },

  // Animation Timing
  animation: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Type definitions for design tokens
export type DesignTokens = typeof designTokens;
export type BrandColors = keyof typeof designTokens.colors.brand;
export type SemanticColors = keyof typeof designTokens.colors.semantic;
export type SpacingScale = keyof typeof designTokens.spacing;
export type BorderRadiusScale = keyof typeof designTokens.borderRadius;