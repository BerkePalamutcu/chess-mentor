import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BoardSettingsPage } from '../pages/BoardSettingsPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PuzzleHistoryPage } from '../pages/PuzzleHistoryPage'
import { PuzzlePage } from '../pages/PuzzlePage'
import { RegisterPage } from '../pages/RegisterPage'
import { PrivateRoute } from './PrivateRoute'

export function AppRouter() {
  const { user, isLoading } = useAuth()

  // Redirect already-authenticated users away from auth pages
  const authGuard = (page: ReactElement) =>
    !isLoading && user ? <Navigate to="/" replace /> : page

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/puzzles"
        element={
          <PrivateRoute>
            <PuzzlePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/puzzles/history"
        element={
          <PrivateRoute>
            <PuzzleHistoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings/board"
        element={
          <PrivateRoute>
            <BoardSettingsPage />
          </PrivateRoute>
        }
      />
      <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
      <Route path="/login" element={authGuard(<LoginPage />)} />
      <Route path="/register" element={authGuard(<RegisterPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
