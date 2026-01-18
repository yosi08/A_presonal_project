import { createContext, useContext, useState, useEffect } from 'react'
import en from '../locales/en/translation.json'
import ko from '../locales/ko/translation.json'

const AppContext = createContext()

const translations = { en, ko }

// 중첩된 객체에서 키로 값을 가져오는 헬퍼 함수
const getNestedValue = (obj, path) => {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return path // 키를 찾지 못하면 원래 경로 반환
    }
  }
  return result
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : {
      name: 'User',
      email: 'user@example.com',
      avatar: 'U',
    }
  })

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'ko'
  })

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('sessions')
    return saved ? JSON.parse(saved) : [
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
  })

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes')
    return saved ? JSON.parse(saved) : [
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
  })

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn')
    return saved === 'true'
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings')
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      accentColor: 'indigo',
      notifications: {
        emailReminders: true,
        studyReminders: true,
        weeklyReport: false,
      },
    }
  })

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString())
  }, [isLoggedIn])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  // t 함수: 'category.key' 형식 또는 'key' 형식 모두 지원
  const t = (key) => {
    const langData = translations[language]
    if (!langData) return key

    // 점(.)이 포함된 경우 중첩 경로로 처리
    if (key.includes('.')) {
      return getNestedValue(langData, key)
    }

    // 점이 없는 경우 모든 카테고리에서 검색
    for (const category of Object.values(langData)) {
      if (typeof category === 'object' && key in category) {
        return category[key]
      }
    }

    return key
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  const value = {
    user,
    setUser,
    language,
    setLanguage,
    t,
    sessions,
    setSessions,
    notes,
    setNotes,
    isLoggedIn,
    setIsLoggedIn,
    logout,
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
