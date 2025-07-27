import { forwardRef } from 'react';
import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';

/**
 * GradientButton Component
 * 
 * Standardized gradient button component for consistent branding.
 * Provides the signature purple gradient with optimized hover states and accessibility.
 */

export interface GradientButtonProps extends ButtonProps {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Enable glow effect on hover */
  glowOnHover?: boolean;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    glowOnHover = true,
    children, 
    ...props 
  }, ref) => {
    // Size configurations
    const sizeConfig = {
      sm: {
        px: 4,
        py: 2,
        fontSize: 'sm',
        borderRadius: 'lg',
      },
      md: {
        px: 6,
        py: 3,
        fontSize: 'md',
        borderRadius: 'xl',
      },
      lg: {
        px: 8,
        py: 4,
        fontSize: 'lg',
        borderRadius: 'xl',
      },
    };

    // Variant configurations
    const variantConfig = {
      primary: {
        bg: designTokens.colors.brand.gradient,
        color: 'white',
        border: 'none',
        borderColor: 'transparent',
        _hover: {
          bg: designTokens.colors.brand.gradientHover,
          transform: 'translateY(-2px)',
          boxShadow: glowOnHover 
            ? `0 10px 30px rgba(102, 126, 234, 0.4)` 
            : designTokens.shadows.lg,
        },
        _active: {
          transform: 'translateY(0)',
          boxShadow: designTokens.shadows.md,
        },
        _focus: {
          boxShadow: `${designTokens.shadows.glow}, ${designTokens.shadows.lg}`,
        },
      },
      secondary: {
        bg: 'white',
        color: 'brand.500',
        border: '2px solid',
        borderColor: 'brand.500',
        _hover: {
          bg: 'brand.50',
          transform: 'translateY(-1px)',
          boxShadow: designTokens.shadows.md,
        },
        _active: {
          transform: 'translateY(0)',
          bg: 'brand.100',
        },
        _focus: {
          boxShadow: designTokens.shadows.glow,
        },
      },
      outline: {
        bg: 'transparent',
        color: 'brand.500',
        border: '2px solid',
        borderColor: 'brand.300',
        _hover: {
          borderColor: 'brand.500',
          color: 'brand.600',
          transform: 'translateY(-1px)',
        },
        _active: {
          transform: 'translateY(0)',
          borderColor: 'brand.600',
        },
        _focus: {
          boxShadow: designTokens.shadows.glow,
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'brand.500',
        border: 'none',
        borderColor: 'transparent',
        _hover: {
          bg: 'brand.50',
          color: 'brand.600',
        },
        _active: {
          bg: 'brand.100',
        },
        _focus: {
          boxShadow: designTokens.shadows.glow,
        },
      },
    };

    const currentSize = sizeConfig[size];
    const currentVariant = variantConfig[variant];

    return (
      <Button
        ref={ref}
        // Size props
        px={currentSize.px}
        py={currentSize.py}
        fontSize={currentSize.fontSize}
        borderRadius={currentSize.borderRadius}
        // Variant props
        bg={currentVariant.bg}
        color={currentVariant.color}
        border={currentVariant.border}
        borderColor={currentVariant.borderColor}
        // Animation and interaction
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        fontWeight="semibold"
        _hover={currentVariant._hover}
        _active={currentVariant._active}
        _focus={currentVariant._focus}
        // Accessibility
        _disabled={{
          opacity: 0.6,
          cursor: 'not-allowed',
          transform: 'none',
          _hover: {},
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GradientButton.displayName = 'GradientButton';

export default GradientButton;

/**
 * Usage Examples:
 * 
 * // Primary gradient button (default)
 * <GradientButton onClick={handleClick}>
 *   새로운 추억 만들기
 * </GradientButton>
 * 
 * // Secondary style
 * <GradientButton variant="secondary" size="lg">
 *   갤러리 보기
 * </GradientButton>
 * 
 * // Outline style for secondary actions
 * <GradientButton variant="outline" size="sm">
 *   취소
 * </GradientButton>
 * 
 * // Ghost style for subtle actions
 * <GradientButton variant="ghost">
 *   더 보기
 * </GradientButton>
 * 
 * // With icons and custom props
 * <GradientButton 
 *   leftIcon={<span>✨</span>} 
 *   glowOnHover={false}
 *   isLoading={loading}
 * >
 *   저장하기
 * </GradientButton>
 */