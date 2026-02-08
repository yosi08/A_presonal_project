'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings, Coffee, BookOpen, Plus, X, Bookmark } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function Timer() {
  const { t, timerPresets, setTimerPresets } = useApp()
  const [studyMinutes, setStudyMinutes] = useState(50)
  const [breakMinutes, setBreakMinutes] = useState(10)
  const [totalCycles, setTotalCycles] = useState(4)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [isStudyTime, setIsStudyTime] = useState(true)
  const [timeLeft, setTimeLeft] = useState(50 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [activePresetId, setActivePresetId] = useState(null)
  const [showPresetSave, setShowPresetSave] = useState(false)
  const [presetName, setPresetName] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handlePhaseComplete()
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft])

  const handlePhaseComplete = () => {
    clearInterval(intervalRef.current)

    if (isStudyTime) {
      setIsStudyTime(false)
      setTimeLeft(breakMinutes * 60)
      setIsRunning(true)
    } else {
      if (currentCycle < totalCycles) {
        setCurrentCycle((prev) => prev + 1)
        setCompletedCycles((prev) => prev + 1)
        setIsStudyTime(true)
        setTimeLeft(studyMinutes * 60)
        setIsRunning(true)
      } else {
        setCompletedCycles((prev) => prev + 1)
        setIsRunning(false)
      }
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setCurrentCycle(1)
    setCompletedCycles(0)
    setIsStudyTime(true)
    setTimeLeft(studyMinutes * 60)
  }

  const applySettings = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setCurrentCycle(1)
    setCompletedCycles(0)
    setIsStudyTime(true)
    setTimeLeft(studyMinutes * 60)
    setShowSettings(false)
  }

  const applyPreset = (preset) => {
    setStudyMinutes(preset.studyMinutes)
    setBreakMinutes(preset.breakMinutes)
    setTotalCycles(preset.totalCycles)
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setCurrentCycle(1)
    setCompletedCycles(0)
    setIsStudyTime(true)
    setTimeLeft(preset.studyMinutes * 60)
    setActivePresetId(preset.id)
  }

  const savePreset = () => {
    if (!presetName.trim()) return
    const newPreset = {
      id: String(Date.now()),
      name: presetName.trim(),
      studyMinutes,
      breakMinutes,
      totalCycles,
    }
    setTimerPresets([...timerPresets, newPreset])
    setPresetName('')
    setShowPresetSave(false)
    setActivePresetId(newPreset.id)
  }

  const deletePreset = (id) => {
    setTimerPresets(timerPresets.filter((p) => p.id !== id))
    if (activePresetId === id) setActivePresetId(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const progress = isStudyTime
    ? ((studyMinutes * 60 - timeLeft) / (studyMinutes * 60)) * 100
    : ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100

  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-[#2563EB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('timer')}</h1>
              <p className="text-white/80 mt-1">{t('pomodoroDescription')}</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Presets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('presets')}</h3>
            </div>
            <button
              onClick={() => setShowPresetSave(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('addPreset')}
            </button>
          </div>

          {timerPresets.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('noPresets')}</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pt-3 pb-2 -mt-1">
              {timerPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`relative group flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all text-left overflow-visible ${
                    activePresetId === preset.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePreset(preset.id) }}
                    className="absolute -top-2 -right-2 hidden group-hover:flex w-5 h-5 items-center justify-center bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{preset.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {preset.studyMinutes}{t('minutes')}/{preset.breakMinutes}{t('minutes')} · {preset.totalCycles}{t('cycle')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Timer Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          {/* Status */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isStudyTime
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            }`}>
              {isStudyTime ? (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">{t('studyTime')}</span>
                </>
              ) : (
                <>
                  <Coffee className="w-5 h-5" />
                  <span className="font-medium">{t('breakTime')}</span>
                </>
              )}
            </div>
          </div>

          {/* Circular Timer */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke={isStudyTime ? '#2563EB' : '#3B82F6'}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('cycle')} {currentCycle} / {totalCycles}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={resetTimer}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              title={t('reset')}
            >
              <RotateCcw className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={toggleTimer}
              className={`p-6 rounded-full transition-colors ${
                isStudyTime
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              title={t('settings')}
            >
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Cycle Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('cycleProgress')}</h3>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: totalCycles }, (_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-medium ${
                  i < completedCycles
                    ? 'bg-blue-500 text-white'
                    : i === currentCycle - 1
                    ? isStudyTime
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {t('completedCycles')}: {completedCycles} / {totalCycles}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowSettings(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('timerSettings')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('studyDuration')} ({t('minutes')})
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={studyMinutes === 0 ? '' : studyMinutes}
                  onChange={(e) => setStudyMinutes(e.target.value === '' ? 0 : Math.min(120, parseInt(e.target.value) || 0))}
                  onBlur={() => { if (studyMinutes < 1) setStudyMinutes(1) }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('breakDuration')} ({t('minutes')})
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes === 0 ? '' : breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value === '' ? 0 : Math.min(60, parseInt(e.target.value) || 0))}
                  onBlur={() => { if (breakMinutes < 1) setBreakMinutes(1) }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('numberOfCycles')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={totalCycles === 0 ? '' : totalCycles}
                  onChange={(e) => setTotalCycles(e.target.value === '' ? 0 : Math.min(10, parseInt(e.target.value) || 0))}
                  onBlur={() => { if (totalCycles < 1) setTotalCycles(1) }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={applySettings}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('apply')}
              </button>
            </div>
            <button
              onClick={() => { setShowSettings(false); setShowPresetSave(true) }}
              className="w-full mt-3 px-4 py-2 flex items-center justify-center gap-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              {t('saveAsPreset')}
            </button>
          </div>
        </div>
      )}
      {/* Preset Save Modal */}
      {showPresetSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowPresetSave(false); setPresetName('') }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('saveAsPreset')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('presetName')}
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder={t('presetNamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div>{t('studyDuration')}: {studyMinutes}{t('minutes')}</div>
                <div>{t('breakDuration')}: {breakMinutes}{t('minutes')}</div>
                <div>{t('numberOfCycles')}: {totalCycles}</div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowPresetSave(false); setPresetName('') }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={savePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
