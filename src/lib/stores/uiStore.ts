import { writable } from 'svelte/store';
import { Theme, Language } from '../types';

interface UIStore {
  activeTab: string;
  activeModal: string | null;
  modalData: any;
  theme: Theme;
  language: Language;
  isOffline: boolean;
  isMobileSidebarOpen: boolean;
}

// Load theme from localStorage or default to light
function loadTheme(): Theme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === Theme.LIGHT || saved === Theme.DARK) {
      return saved as Theme;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return Theme.DARK;
    }
  }
  return Theme.LIGHT;
}

// Load language from localStorage or default to en
function loadLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved === Language.EN || saved === Language.RU || saved === Language.AZ || saved === Language.IT) {
      return saved as Language;
    }
    // Try to detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ru')) return Language.RU;
    if (browserLang.startsWith('az')) return Language.AZ;
    if (browserLang.startsWith('it')) return Language.IT;
  }
  return Language.EN;
}

// Apply theme to document
function applyTheme(theme: Theme) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

const initialState: UIStore = {
  activeTab: 'dashboard',
  activeModal: null,
  modalData: null,
  theme: loadTheme(),
  language: loadLanguage(),
  isOffline: typeof window !== 'undefined' ? !navigator.onLine : false,
  isMobileSidebarOpen: false,
};

// Apply initial theme
applyTheme(initialState.theme);

function createUIStore() {
  const { subscribe, set, update } = writable<UIStore>(initialState);

  return {
    subscribe,
    
    // Tab management
    setActiveTab: (tab: string) => {
      update(state => ({ ...state, activeTab: tab }));
    },
    
    // Modal management
    openModal: (modal: string, data?: any) => {
      update(state => ({ ...state, activeModal: modal, modalData: data || null }));
    },
    closeModal: () => {
      update(state => ({ ...state, activeModal: null, modalData: null }));
    },
    
    // Theme management
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
      applyTheme(theme);
      update(state => ({ ...state, theme }));
    },
    toggleTheme: () => {
      update(state => {
        const newTheme: Theme = state.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newTheme);
        }
        applyTheme(newTheme);
        return { ...state, theme: newTheme };
      });
    },
    
    // Language management
    setLanguage: (language: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', language);
      }
      update(state => ({ ...state, language }));
    },
    
    // Offline status management
    setOffline: (isOffline: boolean) => {
      update(state => ({ ...state, isOffline }));
    },

    // Mobile sidebar management
    openMobileSidebar: () => {
      update(state => ({ ...state, isMobileSidebarOpen: true }));
    },
    closeMobileSidebar: () => {
      update(state => ({ ...state, isMobileSidebarOpen: false }));
    },
    toggleMobileSidebar: () => {
      update(state => ({ ...state, isMobileSidebarOpen: !state.isMobileSidebarOpen }));
    },
    
    // Reset to defaults
    reset: () => {
      set({
        ...initialState,
        theme: loadTheme(),
        language: loadLanguage(),
        isOffline: typeof window !== 'undefined' ? !navigator.onLine : false,
      });
    },
  };
}

export const uiStore = createUIStore();

// Set up offline/online listeners if in browser
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    uiStore.setOffline(false);
  });
  
  window.addEventListener('offline', () => {
    uiStore.setOffline(true);
  });
}
