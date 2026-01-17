import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const translations = {
  en: {
    // Navigation
    home: 'Home',
    calendar: 'Calendar',
    notes: 'Notes',
    settings: 'Settings',
    studyPlan: 'StudyPlan',
    studyManagement: 'Study Management',

    // Home Page
    welcomeBack: 'Welcome back',
    stayOrganized: 'Stay organized and excel in your studies with our powerful planning tools.',
    today: 'Today',
    thisWeek: 'This Week',
    sessions: 'Sessions',
    todaysSchedule: "Today's Schedule",
    viewCalendar: 'View Calendar',
    noSessionsToday: 'No study sessions scheduled for today',
    scheduleSession: 'Schedule a Session',
    weekOverview: 'Week Overview',
    recentNotes: 'Recent Notes',
    viewAllNotes: 'View All Notes',
    session: 'session',

    // Calendar Page
    manageSchedule: 'Manage your study schedule',
    addSession: 'Add Session',
    noSessionsScheduled: 'No sessions scheduled',
    addASession: 'Add a session',
    addStudySession: 'Add Study Session',
    title: 'Title',
    startTime: 'Start Time',
    endTime: 'End Time',
    subject: 'Subject',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',

    // Notes Page
    organizeNotes: 'Organize your study materials',
    newNote: 'New Note',
    searchNotes: 'Search notes...',
    all: 'All',
    noNotesFound: 'No notes found',
    tryAdjusting: 'Try adjusting your search or filters',
    createFirstNote: 'Create your first note to get started',
    createNote: 'Create Note',
    editNote: 'Edit Note',
    content: 'Content',
    saveChanges: 'Save Changes',

    // Settings Page
    manageAccount: 'Manage your account and preferences',
    profile: 'Profile',
    notifications: 'Notifications',
    appearance: 'Appearance',
    privacy: 'Privacy',
    language: 'Language',
    profileSettings: 'Profile Settings',
    updatePersonalInfo: 'Update your personal information',
    changeAvatar: 'Change Avatar',
    name: 'Name',
    email: 'Email',
    emailReadOnly: 'Email cannot be changed (linked to Google account)',
    bio: 'Bio',
    tellAboutYourself: 'Tell us about yourself...',
    notificationPreferences: 'Notification Preferences',
    chooseNotifications: 'Choose what notifications you receive',
    emailReminders: 'Email Reminders',
    emailRemindersDesc: 'Receive email notifications for upcoming sessions',
    studyReminders: 'Study Reminders',
    studyRemindersDesc: 'Get notified before your study sessions start',
    weeklyReport: 'Weekly Report',
    weeklyReportDesc: 'Receive a weekly summary of your progress',
    customizeAppearance: 'Customize how the app looks',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    accentColor: 'Accent Color',
    privacySecurity: 'Privacy & Security',
    manageAccountSecurity: 'Manage your account security',
    changePassword: 'Change Password',
    changePasswordDesc: 'Update your password regularly for security',
    twoFactorAuth: 'Two-Factor Authentication',
    twoFactorAuthDesc: 'Add an extra layer of security to your account',
    enable2FA: 'Enable 2FA',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all associated data',
    saved: 'Saved!',
    save: 'Save Changes',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select your preferred language',

    // Subjects
    mathematics: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    computerScience: 'Computer Science',
    other: 'Other',

    // Days
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',

    // Auth
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    yes: 'Yes',
    no: 'No',

    // Timer
    timer: 'Timer',
    pomodoroDescription: 'Focus with the Pomodoro technique',
    studyTime: 'Study Time',
    breakTime: 'Break Time',
    cycle: 'Cycle',
    reset: 'Reset',
    cycleProgress: 'Cycle Progress',
    completedCycles: 'Completed Cycles',
    timerSettings: 'Timer Settings',
    studyDuration: 'Study Duration',
    breakDuration: 'Break Duration',
    numberOfCycles: 'Number of Cycles',
    minutes: 'minutes',
    apply: 'Apply',
  },
  ko: {
    // Navigation
    home: '홈',
    calendar: '캘린더',
    notes: '노트',
    settings: '설정',
    studyPlan: 'StudyPlan',
    studyManagement: '학습 관리',

    // Home Page
    welcomeBack: '환영합니다',
    stayOrganized: '강력한 계획 도구로 학습을 체계적으로 관리하세요.',
    today: '오늘',
    thisWeek: '이번 주',
    sessions: '세션',
    todaysSchedule: '오늘의 일정',
    viewCalendar: '캘린더 보기',
    noSessionsToday: '오늘 예정된 학습 세션이 없습니다',
    scheduleSession: '세션 예약하기',
    weekOverview: '주간 개요',
    recentNotes: '최근 노트',
    viewAllNotes: '모든 노트 보기',
    session: '세션',

    // Calendar Page
    manageSchedule: '학습 일정을 관리하세요',
    addSession: '세션 추가',
    noSessionsScheduled: '예정된 세션 없음',
    addASession: '세션 추가하기',
    addStudySession: '학습 세션 추가',
    title: '제목',
    startTime: '시작 시간',
    endTime: '종료 시간',
    subject: '과목',
    cancel: '취소',
    delete: '삭제',
    edit: '수정',

    // Notes Page
    organizeNotes: '학습 자료를 정리하세요',
    newNote: '새 노트',
    searchNotes: '노트 검색...',
    all: '전체',
    noNotesFound: '노트를 찾을 수 없습니다',
    tryAdjusting: '검색어나 필터를 조정해보세요',
    createFirstNote: '첫 번째 노트를 만들어 시작하세요',
    createNote: '노트 만들기',
    editNote: '노트 수정',
    content: '내용',
    saveChanges: '변경사항 저장',

    // Settings Page
    manageAccount: '계정 및 환경설정을 관리하세요',
    profile: '프로필',
    notifications: '알림',
    appearance: '외관',
    privacy: '개인정보',
    language: '언어',
    profileSettings: '프로필 설정',
    updatePersonalInfo: '개인 정보를 업데이트하세요',
    changeAvatar: '아바타 변경',
    name: '이름',
    email: '이메일',
    emailReadOnly: '이메일은 변경할 수 없습니다 (Google 계정에 연결됨)',
    bio: '소개',
    tellAboutYourself: '자기소개를 작성하세요...',
    notificationPreferences: '알림 설정',
    chooseNotifications: '받을 알림을 선택하세요',
    emailReminders: '이메일 알림',
    emailRemindersDesc: '예정된 세션에 대한 이메일 알림을 받습니다',
    studyReminders: '학습 알림',
    studyRemindersDesc: '학습 세션 시작 전에 알림을 받습니다',
    weeklyReport: '주간 리포트',
    weeklyReportDesc: '주간 진행 상황 요약을 받습니다',
    customizeAppearance: '앱 외관을 커스터마이즈하세요',
    theme: '테마',
    light: '라이트',
    dark: '다크',
    accentColor: '강조 색상',
    privacySecurity: '개인정보 및 보안',
    manageAccountSecurity: '계정 보안을 관리하세요',
    changePassword: '비밀번호 변경',
    changePasswordDesc: '보안을 위해 정기적으로 비밀번호를 변경하세요',
    twoFactorAuth: '2단계 인증',
    twoFactorAuthDesc: '계정에 추가 보안 레이어를 추가하세요',
    enable2FA: '2FA 활성화',
    deleteAccount: '계정 삭제',
    deleteAccountDesc: '계정과 모든 관련 데이터를 영구적으로 삭제합니다',
    saved: '저장됨!',
    save: '변경사항 저장',
    languageSettings: '언어 설정',
    selectLanguage: '선호하는 언어를 선택하세요',

    // Subjects
    mathematics: '수학',
    physics: '물리',
    chemistry: '화학',
    biology: '생물',
    computerScience: '컴퓨터 과학',
    other: '기타',

    // Days
    sunday: '일요일',
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',

    // Auth
    logout: '로그아웃',
    logoutConfirm: '정말 로그아웃 하시겠습니까?',
    yes: '예',
    no: '아니오',

    // Timer
    timer: '타이머',
    pomodoroDescription: '뽀모도로 기법으로 집중하세요',
    studyTime: '공부 시간',
    breakTime: '휴식 시간',
    cycle: '사이클',
    reset: '초기화',
    cycleProgress: '사이클 진행 상황',
    completedCycles: '완료된 사이클',
    timerSettings: '타이머 설정',
    studyDuration: '공부 시간',
    breakDuration: '휴식 시간',
    numberOfCycles: '사이클 수',
    minutes: '분',
    apply: '적용',
  },
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

  const [isLoggedIn, setIsLoggedIn] = useState(true)

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

  const t = (key) => {
    return translations[language][key] || key
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.clear()
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
