import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * 
 * Provides smooth page transitions with customizable animations.
 * Uses framer-motion for high-performance animations.
 */

export interface PageTransitionProps {
  /** Child components to animate */
  children: React.ReactNode;
  /** Animation variant type */
  variant?: 'slide' | 'fade' | 'scale' | 'slideUp';
  /** Animation duration in seconds */
  duration?: number;
  /** Custom animation delay */
  delay?: number;
}

// Animation variants
const variants = {
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'slide',
  duration = 0.3,
  delay = 0,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[variant]}
        transition={{
          duration,
          delay,
          ease: 'easeInOut',
        }}
        style={{
          width: '100%',
          minHeight: '100%',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;

/**
 * Usage Examples:
 * 
 * // Basic fade transition
 * <PageTransition variant="fade">
 *   <YourPageComponent />
 * </PageTransition>
 * 
 * // Custom slide transition with delay
 * <PageTransition variant="slide" duration={0.5} delay={0.1}>
 *   <YourPageComponent />
 * </PageTransition>
 * 
 * // Scale animation for modal-like pages
 * <PageTransition variant="scale" duration={0.2}>
 *   <YourPageComponent />
 * </PageTransition>
 */