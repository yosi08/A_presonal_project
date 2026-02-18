'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { DocumentSnapshot } from 'firebase/firestore'
import en from '@/locales/en/translation.json'
import ko from '@/locales/ko/translation.json'
import {
  loadUserData,
  initializeUserData,
  saveAllUserData,
} from '@/lib/firestore'
import { migrateUserData } from '@/lib/migrate-data'
import {
  loadUserProfile,
  updateUserProfile,
  loadSessionsByDateRange,
  loadAllSessions,
  addSession as addSessionV2,
  updateSession as updateSessionV2,
  deleteSession as deleteSessionV2,
  loadNotesPaginated,
  addNote as addNoteV2,
  updateNote as updateNoteV2,
  deleteNote as deleteNoteV2,
} from '@/lib/firestore-v2'

interface TimerPreset {
  id: string
  name: string
  studyMinutes: number
  breakMinutes: number
  totalCycles: number
}

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
  timerPresets: TimerPreset[]
  setTimerPresets: (presets: TimerPreset[]) => void
  requestNotificationPermission: () => Promise<NotificationPermission | null>
  notificationPermission: string
  isLoading: boolean
  isSyncing: boolean
  // Pagination for notes
  loadMoreNotes: () => Promise<void>
  hasMoreNotes: boolean
  isLoadingMore: boolean
  // Session loading by range
  loadSessionsForRange: (startDate: string, endDate: string) => Promise<any[]>
  // Individual CRUD
  addSession: (session: any) => Promise<void>
  updateSessionById: (sessionId: string, data: any) => Promise<void>
  deleteSessionById: (sessionId: string) => Promise<void>
  addNote: (note: any) => Promise<void>
  updateNoteById: (noteId: string, data: any) => Promise<void>
  deleteNoteById: (noteId: string) => Promise<void>
  // Stats
  totalNotesCount: number
  totalSessionsCount: number
}

const AppContext = createContext<AppContextType | null>(null)

const translations = { en, ko }

const getNestedValue = (obj: any, path: string) => {
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

const defaultSessions: any[] = []
const defaultNotes: any[] = []
const defaultSettings = {
  theme: 'light',
  notifications: {
    emailReminders: true,
    studyReminders: true,
    weeklyReport: false,
  },
}

function getTodayStr() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function getWeekMondayStr() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const [language, setLanguageState] = useState('ko')
  const [sessions, setSessionsState] = useState(defaultSessions)
  const [notes, setNotesState] = useState(defaultNotes)
  const [settings, setSettingsState] = useState(defaultSettings)
  const [timerPresets, setTimerPresetsState] = useState<TimerPreset[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const notifiedSessionsRef = useRef(new Set<string>())

  // Pagination state
  const [hasMoreNotes, setHasMoreNotes] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalNotesCount, setTotalNotesCount] = useState(0)
  const [totalSessionsCount, setTotalSessionsCount] = useState(0)
  const lastNoteDocRef = useRef<DocumentSnapshot | null>(null)
  const isMigratedRef = useRef(false)

  const userId = (session?.user as any)?.id as string | undefined
  const isInitialLoad = useRef(true)
  const syncTimers = useRef<Record<string, NodeJS.Timeout>>({})

  // Step 1: Load from localStorage immediately (fast hydration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language')
      const savedSessions = localStorage.getItem('sessions')
      const savedNotes = localStorage.getItem('notes')
      const savedSettings = localStorage.getItem('settings')
      const savedTimerPresets = localStorage.getItem('timerPresets')

      if (savedLanguage) setLanguageState(savedLanguage)
      if (savedSessions) setSessionsState(JSON.parse(savedSessions))
      if (savedNotes) setNotesState(JSON.parse(savedNotes))
      if (savedSettings) setSettingsState(JSON.parse(savedSettings))
      if (savedTimerPresets) setTimerPresetsState(JSON.parse(savedTimerPresets))

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }

      setIsHydrated(true)
    }
  }, [])

  // Step 2: Load from Firestore when user session is available
  useEffect(() => {
    if (!isHydrated || !userId || status !== 'authenticated') {
      if (status === 'unauthenticated') {
        setIsLoading(false)
      }
      return
    }

    let cancelled = false

    const loadFromFirestore = async () => {
      setIsLoading(true)
      try {
        // Run migration if needed
        await migrateUserData(userId)

        // Load user profile
        let profile = await loadUserProfile(userId)

        if (cancelled) return

        if (!profile) {
          // First-time user
          const hasLocalData =
            localStorage.getItem('sessions') ||
            localStorage.getItem('notes') ||
            localStorage.getItem('timerPresets')

          if (hasLocalData) {
            const migrationData = {
              sessions,
              notes,
              timerPresets,
              settings,
              language,
            }
            await saveAllUserData(userId, migrationData)
            await migrateUserData(userId)
          } else {
            await initializeUserData(userId)
          }
          profile = await loadUserProfile(userId)
        }

        if (cancelled || !profile) return

        // Update state with profile data
        setSettingsState(profile.settings as any)
        setTimerPresetsState(profile.timerPresets)
        setLanguageState(profile.language)
        setTotalNotesCount(profile.notesCount ?? 0)
        setTotalSessionsCount(profile.sessionsCount ?? 0)
        isMigratedRef.current = profile.migrated ?? false

        if (profile.migrated) {
          // Load from sub-collections
          const allSessions = await loadAllSessions(userId)
          if (!cancelled) {
            setSessionsState(allSessions)
            localStorage.setItem('sessions', JSON.stringify(allSessions))
          }

          const { notes: firstPageNotes, lastDoc, hasMore } =
            await loadNotesPaginated(userId, 20)
          if (!cancelled) {
            setNotesState(firstPageNotes)
            lastNoteDocRef.current = lastDoc
            setHasMoreNotes(hasMore)
            localStorage.setItem('notes', JSON.stringify(firstPageNotes))
          }
        } else {
          // Legacy single-document format
          const userData = await loadUserData(userId)
          if (!cancelled && userData) {
            setSessionsState(userData.sessions)
            setNotesState(userData.notes)
            localStorage.setItem('sessions', JSON.stringify(userData.sessions))
            localStorage.setItem('notes', JSON.stringify(userData.notes))
          }
        }

        // Cache profile data
        if (!cancelled) {
          localStorage.setItem('settings', JSON.stringify(profile.settings))
          localStorage.setItem('timerPresets', JSON.stringify(profile.timerPresets))
          localStorage.setItem('language', profile.language)
        }
      } catch (error) {
        console.error('Failed to load from Firestore, using localStorage data:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setTimeout(() => {
            isInitialLoad.current = false
          }, 500)
        }
      }
    }

    loadFromFirestore()

    return () => {
      cancelled = true
    }
  }, [isHydrated, userId, status])

  // Debounced profile sync
  const syncProfileToFirestore = useCallback(
    (field: string, value: any) => {
      if (!userId || isInitialLoad.current) return

      if (syncTimers.current[field]) {
        clearTimeout(syncTimers.current[field])
      }

      syncTimers.current[field] = setTimeout(async () => {
        try {
          setIsSyncing(true)
          await updateUserProfile(userId, field, value)
        } catch (error) {
          console.error(`Failed to sync ${field}:`, error)
        } finally {
          setIsSyncing(false)
        }
      }, 500)
    },
    [userId]
  )

  // Profile setters
  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang)
      if (typeof window !== 'undefined') localStorage.setItem('language', lang)
      syncProfileToFirestore('language', lang)
    },
    [syncProfileToFirestore]
  )

  const setSettings = useCallback(
    (newSettings: any) => {
      setSettingsState(newSettings)
      if (isHydrated && typeof window !== 'undefined')
        localStorage.setItem('settings', JSON.stringify(newSettings))
      syncProfileToFirestore('settings', newSettings)
    },
    [isHydrated, syncProfileToFirestore]
  )

  const setTimerPresets = useCallback(
    (newPresets: TimerPreset[]) => {
      setTimerPresetsState(newPresets)
      if (isHydrated && typeof window !== 'undefined')
        localStorage.setItem('timerPresets', JSON.stringify(newPresets))
      syncProfileToFirestore('timerPresets', newPresets)
    },
    [isHydrated, syncProfileToFirestore]
  )

  // Session CRUD
  const addSession = useCallback(
    async (sessionData: any) => {
      if (userId && isMigratedRef.current) {
        const newId = await addSessionV2(userId, sessionData)
        const newSession = { ...sessionData, id: newId }
        setSessionsState((prev) => [...prev, newSession])
        setTotalSessionsCount((prev) => prev + 1)
      } else {
        const newSession = { ...sessionData, id: Date.now() }
        setSessions([...sessions, newSession])
      }
    },
    [userId, sessions]
  )

  const updateSessionById = useCallback(
    async (sessionId: string, data: any) => {
      if (userId && isMigratedRef.current) {
        await updateSessionV2(userId, sessionId, data)
      }
      setSessionsState((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...data } : s))
      )
    },
    [userId]
  )

  const deleteSessionById = useCallback(
    async (sessionId: string) => {
      if (userId && isMigratedRef.current) {
        await deleteSessionV2(userId, sessionId)
        setTotalSessionsCount((prev) => Math.max(0, prev - 1))
      }
      setSessionsState((prev) => prev.filter((s) => s.id !== sessionId))
    },
    [userId]
  )

  // Legacy setSessions
  const setSessions = useCallback(
    (newSessions: any[]) => {
      setSessionsState(newSessions)
      if (isHydrated && typeof window !== 'undefined')
        localStorage.setItem('sessions', JSON.stringify(newSessions))
      if (!isMigratedRef.current && userId && !isInitialLoad.current) {
        if (syncTimers.current['sessions']) clearTimeout(syncTimers.current['sessions'])
        syncTimers.current['sessions'] = setTimeout(async () => {
          try {
            const { updateUserField } = await import('@/lib/firestore')
            await updateUserField(userId, 'sessions', newSessions)
          } catch {}
        }, 500)
      }
    },
    [isHydrated, userId]
  )

  // Note CRUD
  const addNote = useCallback(
    async (noteData: any) => {
      if (userId && isMigratedRef.current) {
        const newId = await addNoteV2(userId, noteData)
        const newNote = { ...noteData, id: newId }
        setNotesState((prev) => [newNote, ...prev])
        setTotalNotesCount((prev) => prev + 1)
      } else {
        const newNote = { ...noteData, id: Date.now() }
        setNotes([newNote, ...notes])
      }
    },
    [userId, notes]
  )

  const updateNoteById = useCallback(
    async (noteId: string, data: any) => {
      if (userId && isMigratedRef.current) {
        await updateNoteV2(userId, noteId, data)
      }
      setNotesState((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, ...data } : n))
      )
    },
    [userId]
  )

  const deleteNoteById = useCallback(
    async (noteId: string) => {
      if (userId && isMigratedRef.current) {
        await deleteNoteV2(userId, noteId)
        setTotalNotesCount((prev) => Math.max(0, prev - 1))
      }
      setNotesState((prev) => prev.filter((n) => n.id !== noteId))
    },
    [userId]
  )

  // Legacy setNotes
  const setNotes = useCallback(
    (newNotes: any[]) => {
      setNotesState(newNotes)
      if (isHydrated && typeof window !== 'undefined')
        localStorage.setItem('notes', JSON.stringify(newNotes))
      if (!isMigratedRef.current && userId && !isInitialLoad.current) {
        if (syncTimers.current['notes']) clearTimeout(syncTimers.current['notes'])
        syncTimers.current['notes'] = setTimeout(async () => {
          try {
            const { updateUserField } = await import('@/lib/firestore')
            await updateUserField(userId, 'notes', newNotes)
          } catch {}
        }, 500)
      }
    },
    [isHydrated, userId]
  )

  // Load more notes
  const loadMoreNotes = useCallback(async () => {
    if (!userId || !hasMoreNotes || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { notes: moreNotes, lastDoc, hasMore } =
        await loadNotesPaginated(userId, 20, lastNoteDocRef.current)
      setNotesState((prev) => [...prev, ...moreNotes])
      lastNoteDocRef.current = lastDoc
      setHasMoreNotes(hasMore)
    } catch (error) {
      console.error('Failed to load more notes:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [userId, hasMoreNotes, isLoadingMore])

  // Load sessions for date range
  const loadSessionsForRange = useCallback(
    async (startDate: string, endDate: string): Promise<any[]> => {
      if (!userId || !isMigratedRef.current) {
        return sessions.filter((s) => s.date >= startDate && s.date <= endDate)
      }
      try {
        return await loadSessionsByDateRange(userId, startDate, endDate)
      } catch {
        return sessions.filter((s) => s.date >= startDate && s.date <= endDate)
      }
    },
    [userId, sessions]
  )

  // Dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings.theme])

  // Notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return null
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission
  }, [])

  // Browser study reminders
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    if (!settings.notifications.studyReminders) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const checkUpcomingSessions = () => {
      const now = new Date()
      const todayStr = getTodayStr()
      const todaySessions = sessions.filter((s) => s.date === todayStr)

      todaySessions.forEach((session) => {
        const [hours, minutes] = session.startTime.split(':').map(Number)
        const sessionTime = new Date()
        sessionTime.setHours(hours, minutes, 0, 0)

        const diffMs = sessionTime.getTime() - now.getTime()
        const diffMin = diffMs / (1000 * 60)

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

  // Email daily reminders
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    if (!settings.notifications.emailReminders) return

    const todayStr = getTodayStr()
    const lastEmailDate = localStorage.getItem('lastEmailDate')
    if (lastEmailDate === todayStr) return

    const sendDailyEmail = async () => {
      try {
        const sessionData = await fetch('/api/auth/session').then((r) => r.json())
        if (!sessionData?.user?.email) return

        const todaySessions = sessions.filter((s) => s.date === todayStr)

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
      } catch {}
    }

    const timeout = setTimeout(sendDailyEmail, 3000)
    return () => clearTimeout(timeout)
  }, [isHydrated, settings.notifications.emailReminders, sessions, language])

  // Weekly report
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    if (!settings.notifications.weeklyReport) return

    const mondayStr = getWeekMondayStr()
    const lastWeeklyDate = localStorage.getItem('lastWeeklyReportDate')
    if (lastWeeklyDate === mondayStr) return

    const sendWeeklyReport = async () => {
      try {
        const sessionData = await fetch('/api/auth/session').then((r) => r.json())
        if (!sessionData?.user?.email) return

        const now = new Date()
        const day = now.getDay()
        const diff = day === 0 ? -6 : 1 - day
        const thisMonday = new Date(now)
        thisMonday.setDate(now.getDate() + diff)
        const lastMonday = new Date(thisMonday)
        lastMonday.setDate(thisMonday.getDate() - 7)
        const lastSunday = new Date(thisMonday)
        lastSunday.setDate(thisMonday.getDate() - 1)

        const lastWeekSessions = sessions.filter((s) => {
          const d = new Date(s.date)
          return d >= lastMonday && d <= lastSunday
        })

        const totalHours = lastWeekSessions.reduce((acc, s) => {
          const start = s.startTime.split(':').map(Number)
          const end = s.endTime.split(':').map(Number)
          return acc + (end[0] + end[1] / 60 - (start[0] + start[1] / 60))
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
              totalNotes: totalNotesCount || notes.length,
            },
          }),
        })

        localStorage.setItem('lastWeeklyReportDate', mondayStr)
      } catch {}
    }

    const timeout = setTimeout(sendWeeklyReport, 5000)
    return () => clearTimeout(timeout)
  }, [isHydrated, settings.notifications.weeklyReport, sessions, notes, language, totalNotesCount])

  // Translation
  const t = (key: string) => {
    const langData = translations[language as keyof typeof translations]
    if (!langData) return key

    if (key.includes('.')) return getNestedValue(langData, key)

    for (const category of Object.values(langData)) {
      if (typeof category === 'object' && key in (category as any)) {
        return (category as any)[key]
      }
    }

    return key
  }

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(syncTimers.current).forEach(clearTimeout)
    }
  }, [])

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
    timerPresets,
    setTimerPresets,
    requestNotificationPermission,
    notificationPermission,
    isLoading,
    isSyncing,
    loadMoreNotes,
    hasMoreNotes,
    isLoadingMore,
    loadSessionsForRange,
    addSession,
    updateSessionById,
    deleteSessionById,
    addNote,
    updateNoteById,
    deleteNoteById,
    totalNotesCount,
    totalSessionsCount,
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
