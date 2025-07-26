import React from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  useBreakpointValue
} from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';
import GlassCard from './GlassCard';

/**
 * HeroSection Component
 * 
 * Responsive hero section component with flexible content layout.
 * Optimized for different screen sizes with automatic text scaling and spacing.
 */

export interface HeroSectionProps extends BoxProps {
  /** Main heading text */
  title: string;
  /** Subtitle or description text */
  subtitle?: string;
  /** Action buttons or CTA elements */
  actions?: React.ReactNode;
  /** Hero image or visual element */
  visual?: React.ReactNode;
  /** Layout style */
  variant?: 'centered' | 'split' | 'minimal' | 'card';
  /** Background variant */
  background?: 'gradient' | 'glass' | 'transparent';
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Enable animations */
  animated?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  actions,
  visual,
  variant = 'centered',
  background = 'glass',
  textAlign = 'center',
  animated = true,
  children,
  ...props
}) => {
  // Responsive text sizes
  const titleSize = useBreakpointValue({
    base: '2xl',
    md: '3xl',
    lg: '4xl',
    xl: '5xl',
  });

  const subtitleSize = useBreakpointValue({
    base: 'md',
    md: 'lg',
    lg: 'xl',
  });

  // Responsive spacing
  const sectionPadding = useBreakpointValue({
    base: designTokens.spacing.md,
    md: designTokens.spacing.lg,
    lg: designTokens.spacing.xl,
  });

  const contentSpacing = useBreakpointValue({
    base: 4,
    md: 6,
    lg: 8,
  });

  // Background configurations
  const backgroundConfig = {
    gradient: {
      bg: designTokens.colors.brand.gradient,
      color: 'white',
    },
    glass: {
      bg: designTokens.colors.glass.background,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${designTokens.colors.glass.border}`,
      borderRadius: '3xl',
      boxShadow: designTokens.shadows['2xl'],
    },
    transparent: {
      bg: 'transparent',
    },
  };

  const currentBg = backgroundConfig[background];

  // Layout variants
  const renderContent = () => {
    const content = (
      <VStack spacing={contentSpacing} align={textAlign === 'center' ? 'center' : 'flex-start'}>
        {/* Title */}
        <Text
          fontSize={titleSize}
          fontWeight="bold"
          bgGradient="linear(45deg, #667eea, #764ba2)"
          bgClip="text"
          textAlign={textAlign}
          lineHeight="shorter"
          maxW="4xl"
          // Animation
          transform={animated ? 'translateY(20px)' : undefined}
          opacity={animated ? 0 : 1}
          animation={animated ? 'slideUp 0.6s ease-out forwards' : undefined}
        >
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            fontSize={subtitleSize}
            color="gray.600"
            textAlign={textAlign}
            maxW="2xl"
            lineHeight="normal"
            // Animation
            transform={animated ? 'translateY(20px)' : undefined}
            opacity={animated ? 0 : 1}
            animation={animated ? 'slideUp 0.6s ease-out 0.2s forwards' : undefined}
          >
            {subtitle}
          </Text>
        )}

        {/* Actions */}
        {actions && (
          <Box
            mt={4}
            // Animation
            transform={animated ? 'translateY(20px)' : undefined}
            opacity={animated ? 0 : 1}
            animation={animated ? 'slideUp 0.6s ease-out 0.4s forwards' : undefined}
          >
            {actions}
          </Box>
        )}

        {/* Custom children */}
        {children && (
          <Box
            mt={2}
            // Animation
            transform={animated ? 'translateY(20px)' : undefined}
            opacity={animated ? 0 : 1}
            animation={animated ? 'slideUp 0.6s ease-out 0.6s forwards' : undefined}
          >
            {children}
          </Box>
        )}
      </VStack>
    );

    switch (variant) {
      case 'split':
        return (
          <HStack
            spacing={contentSpacing}
            align="center"
            direction={{ base: 'column', lg: 'row' }}
          >
            <Box flex="1">{content}</Box>
            {visual && (
              <Box 
                flex="1" 
                maxW={{ base: '100%', lg: '50%' }}
                // Animation
                transform={animated ? 'translateX(20px)' : undefined}
                opacity={animated ? 0 : 1}
                animation={animated ? 'slideLeft 0.6s ease-out 0.3s forwards' : undefined}
              >
                {visual}
              </Box>
            )}
          </HStack>
        );

      case 'minimal':
        return (
          <VStack spacing={2} align={textAlign === 'center' ? 'center' : 'flex-start'}>
            <Text
              fontSize={subtitleSize}
              fontWeight="bold"
              color="gray.700"
              textAlign={textAlign}
            >
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="sm" color="gray.500" textAlign={textAlign}>
                {subtitle}
              </Text>
            )}
            {actions}
          </VStack>
        );

      case 'card':
        return (
          <GlassCard p={sectionPadding} variant="strong">
            {content}
          </GlassCard>
        );

      case 'centered':
      default:
        return content;
    }
  };

  // Wrapper component
  const Wrapper = variant === 'card' ? Box : background === 'glass' ? GlassCard : Box;

  return (
    <>
      {/* CSS Animations */}
      {animated && (
        <style>
          {`
            @keyframes slideUp {
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            @keyframes slideLeft {
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}
        </style>
      )}

      <Wrapper
        p={variant === 'card' ? 0 : sectionPadding}
        textAlign={textAlign}
        {...(background !== 'transparent' && variant !== 'card' ? currentBg : {})}
        {...props}
      >
        {renderContent()}
      </Wrapper>
    </>
  );
};

export default HeroSection;

/**
 * Usage Examples:
 * 
 * // Basic centered hero
 * <HeroSection
 *   title="안녕하세요! 오늘도 특별한 하루를 기록해보세요 ✨"
 *   subtitle="당신의 소중한 순간들이 아름다운 추억으로 남을 수 있도록 도와드릴게요"
 *   actions={<GradientButton>시작하기</GradientButton>}
 * />
 * 
 * // Split layout with visual
 * <HeroSection
 *   variant="split"
 *   title="Create Beautiful Memories"
 *   subtitle="Share your moments with the world"
 *   visual={<Image src="/hero-image.jpg" />}
 * />
 * 
 * // Card style hero
 * <HeroSection
 *   variant="card"
 *   title="Welcome Back!"
 *   subtitle="Continue your memory journey"
 * />
 * 
 * // Minimal style for sections
 * <HeroSection
 *   variant="minimal"
 *   title="Recent Memories"
 *   textAlign="left"
 * />
 */