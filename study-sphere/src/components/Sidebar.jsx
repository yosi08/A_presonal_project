import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { Home, Calendar, BookOpen, Settings, LogOut, GraduationCap, Timer } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Sidebar() {
  const { user, t, logout } = useApp()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navItems = [
    { path: '/home', icon: Home, labelKey: 'home' },
    { path: '/timer', icon: Timer, labelKey: 'timer' },
    { path: '/calendar', icon: Calendar, labelKey: 'calendar' },
    { path: '/notes', icon: BookOpen, labelKey: 'notes' },
    { path: '/settings', icon: Settings, labelKey: 'settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowLogoutConfirm(false)
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{t('studyPlan')}</h1>
            <p className="text-xs text-gray-500">{t('studyManagement')}</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
                      <span className="font-medium">{t(item.labelKey)}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="shrink-0 text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-gray-100 transition-colors"
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
