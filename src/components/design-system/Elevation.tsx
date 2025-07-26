import { forwardRef } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';
import type { ElevationLevel, ShadowScale } from '../../theme/tokens';

/**
 * Elevation Component
 * 
 * Provides systematic elevation levels for visual hierarchy.
 * Controls shadows, z-index, and layering for depth perception.
 */

export interface ElevationProps extends BoxProps {
  /** Elevation level for the component */
  level?: ElevationLevel;
  /** Custom shadow override */
  shadow?: ShadowScale;
  /** Enable hover elevation increase */
  hoverElevation?: boolean;
  /** Enable focus elevation increase */
  focusElevation?: boolean;
  /** Enable interactive elevation (hover + focus) */
  interactive?: boolean;
}

const Elevation = forwardRef<HTMLDivElement, ElevationProps>(
  ({ 
    level = 'base',
    shadow,
    hoverElevation = false,
    focusElevation = false,
    interactive = false,
    children,
    ...props 
  }, ref) => {
    // Shadow mapping based on elevation level
    const elevationShadows: Record<ElevationLevel, ShadowScale> = {
      base: 'none',
      raised: 'sm',
      overlay: 'md',
      modal: 'xl',
      popover: '2xl',
      tooltip: '3xl',
    };

    // Z-index mapping based on elevation level
    const elevationZIndex: Record<ElevationLevel, number> = {
      base: designTokens.zIndex.base,
      raised: designTokens.zIndex.base + 1,
      overlay: designTokens.zIndex.dropdown,
      modal: designTokens.zIndex.modal,
      popover: designTokens.zIndex.popover,
      tooltip: designTokens.zIndex.tooltip,
    };

    const currentShadow = shadow || elevationShadows[level];
    const currentZIndex = elevationZIndex[level];

    // Interactive states
    const getNextElevationShadow = (currentLevel: ElevationLevel): ShadowScale => {
      const levels: ElevationLevel[] = ['base', 'raised', 'overlay', 'modal', 'popover', 'tooltip'];
      const currentIndex = levels.indexOf(currentLevel);
      const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
      return elevationShadows[levels[nextIndex]];
    };

    const hoverShadow = (hoverElevation || interactive) 
      ? getNextElevationShadow(level) 
      : currentShadow;

    const focusShadow = (focusElevation || interactive) 
      ? getNextElevationShadow(level) 
      : currentShadow;

    return (
      <Box
        ref={ref}
        boxShadow={designTokens.shadows[currentShadow]}
        zIndex={currentZIndex}
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        _hover={hoverElevation || interactive ? {
          boxShadow: designTokens.shadows[hoverShadow],
          transform: 'translateY(-1px)',
        } : undefined}
        _focus={focusElevation || interactive ? {
          boxShadow: `${designTokens.shadows[focusShadow]}, ${designTokens.shadows.glow}`,
          outline: 'none',
        } : undefined}
        _active={interactive ? {
          transform: 'translateY(0)',
          boxShadow: designTokens.shadows[currentShadow],
        } : undefined}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Elevation.displayName = 'Elevation';

// Convenience components for common elevation levels
export const Surface = forwardRef<HTMLDivElement, Omit<ElevationProps, 'level'>>((props, ref) => (
  <Elevation ref={ref} level="base" {...props} />
));

export const Card = forwardRef<HTMLDivElement, Omit<ElevationProps, 'level'>>((props, ref) => (
  <Elevation ref={ref} level="raised" interactive {...props} />
));

export const FloatingCard = forwardRef<HTMLDivElement, Omit<ElevationProps, 'level'>>((props, ref) => (
  <Elevation ref={ref} level="overlay" interactive {...props} />
));

export const Modal = forwardRef<HTMLDivElement, Omit<ElevationProps, 'level'>>((props, ref) => (
  <Elevation ref={ref} level="modal" {...props} />
));

export const Popover = forwardRef<HTMLDivElement, Omit<ElevationProps, 'level'>>((props, ref) => (
  <Elevation ref={ref} level="popover" {...props} />
));

export const Tooltip = forwardRef<HTMLDivElement, Omit<ElevationProps, 'level'>>((props, ref) => (
  <Elevation ref={ref} level="tooltip" {...props} />
));

Surface.displayName = 'Surface';
Card.displayName = 'Card';
FloatingCard.displayName = 'FloatingCard';
Modal.displayName = 'Modal';
Popover.displayName = 'Popover';
Tooltip.displayName = 'Tooltip';

export default Elevation;

/**
 * Usage Examples:
 * 
 * // Basic elevation levels
 * <Elevation level="base">Base surface</Elevation>
 * <Elevation level="raised">Raised card</Elevation>
 * <Elevation level="overlay">Floating element</Elevation>
 * 
 * // Interactive elevation
 * <Elevation level="raised" interactive>
 *   Hover and focus effects
 * </Elevation>
 * 
 * // Custom shadow override
 * <Elevation level="raised" shadow="brand">
 *   Custom branded shadow
 * </Elevation>
 * 
 * // Convenience components
 * <Card p={6}>Card content with interactive elevation</Card>
 * <FloatingCard>Floating overlay content</FloatingCard>
 * <Modal>Modal content with highest elevation</Modal>
 */