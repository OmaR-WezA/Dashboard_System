import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Search = lazy(() => import('./pages/Search'))

// Loading component
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#0066cc'
  }}>
    Loading...
  </div>
)

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/search" element={<Search />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/search" />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App

