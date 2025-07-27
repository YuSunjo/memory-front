import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Internationalization interfaces
interface Translation {
  [key: string]: string | Translation;
}

interface Locale {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

interface I18nContextType {
  currentLocale: string;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLocale: (localeCode: string) => Promise<void>;
  isLoading: boolean;
  availableLocales: Locale[];
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

// Supported locales
const SUPPORTED_LOCALES: Locale[] = [
  {
    code: 'ko',
    name: '한국어',
    flag: '🇰🇷',
    direction: 'ltr'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    direction: 'ltr'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    direction: 'ltr'
  }
];

// Default translations
const DEFAULT_TRANSLATIONS: Record<string, Translation> = {
  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '성공적으로 완료되었습니다',
      confirm: '확인',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      close: '닫기',
      search: '검색',
      filter: '필터',
      sort: '정렬',
      more: '더보기',
      less: '접기'
    },
    navigation: {
      home: '홈',
      memories: '추억',
      quest: '탐험',
      discover: '발견',
      profile: '프로필',
      settings: '설정',
      logout: '로그아웃',
      login: '로그인',
      signup: '회원가입'
    },
    memory: {
      title: '추억',
      create: '추억 만들기',
      myMemories: '내 추억',
      sharedMemories: '공유된 추억',
      privateMemory: '개인 추억',
      publicMemory: '공개 추억',
      relationshipMemory: '관계 추억',
      location: '위치',
      date: '날짜',
      hashtags: '해시태그',
      description: '설명'
    },
    profile: {
      myProfile: '내 프로필',
      editProfile: '프로필 편집',
      nickname: '닉네임',
      email: '이메일',
      birthday: '생일',
      introduction: '소개',
      favoriteColor: '좋아하는 색상'
    },
    accessibility: {
      skipToContent: '본문으로 건너뛰기',
      skipToNavigation: '네비게이션으로 건너뛰기',
      menuButton: '메뉴 버튼',
      closeDialog: '대화상자 닫기',
      previousPage: '이전 페이지',
      nextPage: '다음 페이지',
      loading: '콘텐츠 로딩 중',
      error: '오류 발생'
    },
    pwa: {
      installApp: '앱 설치하기',
      installPrompt: 'Memory Front를 홈 화면에 추가하시겠습니까?',
      offline: '오프라인',
      onlineAgain: '인터넷에 다시 연결되었습니다',
      updateAvailable: '새 버전이 사용 가능합니다'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Successfully completed',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      more: 'More',
      less: 'Less'
    },
    navigation: {
      home: 'Home',
      memories: 'Memories',
      quest: 'Quest',
      discover: 'Discover',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign Up'
    },
    memory: {
      title: 'Memory',
      create: 'Create Memory',
      myMemories: 'My Memories',
      sharedMemories: 'Shared Memories',
      privateMemory: 'Private Memory',
      publicMemory: 'Public Memory',
      relationshipMemory: 'Relationship Memory',
      location: 'Location',
      date: 'Date',
      hashtags: 'Hashtags',
      description: 'Description'
    },
    profile: {
      myProfile: 'My Profile',
      editProfile: 'Edit Profile',
      nickname: 'Nickname',
      email: 'Email',
      birthday: 'Birthday',
      introduction: 'Introduction',
      favoriteColor: 'Favorite Color'
    },
    accessibility: {
      skipToContent: 'Skip to content',
      skipToNavigation: 'Skip to navigation',
      menuButton: 'Menu button',
      closeDialog: 'Close dialog',
      previousPage: 'Previous page',
      nextPage: 'Next page',
      loading: 'Loading content',
      error: 'Error occurred'
    },
    pwa: {
      installApp: 'Install App',
      installPrompt: 'Add Memory Front to your home screen?',
      offline: 'Offline',
      onlineAgain: 'Back online',
      updateAvailable: 'Update available'
    }
  }
};

// Translation cache
const translationCache = new Map<string, Translation>();

export const useI18n = (): I18nContextType => {
  const [currentLocale, setCurrentLocale] = useState<string>('ko');
  const [translations, setTranslations] = useState<Translation>(DEFAULT_TRANSLATIONS.ko);
  const [isLoading, setIsLoading] = useState(false);

  // Get current locale info
  const locale = SUPPORTED_LOCALES.find(l => l.code === currentLocale) || SUPPORTED_LOCALES[0];

  // Detect user's preferred language
  useEffect(() => {
    const detectLanguage = () => {
      // Check stored preference
      const stored = localStorage.getItem('memory-front-locale');
      if (stored && SUPPORTED_LOCALES.some(l => l.code === stored)) {
        return stored;
      }

      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (SUPPORTED_LOCALES.some(l => l.code === browserLang)) {
        return browserLang;
      }

      // Default to Korean
      return 'ko';
    };

    const detectedLocale = detectLanguage();
    if (detectedLocale !== currentLocale) {
      changeLocale(detectedLocale);
    }
  }, []);

  // Apply locale to document
  useEffect(() => {
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = locale.direction;
  }, [currentLocale, locale.direction]);

  // Load translations for locale
  const loadTranslations = useCallback(async (localeCode: string): Promise<Translation> => {
    // Check cache first
    if (translationCache.has(localeCode)) {
      return translationCache.get(localeCode)!;
    }

    // Check if we have default translations
    if (DEFAULT_TRANSLATIONS[localeCode]) {
      const translation = DEFAULT_TRANSLATIONS[localeCode];
      translationCache.set(localeCode, translation);
      return translation;
    }

    // Try to load from external source (future enhancement)
    try {
      // This would be an API call or dynamic import in a real app
      const response = await fetch(`/locales/${localeCode}.json`);
      if (response.ok) {
        const translation = await response.json();
        translationCache.set(localeCode, translation);
        return translation;
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${localeCode}:`, error);
    }

    // Fallback to Korean
    const fallback = DEFAULT_TRANSLATIONS.ko;
    translationCache.set(localeCode, fallback);
    return fallback;
  }, []);

  // Change locale
  const changeLocale = useCallback(async (localeCode: string) => {
    if (localeCode === currentLocale) return;

    setIsLoading(true);
    try {
      const newTranslations = await loadTranslations(localeCode);
      setTranslations(newTranslations);
      setCurrentLocale(localeCode);
      localStorage.setItem('memory-front-locale', localeCode);
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocale, loadTranslations]);

  // Translation function with interpolation
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Handle parameter interpolation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }, [translations]);

  // Number formatting
  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat(currentLocale).format(num);
  }, [currentLocale]);

  // Date formatting
  const formatDate = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat(currentLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }, [currentLocale]);

  // Currency formatting
  const formatCurrency = useCallback((amount: number, currency = 'KRW'): string => {
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, [currentLocale]);

  return {
    currentLocale,
    locale,
    t,
    changeLocale,
    isLoading,
    availableLocales: SUPPORTED_LOCALES,
    formatNumber,
    formatDate,
    formatCurrency
  };
};

// Plural handling for Korean (simple implementation)
export const pluralize = (count: number, singular: string, plural?: string): string => {
  // Korean doesn't have plural forms like English
  // But we can add counters or modify based on context
  if (count === 1) {
    return singular;
  }
  return plural || singular;
};

// RTL language detection
export const isRTL = (locale: string): boolean => {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale);
};

// Create i18n context
export const I18nContext = createContext<I18nContextType | null>(null);

// Hook to use i18n context
export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
};

export default useI18n;