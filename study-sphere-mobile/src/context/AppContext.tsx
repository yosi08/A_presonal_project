import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en/translation.json';
import ko from '../locales/ko/translation.json';
import { Session, Note, AppSettings, TimerPreset } from '../types';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  timerPresets: TimerPreset[];
  setTimerPresets: (presets: TimerPreset[]) => void;
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const translations: Record<string, any> = { en, ko };

const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path;
    }
  }
  return result;
};

const defaultSettings: AppSettings = {
  theme: 'light',
  notifications: {
    emailReminders: false,
    studyReminders: true,
    weeklyReport: false,
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('ko');
  const [sessions, setSessionsState] = useState<Session[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [timerPresets, setTimerPresetsState] = useState<TimerPreset[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await AsyncStorage.multiGet([
          'language',
          'sessions',
          'notes',
          'settings',
          'timerPresets',
        ]);
        const map: Record<string, string | null> = {};
        results.forEach(([key, value]) => {
          map[key] = value;
        });

        if (map.language) setLanguageState(map.language);
        if (map.sessions) setSessionsState(JSON.parse(map.sessions));
        if (map.notes) setNotesState(JSON.parse(map.notes));
        if (map.settings) setSettingsState(JSON.parse(map.settings));
        if (map.timerPresets) setTimerPresetsState(JSON.parse(map.timerPresets));
      } catch (e) {
        // silently fail
      }
      setIsHydrated(true);
    };
    loadData();
  }, []);

  // Persist helpers
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    AsyncStorage.setItem('language', lang);
  }, []);

  const setSessions = useCallback((s: Session[]) => {
    setSessionsState(s);
    AsyncStorage.setItem('sessions', JSON.stringify(s));
  }, []);

  const setNotes = useCallback((n: Note[]) => {
    setNotesState(n);
    AsyncStorage.setItem('notes', JSON.stringify(n));
  }, []);

  const setSettings = useCallback((s: AppSettings) => {
    setSettingsState(s);
    AsyncStorage.setItem('settings', JSON.stringify(s));
  }, []);

  const setTimerPresets = useCallback((p: TimerPreset[]) => {
    setTimerPresetsState(p);
    AsyncStorage.setItem('timerPresets', JSON.stringify(p));
  }, []);

  // Translation function (same logic as web app)
  const t = useCallback(
    (key: string): string => {
      const langData = translations[language];
      if (!langData) return key;

      if (key.includes('.')) {
        return getNestedValue(langData, key);
      }

      for (const category of Object.values(langData)) {
        if (typeof category === 'object' && category !== null && key in (category as any)) {
          return (category as any)[key];
        }
      }

      return key;
    },
    [language]
  );

  const value: AppContextType = {
    language,
    setLanguage,
    t,
    sessions,
    setSessions,
    notes,
    setNotes,
    settings,
    setSettings,
    timerPresets,
    setTimerPresets,
    isHydrated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
