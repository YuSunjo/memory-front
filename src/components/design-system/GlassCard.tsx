import { forwardRef } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';

/**
 * GlassCard Component
 * 
 * Optimized glassmorphism card component with performance improvements.
 * Reduces blur effects and provides consistent glass styling across the app.
 * 
 * Performance optimizations:
 * - Selective backdrop-filter usage
 * - Optimized shadow stack
 * - CSS-in-JS with memoization
 */

export interface GlassCardProps extends BoxProps {
  /** Glass effect intensity */
  variant?: 'light' | 'medium' | 'strong';
  /** Enable blur effect (use sparingly for performance) */
  enableBlur?: boolean;
  /** Enable hover animations */
  interactive?: boolean;
  /** Custom glass background override */
  glassBackground?: string;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    variant = 'medium', 
    enableBlur = true, 
    interactive = false, 
    glassBackground,
    children, 
    ...props 
  }, ref) => {
    // Glass effect configurations
    const glassConfig = {
      light: {
        bg: glassBackground || designTokens.colors.glass.backgroundLight,
        border: `1px solid ${designTokens.colors.glass.border}`,
        shadow: designTokens.shadows.md,
      },
      medium: {
        bg: glassBackground || designTokens.colors.glass.background,
        border: `1px solid ${designTokens.colors.glass.border}`,
        shadow: designTokens.shadows.lg,
      },
      strong: {
        bg: glassBackground || designTokens.colors.glass.backgroundDark,
        border: `1px solid ${designTokens.colors.glass.border}`,
        shadow: designTokens.shadows.xl,
      },
    };

    const config = glassConfig[variant];

    return (
      <Box
        ref={ref}
        bg={config.bg}
        border={config.border}
        borderRadius="2xl"
        boxShadow={config.shadow}
        backdropFilter={enableBlur ? 'blur(20px)' : undefined}
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        position="relative"
        overflow="hidden"
        // Interactive hover effects
        _hover={interactive ? {
          transform: 'translateY(-2px)',
          boxShadow: designTokens.shadows['2xl'],
        } : undefined}
        // Accessibility
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        cursor={interactive ? 'pointer' : undefined}
        // Performance optimization - will-change for animated elements
        willChange={interactive ? 'transform' : undefined}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;

/**
 * Usage Examples:
 * 
 * // Basic glass card
 * <GlassCard p={6}>
 *   Content here
 * </GlassCard>
 * 
 * // Interactive card with hover effects
 * <GlassCard interactive onClick={handleClick}>
 *   Clickable content
 * </GlassCard>
 * 
 * // Performance mode - no blur for better performance
 * <GlassCard enableBlur={false} variant="light">
 *   High performance content
 * </GlassCard>
 * 
 * // Strong glass effect for hero sections
 * <GlassCard variant="strong" p={8}>
 *   Hero content
 * </GlassCard>
 */