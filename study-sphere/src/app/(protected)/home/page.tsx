'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Calendar, Clock, BookOpen, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function Home() {
  const { data: session } = useSession()
  const { t, sessions, notes, totalNotesCount, totalSessionsCount } = useApp()

  const user = session?.user || { name: 'User' }

  // Memoize all session-related calculations in a single pass
  const { todaySessions, totalHours, weekDays } = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Pre-generate week date strings for lookup
    const weekDateStrings: string[] = []
    const weekDaysData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      weekDateStrings.push(dateStr)
      return {
        day: shortDays[date.getDay()],
        date: date.getDate(),
        labelKey: dateStr === todayStr ? 'today' : dayNames[date.getDay()],
        isToday: dateStr === todayStr,
        sessions: 0,
        dateStr,
      }
    })

    // Single pass through sessions
    const todaySessionsList: typeof sessions = []
    let hours = 0

    for (const s of sessions) {
      const weekIndex = weekDateStrings.indexOf(s.date)
      if (weekIndex !== -1) {
        weekDaysData[weekIndex].sessions++
        const start = s.startTime.split(':').map(Number)
        const end = s.endTime.split(':').map(Number)
        hours += (end[0] + end[1]/60) - (start[0] + start[1]/60)
      }
      if (s.date === todayStr) {
        todaySessionsList.push(s)
      }
    }

    return {
      todaySessions: todaySessionsList,
      totalHours: hours,
      weekDays: weekDaysData,
    }
  }, [sessions])

  const stats = useMemo(() => [
    { icon: Calendar, labelKey: 'today', value: todaySessions.length.toString() },
    { icon: Clock, labelKey: 'thisWeek', value: `${Math.round(totalHours)}h` },
    { icon: BookOpen, labelKey: 'notes', value: (totalNotesCount || notes.length).toString() },
    { icon: TrendingUp, labelKey: 'sessions', value: (totalSessionsCount || sessions.length).toString() },
  ], [todaySessions.length, totalHours, totalNotesCount, notes.length, totalSessionsCount, sessions.length])

  // Get recent notes (last 3)
  const recentNotes = useMemo(() => notes.slice(0, 3), [notes])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-[#2563EB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              {t('welcomeBack')}, {user.name}!
            </h1>
            <p className="text-white/80 text-lg sm:text-xl max-w-2xl">
              {t('stayOrganized')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">{t(stat.labelKey)}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white dark:bg-gray-800 shadow-lg border-0">
              <div className="p-6 flex flex-row items-center justify-between pb-2">
                <h2 className="text-xl font-semibold dark:text-gray-100">{t('todaysSchedule')}</h2>
                <Link href="/calendar">
                  <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 px-3 py-2 rounded-md transition-colors font-medium">
                    {t('viewCalendar')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </Link>
              </div>
              <div className="p-6 pt-0">
                {todaySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noSessionsToday')}</p>
                    <Link href="/calendar">
                      <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('scheduleSession')}
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySessions.map((session) => (
                      <Link href="/calendar" key={session.id}>
                        <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className={`w-1 h-full min-h-[50px] rounded-full ${session.color}`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{session.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {session.startTime} - {session.endTime}
                              </p>
                              <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                {session.subject}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Week Overview */}
          <div>
            <div className="rounded-xl bg-white dark:bg-gray-800 shadow-lg border-0 h-full">
              <div className="p-6 pb-2">
                <h2 className="text-xl font-semibold dark:text-gray-100">{t('weekOverview')}</h2>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-2">
                  {weekDays.map((day, index) => (
                    <Link href="/calendar" key={index}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                          day.isToday
                            ? 'bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                              day.isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="text-xs font-medium">{day.day}</span>
                            <span className="text-sm font-bold">{day.date}</span>
                          </div>
                          <span className={day.isToday ? 'font-medium text-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}>
                            {t(day.labelKey)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                            day.sessions > 0
                              ? 'bg-blue-600 text-white border-transparent shadow'
                              : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {day.sessions} {t('session')}{day.sessions !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="mt-6">
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-lg border-0">
            <div className="p-6 flex flex-row items-center justify-between pb-2">
              <h2 className="text-xl font-semibold dark:text-gray-100">{t('recentNotes')}</h2>
              <Link href="/notes">
                <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 px-3 py-2 rounded-md transition-colors font-medium">
                  {t('viewAllNotes')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </div>
            <div className="p-6 pt-0">
              {recentNotes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{t('createFirstNote')}</p>
                  <Link href="/notes">
                    <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('createNote')}
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentNotes.map((note) => (
                    <Link href="/notes" key={note.id}>
                      <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer group">
                        <div
                          className="w-full h-1 rounded-full mb-3"
                          style={{ backgroundColor: note.color }}
                        />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {note.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {note.subject} • {note.date}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{note.content}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
