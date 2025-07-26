import { forwardRef } from 'react';
import { Text, Heading } from '@chakra-ui/react';
import type { TextProps, HeadingProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';
import type { HierarchyLevel, TypographySize, TypographyWeight } from '../../theme/tokens';

/**
 * Typography Component
 * 
 * Provides systematic typography hierarchy for consistent text styling.
 * Includes semantic variants and responsive scaling.
 */

export interface TypographyProps extends Omit<TextProps, 'size'> {
  /** Typography hierarchy level */
  variant?: HierarchyLevel | 'inherit';
  /** Text semantic role */
  semantic?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted';
  /** Custom font size override */
  size?: TypographySize;
  /** Custom font weight override */
  weight?: TypographyWeight;
  /** Enable responsive scaling */
  responsive?: boolean;
  /** Gradient text effect */
  gradient?: boolean;
}

const Typography = forwardRef<HTMLDivElement, TypographyProps>(
  ({ 
    variant = 'body',
    semantic = 'default',
    size,
    weight,
    responsive = false,
    gradient = false,
    children,
    ...props 
  }, ref) => {
    // Get hierarchy configuration
    const getHierarchyConfig = () => {
      if (variant === 'inherit') return {};
      
      const config = designTokens.hierarchy.levels[variant];
      return {
        fontSize: size || config.fontSize,
        fontWeight: weight || config.fontWeight,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing,
      };
    };

    // Get semantic color
    const getSemanticColor = () => {
      if (gradient) return undefined;
      
      switch (semantic) {
        case 'success': return designTokens.colors.text.success;
        case 'warning': return designTokens.colors.text.warning;
        case 'error': return designTokens.colors.text.error;
        case 'info': return designTokens.colors.text.info;
        case 'muted': return designTokens.colors.text.muted;
        default: return undefined;
      }
    };

    const hierarchyConfig = getHierarchyConfig();
    const semanticColor = getSemanticColor();

    // Responsive font sizes
    const responsiveConfig = responsive ? {
      fontSize: {
        base: `calc(${hierarchyConfig.fontSize} * 0.875)`, // 14/16 = 0.875
        md: hierarchyConfig.fontSize,
        lg: `calc(${hierarchyConfig.fontSize} * 1.125)`, // 18/16 = 1.125
      }
    } : {};

    // Gradient text configuration
    const gradientConfig = gradient ? {
      bgGradient: designTokens.colors.brand.gradient,
      bgClip: 'text',
      color: 'transparent',
    } : {};

    const commonProps = {
      ref,
      color: semanticColor,
      fontFamily: designTokens.typography.fontFamily.body,
      ...hierarchyConfig,
      ...responsiveConfig,
      ...gradientConfig,
      transition: `all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`,
      ...props,
    };

    // Use Heading for primary and secondary variants
    if (variant === 'primary' || variant === 'secondary') {
      return (
        <Heading
          as={variant === 'primary' ? 'h1' : 'h2'}
          {...(commonProps as HeadingProps)}
        >
          {children}
        </Heading>
      );
    }

    // Use Text for other variants
    return (
      <Text {...commonProps}>
        {children}
      </Text>
    );
  }
);

Typography.displayName = 'Typography';

// Convenience components for common use cases
export const Title = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="primary" {...props} />
));

export const Subtitle = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="secondary" {...props} />
));

export const Subheading = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="tertiary" {...props} />
));

export const Body = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="body" {...props} />
));

export const Caption = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="caption" {...props} />
));

Title.displayName = 'Title';
Subtitle.displayName = 'Subtitle';
Subheading.displayName = 'Subheading';
Body.displayName = 'Body';
Caption.displayName = 'Caption';

export default Typography;

/**
 * Usage Examples:
 * 
 * // Basic hierarchy
 * <Typography variant="primary">Main Heading</Typography>
 * <Typography variant="body">Body text content</Typography>
 * <Typography variant="caption">Small caption text</Typography>
 * 
 * // Semantic variations
 * <Typography variant="body" semantic="error">Error message</Typography>
 * <Typography variant="body" semantic="success">Success message</Typography>
 * 
 * // Custom overrides
 * <Typography variant="body" size="lg" weight="bold">Custom styled text</Typography>
 * 
 * // Responsive scaling
 * <Typography variant="primary" responsive>Responsive heading</Typography>
 * 
 * // Gradient effect
 * <Typography variant="primary" gradient>Gradient heading</Typography>
 * 
 * // Convenience components
 * <Title>Main Page Title</Title>
 * <Subtitle>Section Subtitle</Subtitle>
 * <Body>Regular paragraph text</Body>
 * <Caption>Small supporting text</Caption>
 */