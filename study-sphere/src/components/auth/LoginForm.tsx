'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function LoginForm() {
  const { t } = useApp()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'Configuration': 'Server configuration error - check NEXTAUTH_URL and NEXTAUTH_SECRET',
        'AccessDenied': 'Access denied',
        'Verification': 'Token verification failed',
        'OAuthSignin': 'OAuth sign in error - check redirect URI',
        'OAuthCallback': 'OAuth callback error - check Google credentials',
        'OAuthCreateAccount': 'Could not create OAuth account',
        'EmailCreateAccount': 'Could not create email account',
        'Callback': 'Callback error',
        'OAuthAccountNotLinked': 'Account already linked to another provider',
        'Default': 'Authentication error',
      }
      setError(errorMessages[errorParam] || `Error: ${errorParam}`)
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn('google', {
        callbackUrl: '/home',
        redirect: true,
      })
    } catch (err) {
      console.error('Google login error:', err)
      setError(t('googleLoginFailed'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <Image
              src="/logo.png"
              alt="StudySphere Logo"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">StudySphere</h1>
          <p className="text-indigo-200 mt-2">{t('studyManagement')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            {t('login')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">{t('continueWithGoogle')}</span>
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('loginDescription')}
          </p>
        </div>
      </div>
    </div>
  )
}
