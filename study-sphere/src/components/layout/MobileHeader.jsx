'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Menu, X, Home, Calendar, BookOpen, Settings, GraduationCap, LogOut, Timer } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function MobileHeader({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const { t } = useApp()

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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">{t('studyPlan')}</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl">
            <Link
              href="/home"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">{t('studyPlan')}</h1>
                <p className="text-xs text-gray-500">{t('studyManagement')}</p>
              </div>
            </Link>

            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${active ? 'text-indigo-600' : ''}`} />
                        <span className="font-medium">{t(item.labelKey)}</span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="shrink-0 text-gray-400 hover:text-red-500 p-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('logout')}</h3>
            <p className="text-gray-600 mb-6">{t('logoutConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
