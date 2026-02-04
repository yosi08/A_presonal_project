import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'
import { AppProvider } from '@/context/AppContext'

export const metadata = {
  title: 'StudyPlan',
  description: 'Study Management Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
