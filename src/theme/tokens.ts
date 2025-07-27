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
    // Enhanced Text Colors for Visual Hierarchy
    text: {
      primary: '#1a202c',     // Headlines, key content
      secondary: '#4a5568',   // Subheadings, secondary content
      tertiary: '#718096',    // Captions, metadata
      muted: '#a0aec0',       // Disabled text, placeholders
      inverse: '#ffffff',     // Text on dark backgrounds
      onGradient: '#ffffff',  // Text on gradient backgrounds
      success: '#38a169',     // Success messages
      warning: '#d69e2e',     // Warning messages
      error: '#e53e3e',       // Error messages
      info: '#3182ce',        // Info messages
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

  // Enhanced Typography Scale for Visual Hierarchy
  typography: {
    fontFamily: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
      mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSize: {
      // Enhanced scale for better hierarchy
      xs: '0.75rem',     // 12px - Captions, labels
      sm: '0.875rem',    // 14px - Secondary text
      base: '1rem',      // 16px - Body text
      lg: '1.125rem',    // 18px - Emphasized text
      xl: '1.25rem',     // 20px - Subheadings
      '2xl': '1.5rem',   // 24px - Card titles
      '3xl': '1.875rem', // 30px - Section headers
      '4xl': '2.25rem',  // 36px - Page titles
      '5xl': '3rem',     // 48px - Hero headings
      '6xl': '3.75rem',  // 60px - Large displays
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Enhanced Shadows - Elevation system for Visual Hierarchy
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
    '3xl': '0 35px 60px rgba(0, 0, 0, 0.2)',
    // Special effects
    glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
    glow: '0 0 0 1px rgba(102, 126, 234, 0.3)',
    glowLarge: '0 0 0 3px rgba(102, 126, 234, 0.2)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    // Colored shadows for emphasis
    brand: '0 4px 14px rgba(102, 126, 234, 0.25)',
    brandLarge: '0 8px 30px rgba(102, 126, 234, 0.3)',
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
  // Visual Hierarchy Levels
  hierarchy: {
    levels: {
      // Level 1: Primary content (hero sections, main titles)
      primary: {
        fontSize: '3xl',
        fontWeight: 'bold',
        lineHeight: 'tight',
        letterSpacing: 'tight',
        color: 'primary',
      },
      // Level 2: Secondary headings (section titles)
      secondary: {
        fontSize: '2xl',
        fontWeight: 'semibold',
        lineHeight: 'snug',
        letterSpacing: 'normal',
        color: 'secondary',
      },
      // Level 3: Tertiary headings (card titles, subsections)
      tertiary: {
        fontSize: 'xl',
        fontWeight: 'medium',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: 'secondary',
      },
      // Level 4: Body text
      body: {
        fontSize: 'base',
        fontWeight: 'normal',
        lineHeight: 'relaxed',
        letterSpacing: 'normal',
        color: 'primary',
      },
      // Level 5: Captions and metadata
      caption: {
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'wide',
        color: 'tertiary',
      },
    },
  },

  // Component Elevation Levels
  elevation: {
    // Surface levels for visual hierarchy
    base: 0,        // Background level
    raised: 1,      // Cards, buttons
    overlay: 2,     // Dropdowns, tooltips
    modal: 3,       // Modals, drawers
    popover: 4,     // Popovers, floating elements
    tooltip: 5,     // Tooltips, highest level
  },

} as const;

// Enhanced Type definitions for design tokens
export type DesignTokens = typeof designTokens;
export type BrandColors = keyof typeof designTokens.colors.brand;
export type SemanticColors = keyof typeof designTokens.colors.semantic;
export type TextColors = keyof typeof designTokens.colors.text;
export type SpacingScale = keyof typeof designTokens.spacing;
export type BorderRadiusScale = keyof typeof designTokens.borderRadius;
export type TypographySize = keyof typeof designTokens.typography.fontSize;
export type TypographyWeight = keyof typeof designTokens.typography.fontWeight;
export type ShadowScale = keyof typeof designTokens.shadows;
export type HierarchyLevel = keyof typeof designTokens.hierarchy.levels;
export type ElevationLevel = keyof typeof designTokens.elevation;