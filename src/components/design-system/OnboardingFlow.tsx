import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Icon,
  Circle,
  Fade,
  ScaleFade
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@chakra-ui/icons';
import { designTokens } from '../../theme/tokens';

// Onboarding step interface
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon?: React.ComponentType;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
  validation?: () => boolean | Promise<boolean>;
  optional?: boolean;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: (completedSteps: string[]) => void;
  onSkip?: () => void;
  isOpen: boolean;
  onClose: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  autoSave?: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
  onSkip,
  isOpen,
  onClose,
  showProgress = true,
  allowSkip = true,
  autoSave = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Auto-save progress
  useEffect(() => {
    if (autoSave && completedSteps.size > 0) {
      localStorage.setItem(
        'memory-front-onboarding-progress',
        JSON.stringify(Array.from(completedSteps))
      );
    }
  }, [completedSteps, autoSave]);

  // Load saved progress
  useEffect(() => {
    if (autoSave && isOpen) {
      const saved = localStorage.getItem('memory-front-onboarding-progress');
      if (saved) {
        try {
          const savedSteps = JSON.parse(saved);
          setCompletedSteps(new Set(savedSteps));
        } catch (error) {
          console.warn('Failed to load onboarding progress:', error);
        }
      }
    }
  }, [autoSave, isOpen]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = completedSteps.has(currentStepData?.id) || currentStepData?.optional;

  // Validate current step
  const validateStep = useCallback(async (): Promise<boolean> => {
    if (!currentStepData?.validation) return true;

    setIsValidating(true);
    try {
      const isValid = await currentStepData.validation();
      return isValid;
    } catch (error) {
      console.error('Step validation failed:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [currentStepData]);

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!currentStepData) return;

    const isValid = await validateStep();
    if (isValid) {
      // Mark step as completed
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));

      if (isLastStep) {
        // Complete onboarding
        const allCompleted = Array.from(completedSteps);
        allCompleted.push(currentStepData.id);
        onComplete(allCompleted);
        
        if (autoSave) {
          localStorage.removeItem('memory-front-onboarding-progress');
        }
      } else {
        // Go to next step
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStepData, isLastStep, validateStep, completedSteps, onComplete, autoSave]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Handle step click (direct navigation)
  const handleStepClick = useCallback((stepIndex: number) => {
    // Allow going to previous steps or next accessible step
    if (stepIndex <= currentStep || stepIndex === currentStep + 1) {
      setCurrentStep(stepIndex);
    }
  }, [currentStep]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete(Array.from(completedSteps));
    }
    
    if (autoSave) {
      localStorage.removeItem('memory-front-onboarding-progress');
    }
  }, [onSkip, onComplete, completedSteps, autoSave]);

  // Execute step action
  const executeAction = useCallback(async () => {
    if (currentStepData?.action) {
      try {
        await currentStepData.action.onClick();
        // Mark step as completed after action
        setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
      } catch (error) {
        console.error('Step action failed:', error);
      }
    }
  }, [currentStepData]);

  if (!currentStepData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
      closeOnEsc={allowSkip}
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        bg={designTokens.colors.glass.background}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={designTokens.colors.glass.border}
        borderRadius="2xl"
        mx={4}
      >
        <ModalBody p={8}>
          <VStack spacing={6} align="stretch">
            {/* Progress indicator */}
            {showProgress && (
              <VStack spacing={4}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    단계 {currentStep + 1} / {steps.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}% 완료
                  </Text>
                </HStack>
                
                <Progress
                  value={((currentStep + 1) / steps.length) * 100}
                  size="sm"
                  colorScheme="brand"
                  borderRadius="full"
                  bg={designTokens.colors.glass.backgroundLight}
                />

                {/* Step indicators */}
                <HStack spacing={2} justify="center">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = index === currentStep;
                    const isAccessible = index <= currentStep;

                    return (
                      <Circle
                        key={step.id}
                        size="8"
                        bg={
                          isCompleted
                            ? designTokens.colors.brand.primary
                            : isCurrent
                            ? designTokens.colors.brand.secondary
                            : 'gray.300'
                        }
                        color="white"
                        cursor={isAccessible ? 'pointer' : 'default'}
                        onClick={() => isAccessible && handleStepClick(index)}
                        transition={`all ${designTokens.animation.normal}`}
                        _hover={
                          isAccessible
                            ? {
                                transform: 'scale(1.1)',
                                boxShadow: designTokens.shadows.md
                              }
                            : {}
                        }
                      >
                        {isCompleted ? (
                          <Icon as={CheckIcon} boxSize="3" />
                        ) : (
                          <Text fontSize="xs" fontWeight="bold">
                            {index + 1}
                          </Text>
                        )}
                      </Circle>
                    );
                  })}
                </HStack>
              </VStack>
            )}

            {/* Step content */}
            <Fade in={true} key={currentStepData.id}>
              <VStack spacing={6} align="stretch">
                {/* Step header */}
                <VStack spacing={2} textAlign="center">
                  {currentStepData.icon && (
                    <ScaleFade in={true}>
                      <Circle
                        size="16"
                        bg={designTokens.colors.brand.gradient}
                        color="white"
                        mb={2}
                      >
                        <Icon as={currentStepData.icon} boxSize="8" />
                      </Circle>
                    </ScaleFade>
                  )}
                  
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.800"
                    textAlign="center"
                  >
                    {currentStepData.title}
                  </Text>
                  
                  <Text
                    fontSize="md"
                    color="gray.600"
                    textAlign="center"
                    maxW="md"
                  >
                    {currentStepData.description}
                  </Text>
                </VStack>

                {/* Step content */}
                <Box>{currentStepData.content}</Box>

                {/* Step action */}
                {currentStepData.action && (
                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={executeAction}
                    isLoading={isValidating}
                  >
                    {currentStepData.action.label}
                  </Button>
                )}
              </VStack>
            </Fade>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack justify="space-between" w="100%">
            {/* Previous button */}
            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="ghost"
              onClick={handlePrevious}
              isDisabled={currentStep === 0}
            >
              이전
            </Button>

            {/* Skip button */}
            {allowSkip && (
              <Button variant="ghost" onClick={handleSkip} color="gray.500">
                건너뛰기
              </Button>
            )}

            {/* Next/Complete button */}
            <Button
              rightIcon={isLastStep ? undefined : <ChevronRightIcon />}
              colorScheme="brand"
              onClick={handleNext}
              isDisabled={!canGoNext}
              isLoading={isValidating}
            >
              {isLastStep ? '완료' : '다음'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Feature spotlight component
interface FeatureSpotlightProps {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onNext?: () => void;
  onSkip?: () => void;
  isVisible: boolean;
}

export const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  target,
  title,
  description,
  position = 'bottom',
  onNext,
  onSkip,
  isVisible
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isVisible) {
      const element = document.querySelector(target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        const rect = element.getBoundingClientRect();
        const style: React.CSSProperties = {
          position: 'fixed',
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          borderRadius: '12px',
          border: `3px solid ${designTokens.colors.brand.primary}`,
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
          pointerEvents: 'none',
          zIndex: 9998
        };
        
        setSpotlightStyle(style);
      }
    }
  }, [target, isVisible]);

  if (!isVisible || !targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  
  // Calculate tooltip position
  const getTooltipPosition = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 9999,
      maxWidth: '300px'
    };

    switch (position) {
      case 'top':
        return {
          ...base,
          bottom: window.innerHeight - rect.top + 16,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          ...base,
          top: rect.bottom + 16,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          ...base,
          right: window.innerWidth - rect.left + 16,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          ...base,
          left: rect.right + 16,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)'
        };
      default:
        return base;
    }
  };

  return (
    <>
      {/* Spotlight overlay */}
      <Box style={spotlightStyle} />
      
      {/* Tooltip */}
      <Box
        style={getTooltipPosition()}
        bg="white"
        p={4}
        borderRadius="lg"
        boxShadow={designTokens.shadows.lg}
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={3} align="start">
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {description}
          </Text>
          
          <HStack spacing={2} justify="flex-end" w="100%">
            {onSkip && (
              <Button size="sm" variant="ghost" onClick={onSkip}>
                건너뛰기
              </Button>
            )}
            {onNext && (
              <Button size="sm" colorScheme="brand" onClick={onNext}>
                다음
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    </>
  );
};

export default OnboardingFlow;