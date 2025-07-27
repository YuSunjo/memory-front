import { forwardRef } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';

/**
 * ColorSystem Component
 * 
 * Provides systematic color application with semantic meaning.
 * Includes color variants, states, and accessibility considerations.
 */

export type ColorVariant = 
  | 'brand' 
  | 'memory' 
  | 'together' 
  | 'discovery' 
  | 'quest'
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'neutral';

export type ColorIntensity = 'subtle' | 'moderate' | 'strong' | 'intense';

export interface ColorSystemProps extends Omit<BoxProps, 'border' | 'background'> {
  /** Color variant */
  variant?: ColorVariant;
  /** Color intensity level */
  intensity?: ColorIntensity;
  /** Apply as background color */
  background?: boolean;
  /** Apply as text color */
  text?: boolean;
  /** Apply as border color */
  border?: boolean;
  /** Enable gradient effect */
  gradient?: boolean;
}

const ColorSystem = forwardRef<HTMLDivElement, ColorSystemProps>(
  ({ 
    variant = 'neutral',
    intensity = 'moderate',
    background = true,
    text = false,
    border = false,
    gradient = false,
    children,
    ...props 
  }, ref) => {
    // Color mapping with intensity variations
    const getColorValue = (colorVariant: ColorVariant, colorIntensity: ColorIntensity) => {
      const colorMap = {
        brand: {
          subtle: 'rgba(102, 126, 234, 0.1)',
          moderate: 'rgba(102, 126, 234, 0.2)',
          strong: designTokens.colors.brand.primary,
          intense: designTokens.colors.brand.secondary,
        },
        memory: {
          subtle: 'rgba(102, 126, 234, 0.1)',
          moderate: 'rgba(102, 126, 234, 0.2)',
          strong: designTokens.colors.semantic.memory,
          intense: '#5a6fd8',
        },
        together: {
          subtle: 'rgba(230, 100, 101, 0.1)',
          moderate: 'rgba(230, 100, 101, 0.2)',
          strong: designTokens.colors.semantic.together,
          intense: '#d93c3d',
        },
        discovery: {
          subtle: 'rgba(240, 147, 251, 0.1)',
          moderate: 'rgba(240, 147, 251, 0.2)',
          strong: designTokens.colors.semantic.discovery,
          intense: '#e838f0',
        },
        quest: {
          subtle: 'rgba(79, 172, 254, 0.1)',
          moderate: 'rgba(79, 172, 254, 0.2)',
          strong: designTokens.colors.semantic.quest,
          intense: '#2b9aff',
        },
        success: {
          subtle: 'rgba(56, 161, 105, 0.1)',
          moderate: 'rgba(56, 161, 105, 0.2)',
          strong: designTokens.colors.text.success,
          intense: '#2f855a',
        },
        warning: {
          subtle: 'rgba(214, 158, 46, 0.1)',
          moderate: 'rgba(214, 158, 46, 0.2)',
          strong: designTokens.colors.text.warning,
          intense: '#b7791f',
        },
        error: {
          subtle: 'rgba(229, 62, 62, 0.1)',
          moderate: 'rgba(229, 62, 62, 0.2)',
          strong: designTokens.colors.text.error,
          intense: '#c53030',
        },
        info: {
          subtle: 'rgba(49, 130, 206, 0.1)',
          moderate: 'rgba(49, 130, 206, 0.2)',
          strong: designTokens.colors.text.info,
          intense: '#2c5282',
        },
        neutral: {
          subtle: 'rgba(160, 174, 192, 0.1)',
          moderate: 'rgba(160, 174, 192, 0.2)',
          strong: '#a0aec0',
          intense: '#718096',
        },
      };

      return colorMap[colorVariant][colorIntensity];
    };

    // Text color mapping
    const getTextColor = (colorVariant: ColorVariant, colorIntensity: ColorIntensity) => {
      if (colorIntensity === 'subtle' || colorIntensity === 'moderate') {
        return getColorValue(colorVariant, 'intense');
      }
      return '#ffffff';
    };

    // Border color mapping
    const getBorderColor = (colorVariant: ColorVariant, colorIntensity: ColorIntensity) => {
      if (colorIntensity === 'subtle') {
        return getColorValue(colorVariant, 'moderate');
      }
      return getColorValue(colorVariant, colorIntensity);
    };

    // Gradient mapping
    const getGradient = (colorVariant: ColorVariant) => {
      switch (colorVariant) {
        case 'brand':
        case 'memory':
          return designTokens.colors.brand.gradient;
        case 'together':
          return 'linear-gradient(45deg, #e66465, #d93c3d)';
        case 'discovery':
          return 'linear-gradient(45deg, #f093fb, #e838f0)';
        case 'quest':
          return 'linear-gradient(45deg, #4facfe, #2b9aff)';
        default:
          return designTokens.colors.brand.gradient;
      }
    };

    const colorValue = getColorValue(variant, intensity);
    const textColor = getTextColor(variant, intensity);
    const borderColor = getBorderColor(variant, intensity);
    const gradientValue = getGradient(variant);

    const colorProps: Partial<BoxProps> = {};

    if (gradient) {
      colorProps.bg = gradientValue;
      colorProps.color = '#ffffff';
    } else {
      if (background) colorProps.bg = colorValue;
      if (text) colorProps.color = textColor;
      if (border) {
        colorProps.border = '1px solid';
        colorProps.borderColor = borderColor;
      }
    }

    return (
      <Box
        ref={ref}
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        {...colorProps}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

ColorSystem.displayName = 'ColorSystem';

// Convenience components for semantic colors
export const BrandBox = forwardRef<HTMLDivElement, Omit<ColorSystemProps, 'variant'>>((props, ref) => (
  <ColorSystem ref={ref} variant="brand" {...props} />
));

export const SuccessBox = forwardRef<HTMLDivElement, Omit<ColorSystemProps, 'variant'>>((props, ref) => (
  <ColorSystem ref={ref} variant="success" {...props} />
));

export const WarningBox = forwardRef<HTMLDivElement, Omit<ColorSystemProps, 'variant'>>((props, ref) => (
  <ColorSystem ref={ref} variant="warning" {...props} />
));

export const ErrorBox = forwardRef<HTMLDivElement, Omit<ColorSystemProps, 'variant'>>((props, ref) => (
  <ColorSystem ref={ref} variant="error" {...props} />
));

export const InfoBox = forwardRef<HTMLDivElement, Omit<ColorSystemProps, 'variant'>>((props, ref) => (
  <ColorSystem ref={ref} variant="info" {...props} />
));

BrandBox.displayName = 'BrandBox';
SuccessBox.displayName = 'SuccessBox';
WarningBox.displayName = 'WarningBox';
ErrorBox.displayName = 'ErrorBox';
InfoBox.displayName = 'InfoBox';

export default ColorSystem;

/**
 * Usage Examples:
 * 
 * // Basic color application
 * <ColorSystem variant="brand" intensity="subtle">Subtle brand background</ColorSystem>
 * <ColorSystem variant="success" intensity="strong">Strong success color</ColorSystem>
 * 
 * // Text coloring
 * <ColorSystem variant="error" text background={false}>Error text</ColorSystem>
 * 
 * // Border styling
 * <ColorSystem variant="brand" border background={false}>Bordered element</ColorSystem>
 * 
 * // Gradient effects
 * <ColorSystem variant="brand" gradient>Gradient background</ColorSystem>
 * 
 * // Convenience components
 * <BrandBox intensity="subtle" p={4}>Brand-colored box</BrandBox>
 * <SuccessBox p={3}>Success message box</SuccessBox>
 * <ErrorBox intensity="moderate" border>Error state box</ErrorBox>
 */