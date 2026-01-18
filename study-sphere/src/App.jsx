import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import Timer from './pages/Timer'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useApp()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isLoggedIn } = useApp()

  if (isLoggedIn) {
    return <Navigate to="/home" replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="timer" element={<Timer />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="notes" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
