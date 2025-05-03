import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'tr';

interface SettingsState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Language
  language: Language;
  setLanguage: (language: Language) => void;
  
  // Parental Control
  parentalControlEnabled: boolean;
  parentalControlPin: string;
  setParentalControl: (enabled: boolean) => void;
  setParentalControlPin: (pin: string) => void;
  validatePin: (pin: string) => boolean;
  
  // Player Settings
  autoPlayNext: boolean;
  defaultSubtitleLanguage: string | null;
  bufferSize: number; // in seconds
  setAutoPlayNext: (autoPlay: boolean) => void;
  setDefaultSubtitleLanguage: (language: string | null) => void;
  setBufferSize: (seconds: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
      
      // Parental Control
      parentalControlEnabled: false,
      parentalControlPin: '0000', // Default PIN
      setParentalControl: (enabled) => set({ parentalControlEnabled: enabled }),
      setParentalControlPin: (pin) => set({ parentalControlPin: pin }),
      validatePin: (pin) => get().parentalControlPin === pin,
      
      // Player Settings
      autoPlayNext: true,
      defaultSubtitleLanguage: null,
      bufferSize: 30, // 30 seconds default buffer
      setAutoPlayNext: (autoPlay) => set({ autoPlayNext: autoPlay }),
      setDefaultSubtitleLanguage: (language) => set({ defaultSubtitleLanguage: language }),
      setBufferSize: (seconds) => set({ bufferSize: seconds }),
    }),
    {
      name: 'iptv-settings-storage',
    }
  )
);