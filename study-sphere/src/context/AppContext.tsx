'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import en from '@/locales/en/translation.json'
import ko from '@/locales/ko/translation.json'

interface AppContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
  sessions: any[]
  setSessions: (sessions: any[]) => void
  notes: any[]
  setNotes: (notes: any[]) => void
  settings: any
  setSettings: (settings: any) => void
  requestNotificationPermission: () => Promise<NotificationPermission | null>
  notificationPermission: string
}

const AppContext = createContext<AppContextType | null>(null)

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
  notifications: {
    emailReminders: true,
    studyReminders: true,
    weeklyReport: false,
  },
}

// Helper: get today's date string in YYYY-MM-DD format
function getTodayStr() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// Helper: get current week's Monday date string
function getWeekMondayStr() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('ko')
  const [sessions, setSessions] = useState(defaultSessions)
  const [notes, setNotes] = useState(defaultNotes)
  const [settings, setSettings] = useState(defaultSettings)
  const [isHydrated, setIsHydrated] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const notifiedSessionsRef = useRef(new Set<string>())

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

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }

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

  // Apply dark mode class to <html>
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings.theme])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return null
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission
  }, [])

  // Browser study reminders - check every 60s for upcoming sessions
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    if (!settings.notifications.studyReminders) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const checkUpcomingSessions = () => {
      const now = new Date()
      const todayStr = getTodayStr()
      const todaySessions = sessions.filter(s => s.date === todayStr)

      todaySessions.forEach(session => {
        const [hours, minutes] = session.startTime.split(':').map(Number)
        const sessionTime = new Date()
        sessionTime.setHours(hours, minutes, 0, 0)

        const diffMs = sessionTime.getTime() - now.getTime()
        const diffMin = diffMs / (1000 * 60)

        // Notify 5 minutes before (between 4 and 6 minutes to catch within the 60s interval)
        const notifKey = `${session.id}-${session.date}`
        if (diffMin > 0 && diffMin <= 6 && !notifiedSessionsRef.current.has(notifKey)) {
          notifiedSessionsRef.current.add(notifKey)
          const isKo = language === 'ko'
          new Notification(
            isKo ? '📚 학습 세션 시작 임박!' : '📚 Study Session Starting Soon!',
            {
              body: isKo
                ? `"${session.title}" 세션이 ${Math.round(diffMin)}분 후에 시작됩니다.`
                : `"${session.title}" starts in ${Math.round(diffMin)} minutes.`,
              icon: '/logo.png',
            }
          )
        }
      })
    }

    checkUpcomingSessions()
    const interval = setInterval(checkUpcomingSessions, 60000)
    return () => clearInterval(interval)
  }, [isHydrated, sessions, settings.notifications.studyReminders, language])

  // Email daily reminders - send once per day when app loads
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    if (!settings.notifications.emailReminders) return

    const todayStr = getTodayStr()
    const lastEmailDate = localStorage.getItem('lastEmailDate')
    if (lastEmailDate === todayStr) return

    // Get user email from session storage (set by AuthProvider)
    const sendDailyEmail = async () => {
      try {
        const sessionData = await fetch('/api/auth/session').then(r => r.json())
        if (!sessionData?.user?.email) return

        const todaySessions = sessions.filter(s => s.date === todayStr)

        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: sessionData.user.email,
            name: sessionData.user.name || 'User',
            sessions: todaySessions,
            type: 'daily',
            language,
          }),
        })

        localStorage.setItem('lastEmailDate', todayStr)
      } catch {
        // Silently fail - don't block app
      }
    }

    // Small delay to not block initial render
    const timeout = setTimeout(sendDailyEmail, 3000)
    return () => clearTimeout(timeout)
  }, [isHydrated, settings.notifications.emailReminders, sessions, language])

  // Weekly report - send once per week when app loads
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    if (!settings.notifications.weeklyReport) return

    const mondayStr = getWeekMondayStr()
    const lastWeeklyDate = localStorage.getItem('lastWeeklyReportDate')
    if (lastWeeklyDate === mondayStr) return

    const sendWeeklyReport = async () => {
      try {
        const sessionData = await fetch('/api/auth/session').then(r => r.json())
        if (!sessionData?.user?.email) return

        // Calculate last week's stats
        const now = new Date()
        const day = now.getDay()
        const diff = day === 0 ? -6 : 1 - day
        const thisMonday = new Date(now)
        thisMonday.setDate(now.getDate() + diff)
        const lastMonday = new Date(thisMonday)
        lastMonday.setDate(thisMonday.getDate() - 7)
        const lastSunday = new Date(thisMonday)
        lastSunday.setDate(thisMonday.getDate() - 1)

        const lastWeekSessions = sessions.filter(s => {
          const d = new Date(s.date)
          return d >= lastMonday && d <= lastSunday
        })

        const totalHours = lastWeekSessions.reduce((acc, s) => {
          const start = s.startTime.split(':').map(Number)
          const end = s.endTime.split(':').map(Number)
          return acc + ((end[0] + end[1] / 60) - (start[0] + start[1] / 60))
        }, 0)

        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: sessionData.user.email,
            name: sessionData.user.name || 'User',
            sessions: [],
            type: 'weekly',
            language,
            weeklyStats: {
              totalSessions: lastWeekSessions.length,
              totalHours: Math.round(totalHours),
              totalNotes: notes.length,
            },
          }),
        })

        localStorage.setItem('lastWeeklyReportDate', mondayStr)
      } catch {
        // Silently fail
      }
    }

    const timeout = setTimeout(sendWeeklyReport, 5000)
    return () => clearTimeout(timeout)
  }, [isHydrated, settings.notifications.weeklyReport, sessions, notes, language])

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
    requestNotificationPermission,
    notificationPermission,
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
