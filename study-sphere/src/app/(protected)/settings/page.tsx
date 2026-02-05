'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { User, Bell, Palette, Shield, Save, Check, Globe, Camera } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function Settings() {
  const { data: session } = useSession()
  const { t, language, setLanguage, settings, setSettings } = useApp()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const user = session?.user || { name: 'User', email: '' }

  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: '',
  })
  const fileInputRef = useRef(null)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleThemeChange = (theme) => {
    setSettings({
      ...settings,
      theme,
    })
  }

  const handleAccentColorChange = (accentColor) => {
    setSettings({
      ...settings,
      accentColor,
    })
  }

  const handleNotificationChange = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
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

  const accentColors = [
    { name: 'indigo', color: 'bg-indigo-600' },
    { name: 'blue', color: 'bg-blue-600' },
    { name: 'purple', color: 'bg-purple-600' },
    { name: 'pink', color: 'bg-pink-600' },
    { name: 'red', color: 'bg-red-600' },
    { name: 'green', color: 'bg-green-600' },
  ]

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">{t('settings')}</h1>
          <p className="text-indigo-100 mt-1">{t('manageAccount')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-100">
              <nav className="p-4">
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('profileSettings')}</h2>
                    <p className="text-gray-500 text-sm">{t('updatePersonalInfo')}</p>
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
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('googleProfilePhoto')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                      <input
                        type="text"
                        value={user.name || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">{t('googleProfileReadOnly')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {t('notificationPreferences')}
                    </h2>
                    <p className="text-gray-500 text-sm">{t('chooseNotifications')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('emailReminders')}</h3>
                        <p className="text-sm text-gray-500">{t('emailRemindersDesc')}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('emailReminders')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.notifications.emailReminders ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.notifications.emailReminders ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('studyReminders')}</h3>
                        <p className="text-sm text-gray-500">{t('studyRemindersDesc')}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('studyReminders')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.notifications.studyReminders ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.notifications.studyReminders ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('weeklyReport')}</h3>
                        <p className="text-sm text-gray-500">{t('weeklyReportDesc')}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('weeklyReport')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.notifications.weeklyReport ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.notifications.weeklyReport ? 'left-7' : 'left-1'
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('appearance')}</h2>
                    <p className="text-gray-500 text-sm">{t('customizeAppearance')}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('theme')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          settings.theme === 'light'
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-20 bg-white rounded-lg border border-gray-200 mb-2" />
                        <span className="font-medium text-gray-900">{t('light')}</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          settings.theme === 'dark'
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-20 bg-gray-800 rounded-lg mb-2" />
                        <span className="font-medium text-gray-900">{t('dark')}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('accentColor')}</h3>
                    <div className="flex gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleAccentColorChange(color.name)}
                          className={`w-10 h-10 rounded-full ${color.color} flex items-center justify-center transition-transform ${
                            settings.accentColor === color.name ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                        >
                          {settings.accentColor === color.name && (
                            <Check className="w-5 h-5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('languageSettings')}</h2>
                    <p className="text-gray-500 text-sm">{t('selectLanguage')}</p>
                  </div>

                  <div className="space-y-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                          language === lang.code
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-gray-900">{lang.name}</h3>
                          <p className="text-sm text-gray-500">
                            {lang.code === 'ko' ? '한국어로 앱 사용하기' : 'Use the app in English'}
                          </p>
                        </div>
                        {language === lang.code && (
                          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('privacySecurity')}</h2>
                    <p className="text-gray-500 text-sm">{t('manageAccountSecurity')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">{t('googleAccount')}</h3>
                      <p className="text-sm text-gray-500 mb-3">{t('googleAccountDesc')}</p>
                      <p className="text-sm text-indigo-600">{t('manageGoogleSecurity')}</p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <h3 className="font-medium text-red-900 mb-1">{t('deleteAccount')}</h3>
                      <p className="text-sm text-red-600 mb-3">
                        {t('deleteAccountDesc')}
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        {t('deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
