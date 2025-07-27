import { useState, useEffect, useCallback } from 'react';
import { useDisclosure } from '@chakra-ui/react';

// Onboarding configuration
interface OnboardingConfig {
  id: string;
  version: string;
  steps: string[];
  required?: boolean;
  skipable?: boolean;
  repeatable?: boolean;
}

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  completedSteps: string[];
  skipped: boolean;
  version: string;
  lastSeen: string;
}

interface UseOnboardingOptions {
  autoStart?: boolean;
  autoSave?: boolean;
  resetOnVersionChange?: boolean;
}

export const useOnboarding = (
  config: OnboardingConfig,
  options: UseOnboardingOptions = {}
) => {
  const {
    autoStart = true,
    autoSave = true,
    resetOnVersionChange = true
  } = options;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, setState] = useState<OnboardingState>({
    completed: false,
    currentStep: 0,
    completedSteps: [],
    skipped: false,
    version: config.version,
    lastSeen: new Date().toISOString()
  });

  const storageKey = `onboarding-${config.id}`;

  // Load saved state
  useEffect(() => {
    if (autoSave) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const savedState: OnboardingState = JSON.parse(saved);
          
          // Check version compatibility
          if (resetOnVersionChange && savedState.version !== config.version) {
            // Reset onboarding for new version
            setState(prev => ({
              ...prev,
              completed: false,
              currentStep: 0,
              completedSteps: [],
              skipped: false,
              version: config.version
            }));
          } else {
            setState(savedState);
          }
        } catch (error) {
          console.warn('Failed to load onboarding state:', error);
        }
      }
    }
  }, [config.id, config.version, autoSave, resetOnVersionChange, storageKey]);

  // Auto-start onboarding
  useEffect(() => {
    if (autoStart && !state.completed && !state.skipped && !isOpen) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        onOpen();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, state.completed, state.skipped, isOpen, onOpen]);

  // Save state when it changes
  useEffect(() => {
    if (autoSave) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, autoSave, storageKey]);

  // Start onboarding manually
  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      completed: false,
      currentStep: 0,
      skipped: false,
      lastSeen: new Date().toISOString()
    }));
    onOpen();
  }, [onOpen]);

  // Complete onboarding
  const complete = useCallback((completedSteps: string[]) => {
    setState(prev => ({
      ...prev,
      completed: true,
      completedSteps,
      skipped: false,
      lastSeen: new Date().toISOString()
    }));
    onClose();
  }, [onClose]);

  // Skip onboarding
  const skip = useCallback(() => {
    setState(prev => ({
      ...prev,
      skipped: true,
      lastSeen: new Date().toISOString()
    }));
    onClose();
  }, [onClose]);

  // Reset onboarding
  const reset = useCallback(() => {
    setState({
      completed: false,
      currentStep: 0,
      completedSteps: [],
      skipped: false,
      version: config.version,
      lastSeen: new Date().toISOString()
    });
    
    if (autoSave) {
      localStorage.removeItem(storageKey);
    }
  }, [config.version, autoSave, storageKey]);

  // Check if should show onboarding
  const shouldShow = useCallback(() => {
    if (config.required && !state.completed) return true;
    if (config.repeatable) return true;
    return !state.completed && !state.skipped;
  }, [config.required, config.repeatable, state.completed, state.skipped]);

  // Update step progress
  const updateStep = useCallback((stepIndex: number, stepId?: string) => {
    setState(prev => ({
      ...prev,
      currentStep: stepIndex,
      completedSteps: stepId && !prev.completedSteps.includes(stepId)
        ? [...prev.completedSteps, stepId]
        : prev.completedSteps,
      lastSeen: new Date().toISOString()
    }));
  }, []);

  return {
    // State
    isOpen,
    state,
    shouldShow: shouldShow(),
    
    // Actions
    start,
    complete,
    skip,
    reset,
    updateStep,
    onClose,
    
    // Utils
    isCompleted: state.completed,
    isSkipped: state.skipped,
    completionPercentage: (state.completedSteps.length / config.steps.length) * 100
  };
};

// Hook for feature discovery
export const useFeatureDiscovery = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [discoveredFeatures, setDiscoveredFeatures] = useState<Set<string>>(new Set());

  // Load discovered features
  useEffect(() => {
    const saved = localStorage.getItem('discovered-features');
    if (saved) {
      try {
        const features = JSON.parse(saved);
        setDiscoveredFeatures(new Set(features));
      } catch (error) {
        console.warn('Failed to load discovered features:', error);
      }
    }
  }, []);

  // Save discovered features
  useEffect(() => {
    localStorage.setItem(
      'discovered-features',
      JSON.stringify(Array.from(discoveredFeatures))
    );
  }, [discoveredFeatures]);

  const highlightFeature = useCallback((featureId: string) => {
    if (!discoveredFeatures.has(featureId)) {
      setActiveFeature(featureId);
    }
  }, [discoveredFeatures]);

  const markAsDiscovered = useCallback((featureId: string) => {
    setDiscoveredFeatures(prev => new Set([...prev, featureId]));
    setActiveFeature(null);
  }, []);

  const resetDiscovery = useCallback(() => {
    setDiscoveredFeatures(new Set());
    setActiveFeature(null);
    localStorage.removeItem('discovered-features');
  }, []);

  const isDiscovered = useCallback((featureId: string) => {
    return discoveredFeatures.has(featureId);
  }, [discoveredFeatures]);

  return {
    activeFeature,
    highlightFeature,
    markAsDiscovered,
    resetDiscovery,
    isDiscovered,
    discoveredCount: discoveredFeatures.size
  };
};

// Hook for user progress tracking
export const useUserProgress = () => {
  const [progressData, setProgressData] = useState({
    memoriesCreated: 0,
    questsCompleted: 0,
    daysActive: 0,
    featuresUsed: new Set<string>(),
    achievements: new Set<string>(),
    lastActive: new Date().toISOString()
  });

  // Load progress data
  useEffect(() => {
    const saved = localStorage.getItem('user-progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProgressData({
          ...data,
          featuresUsed: new Set(data.featuresUsed || []),
          achievements: new Set(data.achievements || [])
        });
      } catch (error) {
        console.warn('Failed to load user progress:', error);
      }
    }
  }, []);

  // Save progress data
  useEffect(() => {
    const dataToSave = {
      ...progressData,
      featuresUsed: Array.from(progressData.featuresUsed),
      achievements: Array.from(progressData.achievements)
    };
    
    localStorage.setItem('user-progress', JSON.stringify(dataToSave));
  }, [progressData]);

  const incrementMemories = useCallback(() => {
    setProgressData(prev => ({
      ...prev,
      memoriesCreated: prev.memoriesCreated + 1,
      lastActive: new Date().toISOString()
    }));
  }, []);

  const incrementQuests = useCallback(() => {
    setProgressData(prev => ({
      ...prev,
      questsCompleted: prev.questsCompleted + 1,
      lastActive: new Date().toISOString()
    }));
  }, []);

  const trackFeatureUsage = useCallback((featureId: string) => {
    setProgressData(prev => ({
      ...prev,
      featuresUsed: new Set([...prev.featuresUsed, featureId]),
      lastActive: new Date().toISOString()
    }));
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setProgressData(prev => ({
      ...prev,
      achievements: new Set([...prev.achievements, achievementId]),
      lastActive: new Date().toISOString()
    }));
  }, []);

  const getProgressLevel = useCallback(() => {
    const { memoriesCreated, questsCompleted, featuresUsed } = progressData;
    const totalScore = memoriesCreated * 2 + questsCompleted * 3 + featuresUsed.size;
    
    if (totalScore >= 100) return 'expert';
    if (totalScore >= 50) return 'intermediate';
    if (totalScore >= 20) return 'beginner';
    return 'newcomer';
  }, [progressData]);

  return {
    progressData,
    incrementMemories,
    incrementQuests,
    trackFeatureUsage,
    unlockAchievement,
    getProgressLevel: getProgressLevel()
  };
};

export default useOnboarding;