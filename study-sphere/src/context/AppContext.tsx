'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import en from '@/locales/en/translation.json'
import ko from '@/locales/ko/translation.json'

const AppContext = createContext()

const translations = { en, ko }

// Helper function for nested translations
const getNestedValue = (obj, path) => {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return path
    }
  }
  return result
}

// Default values
const defaultSessions = []

const defaultNotes = []

const defaultSettings = {
  theme: 'light',
  accentColor: 'indigo',
  notifications: {
    emailReminders: true,
    studyReminders: true,
    weeklyReport: false,
  },
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('ko')
  const [sessions, setSessions] = useState(defaultSessions)
  const [notes, setNotes] = useState(defaultNotes)
  const [settings, setSettings] = useState(defaultSettings)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize from localStorage on client (after hydration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language')
      const savedSessions = localStorage.getItem('sessions')
      const savedNotes = localStorage.getItem('notes')
      const savedSettings = localStorage.getItem('settings')

      if (savedLanguage) setLanguage(savedLanguage)
      if (savedSessions) setSessions(JSON.parse(savedSessions))
      if (savedNotes) setNotes(JSON.parse(savedNotes))
      if (savedSettings) setSettings(JSON.parse(savedSettings))

      setIsHydrated(true)
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('language', language)
    }
  }, [language, isHydrated])

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sessions', JSON.stringify(sessions))
    }
  }, [sessions, isHydrated])

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('notes', JSON.stringify(notes))
    }
  }, [notes, isHydrated])

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('settings', JSON.stringify(settings))
    }
  }, [settings, isHydrated])

  // Translation function
  const t = (key) => {
    const langData = translations[language]
    if (!langData) return key

    // Handle nested paths like 'category.key'
    if (key.includes('.')) {
      return getNestedValue(langData, key)
    }

    // Search across all categories for flat keys
    for (const category of Object.values(langData)) {
      if (typeof category === 'object' && key in category) {
        return category[key]
      }
    }

    return key
  }

  const value = {
    language,
    setLanguage,
    t,
    sessions,
    setSessions,
    notes,
    setNotes,
    settings,
    setSettings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
