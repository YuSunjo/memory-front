/**
 * Design System Components
 * 
 * Centralized export for all design system components.
 * Provides consistent, reusable UI components with design tokens integration.
 */

// Core Components
export { default as GlassCard } from './GlassCard';
export type { GlassCardProps } from './GlassCard';

export { default as GradientButton } from './GradientButton';
export type { GradientButtonProps } from './GradientButton';

export { default as ResponsiveGrid, ResponsiveContainer } from './ResponsiveGrid';
export type { ResponsiveGridProps, ResponsiveContainerProps } from './ResponsiveGrid';

// Navigation Components
export { default as MobileNavigation } from './MobileNavigation';
export type { MobileNavigationProps } from './MobileNavigation';

// Layout Components  
export { default as HeroSection } from './HeroSection';
export type { HeroSectionProps } from './HeroSection';

// Phase 4: Enhanced Visual Hierarchy Components
export { default as Typography, Title, Subtitle, Subheading, Body, Caption } from './Typography';
export type { TypographyProps } from './Typography';

export { default as Elevation, Surface, Card, FloatingCard, Modal, Popover, Tooltip } from './Elevation';
export type { ElevationProps } from './Elevation';

export { default as ColorSystem, BrandBox, SuccessBox, WarningBox, ErrorBox, InfoBox } from './ColorSystem';
export type { ColorSystemProps, ColorVariant, ColorIntensity } from './ColorSystem';

// Phase 5.1: Interaction & Animation Components
export { default as PageTransition } from './PageTransition';
export type { PageTransitionProps } from './PageTransition';

export { 
  MemoryCardSkeleton,
  ListItemSkeleton,
  NavigationSkeleton,
  ProfileSkeleton,
  ContentSkeleton 
} from './SkeletonLoader';
export type { SkeletonLoaderProps } from './SkeletonLoader';

export { 
  LikeButton,
  ActionButton 
} from './InteractiveButton';
export type { LikeButtonProps, ActionButtonProps } from './InteractiveButton';

export { 
  ScrollAnimation,
  ParallaxContainer,
  StaggerContainer,
  HoverScale,
  ScrollProgress
} from './ScrollAnimation';
export type { ScrollAnimationProps, ParallaxProps, StaggerContainerProps, HoverScaleProps } from './ScrollAnimation';

// Design Tokens
export { designTokens } from '../../theme/tokens';
export type { DesignTokens, BrandColors, SemanticColors, SpacingScale, BorderRadiusScale } from '../../theme/tokens';

/**
 * Quick Import Examples:
 * 
 * import { GlassCard, GradientButton, ResponsiveGrid } from '@/components/design-system';
 * import { designTokens } from '@/components/design-system';
 */