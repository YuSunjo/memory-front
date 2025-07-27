import { extendTheme } from '@chakra-ui/react';
import { designTokens } from './tokens';

/**
 * Chakra UI Theme Configuration
 * Integrates design tokens with Chakra UI's theme system
 */

const theme = extendTheme({
  // Color palette integration
  colors: {
    brand: {
      50: '#f0f4ff',
      100: '#e5edff',
      200: '#c7d8ff',
      300: '#a9c3ff',
      400: '#8baeff',
      500: designTokens.colors.brand.primary, // #667eea
      600: '#5a6fd8',
      700: '#4e60c6',
      800: '#4251b4',
      900: '#3642a2',
    },
    secondary: {
      50: '#f7f0ff',
      100: '#efe1ff',
      200: '#dfc3ff',
      300: '#cfa5ff',
      400: '#bf87ff',
      500: designTokens.colors.brand.secondary, // #764ba2
      600: '#6a4190',
      700: '#5e377e',
      800: '#522d6c',
      900: '#46235a',
    },
    memory: {
      50: '#f0f4ff',
      100: '#e5edff',
      500: designTokens.colors.semantic.memory,
      600: '#5a6fd8',
    },
    together: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: designTokens.colors.semantic.together,
      600: '#dc2626',
    },
    discovery: {
      50: '#fdf4ff',
      100: '#fae8ff',
      500: designTokens.colors.semantic.discovery,
      600: '#c026d3',
    },
    quest: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: designTokens.colors.semantic.quest,
      600: '#2563eb',
    },
  },

  // Typography system
  fonts: {
    heading: designTokens.typography.fontFamily.heading,
    body: designTokens.typography.fontFamily.body,
  },

  fontSizes: {
    xs: designTokens.typography.fontSize.xs,
    sm: designTokens.typography.fontSize.sm,
    md: designTokens.typography.fontSize.base,
    lg: designTokens.typography.fontSize.lg,
    xl: designTokens.typography.fontSize.xl,
    '2xl': designTokens.typography.fontSize['2xl'],
    '3xl': designTokens.typography.fontSize['3xl'],
    '4xl': designTokens.typography.fontSize['4xl'],
    '5xl': designTokens.typography.fontSize['5xl'],
  },

  fontWeights: {
    normal: designTokens.typography.fontWeight.normal,
    medium: designTokens.typography.fontWeight.medium,
    semibold: designTokens.typography.fontWeight.semibold,
    bold: designTokens.typography.fontWeight.bold,
  },

  lineHeights: {
    shorter: designTokens.typography.lineHeight.tight,
    normal: designTokens.typography.lineHeight.normal,
    taller: designTokens.typography.lineHeight.relaxed,
  },

  // Spacing system
  space: {
    xs: designTokens.spacing.xs,
    sm: designTokens.spacing.sm,
    md: designTokens.spacing.md,
    lg: designTokens.spacing.lg,
    xl: designTokens.spacing.xl,
    '2xl': designTokens.spacing['2xl'],
    '3xl': designTokens.spacing['3xl'],
  },

  // Border radius
  radii: {
    sm: designTokens.borderRadius.sm,
    md: designTokens.borderRadius.md,
    lg: designTokens.borderRadius.lg,
    xl: designTokens.borderRadius.xl,
    '2xl': designTokens.borderRadius['2xl'],
    '3xl': designTokens.borderRadius['3xl'],
    full: designTokens.borderRadius.full,
  },

  // Shadow system
  shadows: {
    sm: designTokens.shadows.sm,
    md: designTokens.shadows.md,
    lg: designTokens.shadows.lg,
    xl: designTokens.shadows.xl,
    '2xl': designTokens.shadows['2xl'],
    glass: designTokens.shadows.glass,
    glow: designTokens.shadows.glow,
  },

  // Breakpoints
  breakpoints: {
    sm: designTokens.breakpoints.mobile,
    md: designTokens.breakpoints.tablet,
    lg: designTokens.breakpoints.desktop,
    xl: designTokens.breakpoints.wide,
  },

  // Global styles
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        fontFamily: 'body',
      },
      '#root': {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },

  // Component customizations
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
        fontWeight: 'semibold',
        transition: `all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`,
      },
      variants: {
        gradient: {
          bg: designTokens.colors.brand.gradient,
          color: 'white',
          _hover: {
            bg: designTokens.colors.brand.gradientHover,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
        glass: {
          bg: designTokens.colors.glass.backgroundLight,
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: designTokens.colors.glass.border,
          _hover: {
            bg: designTokens.colors.glass.background,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'bold',
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.700',
      },
    },
    Input: {
      variants: {
        glass: {
          field: {
            bg: designTokens.colors.glass.backgroundLight,
            backdropFilter: 'blur(10px)',
            border: '2px solid',
            borderColor: 'gray.200',
            borderRadius: 'xl',
            _hover: {
              borderColor: 'brand.300',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: 'glow',
            },
          },
        },
      },
    },
  },
});

export default theme;