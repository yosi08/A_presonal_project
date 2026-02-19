import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en/translation.json';
import ko from '../locales/ko/translation.json';
import { Session, Note, AppSettings, TimerPreset } from '../types';
import { useAuth } from './AuthContext';
import {
  loadUserData,
  initializeUserData,
  updateUserField,
  saveAllUserData,
} from '../lib/firestore';

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
  isLoading: boolean;
  isSyncing: boolean;
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
  const { user, isAuthenticated } = useAuth();

  const [language, setLanguageState] = useState('ko');
  const [sessions, setSessionsState] = useState<Session[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [timerPresets, setTimerPresetsState] = useState<TimerPreset[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const userId = user?.id;
  const isInitialLoad = useRef(true);
  const syncTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Step 1: Load from AsyncStorage immediately (fast hydration)
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
        console.error('Failed to load local data from AsyncStorage:', e);
      }
      setIsHydrated(true);
    };
    loadData();
  }, []);

  // Step 2: Load from Firestore when user is authenticated
  useEffect(() => {
    if (!isHydrated || !userId || !isAuthenticated) {
      if (!isAuthenticated) {
        setIsLoading(false);
      }
      return;
    }

    let cancelled = false;

    const loadFromFirestore = async () => {
      setIsLoading(true);
      try {
        let userData = await loadUserData(userId);

        if (cancelled) return;

        if (!userData) {
          // First-time user: check if AsyncStorage has data to migrate
          const savedSessions = await AsyncStorage.getItem('sessions');
          const savedNotes = await AsyncStorage.getItem('notes');
          const savedTimerPresets = await AsyncStorage.getItem('timerPresets');
          const hasLocalData = savedSessions || savedNotes || savedTimerPresets;

          if (hasLocalData) {
            const migrationData = {
              sessions,
              notes,
              timerPresets,
              settings,
              language,
            };
            await saveAllUserData(userId, migrationData);
            userData = migrationData;
          } else {
            userData = await initializeUserData(userId);
          }
        }

        if (cancelled) return;

        // Firestore is the source of truth
        setSessionsState(userData.sessions);
        setNotesState(userData.notes);
        setTimerPresetsState(userData.timerPresets);
        setSettingsState(userData.settings);
        setLanguageState(userData.language);

        // Update AsyncStorage cache
        await AsyncStorage.multiSet([
          ['sessions', JSON.stringify(userData.sessions)],
          ['notes', JSON.stringify(userData.notes)],
          ['timerPresets', JSON.stringify(userData.timerPresets)],
          ['settings', JSON.stringify(userData.settings)],
          ['language', userData.language],
        ]);
      } catch (error) {
        console.error('Failed to load from Firestore, using AsyncStorage data:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setTimeout(() => {
            isInitialLoad.current = false;
          }, 500);
        }
      }
    };

    loadFromFirestore();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, userId, isAuthenticated]);

  // Debounced Firestore sync helper
  const syncToFirestore = useCallback(
    (field: string, value: any) => {
      if (!userId || isInitialLoad.current) return;

      if (syncTimers.current[field]) {
        clearTimeout(syncTimers.current[field]);
      }

      syncTimers.current[field] = setTimeout(async () => {
        try {
          setIsSyncing(true);
          await updateUserField(userId, field as any, value);
        } catch (error) {
          console.error(`Failed to sync ${field} to Firestore:`, error);
        } finally {
          setIsSyncing(false);
        }
      }, 500);
    },
    [userId]
  );

  // Wrapped setters: AsyncStorage + Firestore
  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang);
      AsyncStorage.setItem('language', lang);
      syncToFirestore('language', lang);
    },
    [syncToFirestore]
  );

  const setSessions = useCallback(
    (s: Session[]) => {
      setSessionsState(s);
      if (isHydrated) {
        AsyncStorage.setItem('sessions', JSON.stringify(s));
      }
      syncToFirestore('sessions', s);
    },
    [isHydrated, syncToFirestore]
  );

  const setNotes = useCallback(
    (n: Note[]) => {
      setNotesState(n);
      if (isHydrated) {
        AsyncStorage.setItem('notes', JSON.stringify(n));
      }
      syncToFirestore('notes', n);
    },
    [isHydrated, syncToFirestore]
  );

  const setSettings = useCallback(
    (s: AppSettings) => {
      setSettingsState(s);
      if (isHydrated) {
        AsyncStorage.setItem('settings', JSON.stringify(s));
      }
      syncToFirestore('settings', s);
    },
    [isHydrated, syncToFirestore]
  );

  const setTimerPresets = useCallback(
    (p: TimerPreset[]) => {
      setTimerPresetsState(p);
      if (isHydrated) {
        AsyncStorage.setItem('timerPresets', JSON.stringify(p));
      }
      syncToFirestore('timerPresets', p);
    },
    [isHydrated, syncToFirestore]
  );

  // Translation function
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

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(syncTimers.current).forEach(clearTimeout);
    };
  }, []);

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
    isLoading,
    isSyncing,
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
