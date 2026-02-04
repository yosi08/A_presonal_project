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
const defaultSessions = [
  {
    id: 1,
    title: 'Mathematics Study',
    date: '2026-01-19',
    startTime: '09:00',
    endTime: '11:00',
    subject: 'Mathematics',
    color: 'bg-indigo-600',
  },
]

const defaultNotes = [
  {
    id: 1,
    title: 'next.js 기초',
    subject: 'Other',
    date: 'Jan 18, 2026',
    content: 'Next.js 기초 학습 내용',
    color: 'rgb(100, 116, 139)',
  },
  {
    id: 2,
    title: 'Introduction to Derivatives',
    subject: 'Mathematics',
    date: 'Jan 18, 2026',
    content: 'Derivatives are fundamental to calculus, representing rates of change. Master the power rule and memorize common derivative formulas for faster problem solving.\n\nKey formulas:\n- d/dx(x^n) = nx^(n-1)\n- d/dx(e^x) = e^x\n- d/dx(ln x) = 1/x',
    color: 'rgb(99, 102, 241)',
  },
  {
    id: 3,
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    date: 'Jan 17, 2026',
    content: "Newton's three laws form the foundation of classical mechanics. Understanding these laws helps predict motion and forces in everyday situations.\n\n1. First Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\n2. Second Law: F = ma\n\n3. Third Law: For every action, there is an equal and opposite reaction.",
    color: 'rgb(244, 63, 94)',
  },
]

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
