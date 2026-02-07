'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, Calendar, BookOpen, Settings, LogOut, Timer } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const { t } = useApp()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navItems = [
    { path: '/home', icon: Home, labelKey: 'home' },
    { path: '/timer', icon: Timer, labelKey: 'timer' },
    { path: '/calendar', icon: Calendar, labelKey: 'calendar' },
    { path: '/notes', icon: BookOpen, labelKey: 'notes' },
    { path: '/settings', icon: Settings, labelKey: 'settings' },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isActive = (path) => pathname === path

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden lg:flex flex-col">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <Image
            src="/logo.png"
            alt="StudySphere Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg">StudySphere</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('studyManagement')}</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      active
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    <span className="font-medium">{t(item.labelKey)}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="shrink-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('logout')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('logoutConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('no')}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
