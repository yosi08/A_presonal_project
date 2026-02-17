'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, Bell, Palette, Shield, Save, Check, Globe, Camera } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { deleteUserData } from '@/lib/firestore'

export default function Settings() {
  const { data: session } = useSession()
  const { t, language, setLanguage, settings, setSettings, requestNotificationPermission, notificationPermission } = useApp()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Draft state for unsaved changes
  const [draftSettings, setDraftSettings] = useState(settings)
  const [draftLanguage, setDraftLanguage] = useState(language)

  // Sync draft when context values change externally
  useEffect(() => { setDraftSettings(settings) }, [settings])
  useEffect(() => { setDraftLanguage(language) }, [language])

  const hasChanges = useMemo(() => {
    return JSON.stringify(draftSettings) !== JSON.stringify(settings) || draftLanguage !== language
  }, [draftSettings, draftLanguage, settings, language])

  const user = session?.user || { name: 'User', email: '' }

  const fileInputRef = useRef(null)

  const handleSave = () => {
    setSettings(draftSettings)
    setLanguage(draftLanguage)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDiscard = () => {
    setDraftSettings(settings)
    setDraftLanguage(language)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // Delete Firestore data
      const userId = (session?.user as any)?.id
      if (userId) {
        await deleteUserData(userId)
      }

      // Clear localStorage
      localStorage.removeItem('sessions')
      localStorage.removeItem('notes')
      localStorage.removeItem('settings')
      localStorage.removeItem('language')
      localStorage.removeItem('timerPresets')
      localStorage.removeItem('lastEmailDate')
      localStorage.removeItem('lastWeeklyReportDate')
      await signOut({ callbackUrl: '/login' })
    } catch {
      setDeleting(false)
    }
  }

  const handleThemeChange = (theme) => {
    setDraftSettings({
      ...draftSettings,
      theme,
    })
  }

  const handleNotificationChange = async (key) => {
    const newValue = !draftSettings.notifications[key]

    // Request browser notification permission when enabling studyReminders
    if (key === 'studyReminders' && newValue) {
      const permission = await requestNotificationPermission()
      if (permission === 'denied') return
    }

    setDraftSettings({
      ...draftSettings,
      notifications: {
        ...draftSettings.notifications,
        [key]: newValue,
      },
    })
  }

  const tabs = [
    { id: 'profile', labelKey: 'profile', icon: User },
    { id: 'notifications', labelKey: 'notifications', icon: Bell },
    { id: 'appearance', labelKey: 'appearance', icon: Palette },
    { id: 'language', labelKey: 'language', icon: Globe },
    { id: 'privacy', labelKey: 'privacy', icon: Shield },
  ]

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-[#2563EB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">{t('settings')}</h1>
          <p className="text-white/80 mt-1">{t('manageAccount')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
              <nav className="p-4">
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span className="font-medium">{t(tab.labelKey)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('profileSettings')}</h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('googleProfilePhoto')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                      <input
                        type="text"
                        value={user.name || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">{t('googleProfileReadOnly')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">{t('emailReadOnly')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t('notificationPreferences')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('chooseNotifications')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('emailReminders')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('emailRemindersDesc')}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('emailReminders')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          draftSettings.notifications.emailReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            draftSettings.notifications.emailReminders ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('studyReminders')}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('studyRemindersDesc')}</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('studyReminders')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            draftSettings.notifications.studyReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              draftSettings.notifications.studyReminders ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                      {draftSettings.notifications.studyReminders && notificationPermission === 'denied' && (
                        <p className="text-sm text-red-500 mt-2">{t('notificationPermissionDenied')}</p>
                      )}
                      {draftSettings.notifications.studyReminders && notificationPermission === 'granted' && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">{t('notificationPermissionGranted')}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('weeklyReport')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('weeklyReportDesc')}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('weeklyReport')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          draftSettings.notifications.weeklyReport ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            draftSettings.notifications.weeklyReport ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('appearance')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('customizeAppearance')}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('theme')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          draftSettings.theme === 'light'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="w-full h-20 bg-white dark:bg-gray-300 rounded-lg border border-gray-200 dark:border-gray-400 mb-2" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{t('light')}</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          draftSettings.theme === 'dark'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="w-full h-20 bg-gray-800 rounded-lg mb-2" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{t('dark')}</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('languageSettings')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('selectLanguage')}</p>
                  </div>

                  <div className="space-y-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setDraftLanguage(lang.code)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                          draftLanguage === lang.code
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{lang.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lang.code === 'ko' ? '한국어로 앱 사용하기' : 'Use the app in English'}
                          </p>
                        </div>
                        {draftLanguage === lang.code && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('privacySecurity')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manageAccountSecurity')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-100 dark:border-red-900">
                      <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">{t('deleteAccount')}</h3>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                        {t('deleteAccountDesc')}
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        {t('deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Bar */}
              {hasChanges && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('unsavedChanges') || '저장되지 않은 변경 사항이 있습니다.'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDiscard}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('discard') || '취소'}
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saved ? (t('saved') || '저장됨!') : (t('saveChanges') || '저장하기')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">{t('deleteAccount')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              {t('deleteAccountConfirmMsg') || '정말로 계정을 삭제하시겠습니까? 모든 데이터(세션, 노트, 설정)가 삭제되며 이 작업은 되돌릴 수 없습니다.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {deleting ? t('deleting') || '삭제 중...' : t('deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

