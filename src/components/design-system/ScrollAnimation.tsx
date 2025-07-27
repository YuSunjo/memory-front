import React from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Box } from '@chakra-ui/react';

/**
 * ScrollAnimation Components
 * 
 * Provides scroll-based animations for enhanced user experience.
 * Includes fade-in, slide-in, scale, and parallax effects.
 */

export interface ScrollAnimationProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Animation type */
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'parallax';
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Trigger animation once or every time it comes into view */
  once?: boolean;
  /** Threshold for triggering animation (0-1) */
  threshold?: number;
  /** Custom margin for intersection observer */
  margin?: string;
}

export interface ParallaxProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Parallax speed multiplier */
  speed?: number;
  /** Direction of parallax effect */
  direction?: 'up' | 'down' | 'left' | 'right';
}

// Animation variants
const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  parallax: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

// Scroll-triggered Animation Component
export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.1,
  margin = '0px',
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    once,
    margin: margin as any,
    amount: threshold,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[animation]}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

// Parallax Component
export const ParallaxContainer: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
}) => {
  const { scrollY } = useScroll();
  
  const transforms = {
    up: useTransform(scrollY, [0, 1000], [0, -speed * 100]),
    down: useTransform(scrollY, [0, 1000], [0, speed * 100]),
    left: useTransform(scrollY, [0, 1000], [0, -speed * 50]),
    right: useTransform(scrollY, [0, 1000], [0, speed * 50]),
  };

  const transform = transforms[direction];

  return (
    <motion.div
      style={{
        y: direction === 'up' || direction === 'down' ? transform : 0,
        x: direction === 'left' || direction === 'right' ? transform : 0,
      }}
    >
      {children}
    </motion.div>
  );
};

// Stagger Animation Container
export interface StaggerContainerProps {
  /** Children to stagger */
  children: React.ReactNode;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Animation type for children */
  childAnimation?: 'fadeIn' | 'slideUp' | 'scale';
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  childAnimation = 'slideUp',
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    once: true,
    amount: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const childVariants = variants[childAnimation];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Hover Scale Animation
export interface HoverScaleProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Scale amount on hover */
  scale?: number;
  /** Animation duration */
  duration?: number;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  duration = 0.2,
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{ duration, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Progress Scroll Indicator
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="3px"
      bg="gray.200"
      zIndex={9999}
    >
      <motion.div
        style={{
          scaleX: scrollYProgress,
          height: '100%',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          transformOrigin: '0%',
        }}
      />
    </Box>
  );
};

export default {
  ScrollAnimation,
  ParallaxContainer,
  StaggerContainer,
  HoverScale,
  ScrollProgress,
};

/**
 * Usage Examples:
 * 
 * // Basic scroll animation
 * <ScrollAnimation animation="slideUp" delay={0.2}>
 *   <MemoryCard memory={memory} />
 * </ScrollAnimation>
 * 
 * // Stagger animation for lists
 * <StaggerContainer staggerDelay={0.1} childAnimation="fadeIn">
 *   {memories.map(memory => (
 *     <MemoryCard key={memory.id} memory={memory} />
 *   ))}
 * </StaggerContainer>
 * 
 * // Parallax background
 * <ParallaxContainer speed={0.3} direction="up">
 *   <BackgroundImage />
 * </ParallaxContainer>
 * 
 * // Hover scale animation
 * <HoverScale scale={1.1}>
 *   <Button>Hover me!</Button>
 * </HoverScale>
 * 
 * // Scroll progress indicator
 * <ScrollProgress />
 */