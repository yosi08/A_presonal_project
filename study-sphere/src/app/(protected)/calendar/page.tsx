'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, X, Trash2, Edit3 } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Calendar() {
  const { t, sessions, setSessions } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [newSession, setNewSession] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'Mathematics',
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDay = firstDayOfMonth.getDay()
  const totalDays = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const getSessionsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return sessions.filter((session) => session.date === dateStr)
  }

  const handleAddSession = () => {
    if (!newSession.title) return

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

    if (editingSession) {
      setSessions(sessions.map(s =>
        s.id === editingSession.id
          ? { ...editingSession, ...newSession, date: dateStr }
          : s
      ))
      setEditingSession(null)
    } else {
      setSessions([
        ...sessions,
        {
          id: Date.now(),
          ...newSession,
          date: dateStr,
          color: 'bg-indigo-600',
        },
      ])
    }
    setNewSession({ title: '', startTime: '09:00', endTime: '10:00', subject: 'Mathematics' })
    setIsModalOpen(false)
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setNewSession({
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      subject: session.subject,
    })
    setIsModalOpen(true)
  }

  const handleDeleteSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId))
  }

  const openAddModal = () => {
    setEditingSession(null)
    setNewSession({ title: '', startTime: '09:00', endTime: '10:00', subject: 'Mathematics' })
    setIsModalOpen(true)
  }

  const selectedDateSessions = sessions.filter(s => {
    const selDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    return s.date === selDateStr
  })

  const renderCalendarDays = () => {
    const days = []

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-24" />)
    }

    for (let day = 1; day <= totalDays; day++) {
      const daySessions = getSessionsForDate(day)

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(year, month, day))}
          className={`h-12 sm:h-24 border border-gray-100 dark:border-gray-700 p-1 sm:p-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
            isSelected(day) ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-sm rounded-full ${
                isToday(day)
                  ? 'bg-indigo-600 text-white'
                  : isSelected(day)
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {day}
            </span>
          </div>
          <div className="hidden sm:block mt-1 space-y-1">
            {daySessions.slice(0, 2).map((session) => (
              <div
                key={session.id}
                className={`text-xs px-1 py-0.5 rounded truncate text-white ${session.color}`}
              >
                {session.title}
              </div>
            ))}
            {daySessions.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">+{daySessions.length - 2} more</div>
            )}
          </div>
          {daySessions.length > 0 && (
            <div className="sm:hidden flex gap-0.5 mt-1">
              {daySessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className={`w-1.5 h-1.5 rounded-full ${session.color}`}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">{t('calendar')}</h1>
          <p className="text-indigo-100 mt-1">{t('manageSchedule')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {MONTHS[month]} {year}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">{renderCalendarDays()}</div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDateSessions.length} {t('session')}(s)</p>
                </div>
                <button
                  onClick={openAddModal}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {selectedDateSessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noSessionsScheduled')}</p>
                  <button
                    onClick={openAddModal}
                    className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {t('addASession')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-full min-h-[40px] rounded-full ${session.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{session.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {session.startTime} - {session.endTime}
                          </p>
                          <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                            {session.subject}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditSession(session)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-gray-100">
                {editingSession ? t('edit') : t('addStudySession')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Study session title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startTime')}</label>
                  <input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endTime')}</label>
                  <input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subject')}</label>
                <select
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Mathematics">{t('mathematics')}</option>
                  <option value="Physics">{t('physics')}</option>
                  <option value="Chemistry">{t('chemistry')}</option>
                  <option value="Biology">{t('biology')}</option>
                  <option value="Computer Science">{t('computerScience')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddSession}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingSession ? t('saveChanges') : t('addSession')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
