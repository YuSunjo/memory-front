import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Center,
  Badge,
  useBreakpointValue 
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { designTokens } from '../../theme/tokens';

/**
 * MobileNavigation Component
 * 
 * Bottom tab navigation optimized for mobile devices.
 * Provides easy thumb-access navigation with visual feedback.
 * Auto-hides on larger screens where desktop navigation is preferred.
 */

export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon: string; // Emoji or icon
  badge?: number; // Optional notification badge
  color?: string; // Optional custom color
}

export interface MobileNavigationProps {
  /** Navigation items configuration */
  items?: NavigationItem[];
  /** Show navigation (auto-hides on desktop) */
  show?: boolean;
  /** Custom height for the navigation bar */
  height?: string;
  /** Enable haptic feedback (for PWA) */
  hapticFeedback?: boolean;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    path: '/',
    label: '홈',
    icon: '🏠',
    color: 'brand.500',
  },
  {
    id: 'memories',
    path: '/my-memories',
    label: '추억',
    icon: '💝',
    color: 'memory.500',
  },
  {
    id: 'create',
    path: '/create-memory',
    label: '만들기',
    icon: '+',
    color: 'brand.500',
  },
  {
    id: 'discover',
    path: '/sharing-memories',
    label: '발견',
    icon: '🌟',
    color: 'discovery.500',
  },
  {
    id: 'profile',
    path: '/profile',
    label: '내정보',
    icon: '👤',
    color: 'gray.600',
  },
];

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items = defaultNavigationItems,
  show: forceShow,
  height = '80px',
  hapticFeedback = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auto-hide on desktop unless forced to show
  const shouldShow = useBreakpointValue({
    base: true,
    lg: forceShow || false,
  });

  // Handle navigation with optional haptic feedback
  const handleNavigate = (path: string) => {
    // Haptic feedback for PWA
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
    
    navigate(path);
  };

  // Don't render if hidden
  if (!shouldShow) return null;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      height={height}
      bg={designTokens.colors.glass.background}
      backdropFilter="blur(20px)"
      borderTop="1px solid"
      borderColor={designTokens.colors.glass.border}
      boxShadow={designTokens.shadows.glass}
      zIndex={designTokens.zIndex.sticky}
      // Safe area support for devices with notches
      paddingBottom="env(safe-area-inset-bottom)"
    >
      <Flex
        height="100%"
        align="center"
        justify="space-around"
        px={2}
      >
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Center
              key={item.id}
              flex="1"
              flexDirection="column"
              cursor="pointer"
              onClick={() => handleNavigate(item.path)}
              transition={`all ${designTokens.animation.fast} ${designTokens.animation.easing.ease}`}
              _active={{
                transform: 'scale(0.95)',
              }}
              // Touch target optimization
              minHeight="60px"
              position="relative"
            >
              {/* Icon with badge */}
              <Box position="relative" mb={1}>
                {item.icon === '+' ? (
                  // Special styling for create button
                  <Center
                    width="40px"
                    height="40px"
                    borderRadius="full"
                    bg={isActive ? item.color : designTokens.colors.brand.gradient}
                    color="white"
                    fontSize="24px"
                    fontWeight="bold"
                    boxShadow={isActive ? designTokens.shadows.glow : designTokens.shadows.md}
                    transform={isActive ? 'scale(1.1)' : 'scale(1)'}
                    transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
                  >
                    {item.icon}
                  </Center>
                ) : (
                  <Text
                    fontSize="24px"
                    color={isActive ? item.color : 'gray.500'}
                    transform={isActive ? 'scale(1.2)' : 'scale(1)'}
                    transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
                  >
                    {item.icon}
                  </Text>
                )}
                
                {/* Notification badge */}
                {item.badge && item.badge > 0 && (
                  <Badge
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    borderRadius="full"
                    bg="red.500"
                    color="white"
                    fontSize="xs"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Box>
              
              {/* Label */}
              <Text
                fontSize="xs"
                fontWeight={isActive ? 'bold' : 'medium'}
                color={isActive ? item.color : 'gray.600'}
                textAlign="center"
                lineHeight="1"
              >
                {item.label}
              </Text>
              
              {/* Active indicator */}
              {isActive && (
                <Box
                  position="absolute"
                  top="-1px"
                  left="50%"
                  transform="translateX(-50%)"
                  width="30px"
                  height="3px"
                  bg={item.color}
                  borderRadius="full"
                />
              )}
            </Center>
          );
        })}
      </Flex>
    </Box>
  );
};

export default MobileNavigation;

/**
 * Usage Examples:
 * 
 * // Basic usage with default navigation items
 * <MobileNavigation />
 * 
 * // Custom navigation items
 * <MobileNavigation 
 *   items={[
 *     { id: 'home', path: '/', label: 'Home', icon: '🏠' },
 *     { id: 'search', path: '/search', label: 'Search', icon: '🔍', badge: 3 },
 *   ]}
 * />
 * 
 * // Force show on desktop for testing
 * <MobileNavigation show={true} />
 * 
 * // Custom height and disable haptic feedback
 * <MobileNavigation 
 *   height="90px" 
 *   hapticFeedback={false} 
 * />
 */