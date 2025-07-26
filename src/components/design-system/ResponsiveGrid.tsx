import React, { forwardRef } from 'react';
import { Grid, Box, useBreakpointValue } from '@chakra-ui/react';
import type { GridProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';

/**
 * ResponsiveGrid Component
 * 
 * Mobile-first responsive grid system that adapts layouts based on screen size.
 * Replaces fixed-width layouts with flexible, responsive alternatives.
 */

export interface ResponsiveGridProps extends GridProps {
  /** Layout pattern for different screen sizes */
  layout?: 'dashboard' | 'gallery' | 'sidebar' | 'cards' | 'custom';
  /** Custom grid template for fine control */
  mobileTemplate?: string;
  tabletTemplate?: string;
  desktopTemplate?: string;
  /** Gap between grid items */
  gap?: string | number;
  /** Enable responsive gap scaling */
  responsiveGap?: boolean;
}

const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    layout = 'dashboard',
    mobileTemplate,
    tabletTemplate,
    desktopTemplate,
    gap,
    responsiveGap = true,
    children,
    ...props 
  }, ref) => {
    // Responsive gap values
    const responsiveGapValue = useBreakpointValue({
      base: responsiveGap ? designTokens.spacing.sm : gap || designTokens.spacing.md,
      md: responsiveGap ? designTokens.spacing.md : gap || designTokens.spacing.lg,
      lg: responsiveGap ? designTokens.spacing.lg : gap || designTokens.spacing.lg,
    });

    // Predefined layout templates
    const layoutTemplates = {
      dashboard: {
        base: '1fr', // Stack vertically on mobile
        md: '1fr', // Still stack on tablet
        lg: '1.5fr 1fr', // Side-by-side on desktop (60/40 split)
      },
      gallery: {
        base: '1fr', // Single column on mobile
        md: 'repeat(2, 1fr)', // Two columns on tablet
        lg: 'repeat(3, 1fr)', // Three columns on desktop
      },
      sidebar: {
        base: '1fr', // Stack on mobile
        md: '1fr', // Stack on tablet
        lg: '300px 1fr', // Fixed sidebar on desktop
      },
      cards: {
        base: '1fr', // Single column on mobile
        md: 'repeat(auto-fit, minmax(300px, 1fr))', // Auto-fit on tablet+
        lg: 'repeat(auto-fit, minmax(350px, 1fr))', // Larger cards on desktop
      },
      custom: {
        base: mobileTemplate || '1fr',
        md: tabletTemplate || mobileTemplate || '1fr',
        lg: desktopTemplate || tabletTemplate || mobileTemplate || '1fr',
      },
    };

    const currentTemplate = layoutTemplates[layout];

    // Get responsive template columns
    const templateColumns = useBreakpointValue({
      base: currentTemplate.base,
      md: currentTemplate.md,
      lg: currentTemplate.lg,
    });

    return (
      <Grid
        ref={ref}
        templateColumns={templateColumns}
        gap={gap || responsiveGapValue}
        width="100%"
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        {...props}
      >
        {children}
      </Grid>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

// Additional component for responsive containers
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  centerContent?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = true,
  centerContent = false,
}) => {
  const maxWidthMap = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%',
  };

  const responsivePadding = useBreakpointValue({
    base: padding ? designTokens.spacing.sm : 0,
    md: padding ? designTokens.spacing.md : 0,
    lg: padding ? designTokens.spacing.lg : 0,
  });

  return (
    <Box
      maxWidth={maxWidthMap[maxWidth]}
      mx={centerContent ? 'auto' : undefined}
      px={responsivePadding}
      width="100%"
    >
      {children}
    </Box>
  );
};

export default ResponsiveGrid;

/**
 * Usage Examples:
 * 
 * // Dashboard layout (replaces fixed 60/40 split)
 * <ResponsiveGrid layout="dashboard">
 *   <Box>Main content (map)</Box>
 *   <Box>Sidebar content</Box>
 * </ResponsiveGrid>
 * 
 * // Gallery grid for memory cards
 * <ResponsiveGrid layout="gallery" gap={6}>
 *   {memories.map(memory => <MemoryCard key={memory.id} />)}
 * </ResponsiveGrid>
 * 
 * // Custom layout with specific templates
 * <ResponsiveGrid
 *   layout="custom"
 *   mobileTemplate="1fr"
 *   tabletTemplate="1fr 1fr"
 *   desktopTemplate="2fr 1fr 1fr"
 * >
 *   <Box>Content 1</Box>
 *   <Box>Content 2</Box>
 *   <Box>Content 3</Box>
 * </ResponsiveGrid>
 * 
 * // Responsive container wrapper
 * <ResponsiveContainer maxWidth="xl" centerContent>
 *   <ResponsiveGrid layout="cards">
 *     {// Card content here}
 *   </ResponsiveGrid>
 * </ResponsiveContainer>
 */