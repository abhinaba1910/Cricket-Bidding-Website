import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { AuctionProvider }      from './context/AuctionContext'
import { PlayerProvider }       from './context/PlayerContext'
import { TeamProvider }         from './context/TeamContext'
import { BidProvider }          from './context/BidContext'

import SplashScreen from './components/splashScreen'
import AuthPage     from './pages/authentication/AuthPage'
import Layout       from './components/layout/Layout'
import Dashboard    from './pages/Dashboard'
import CreateAuction from './pages/CreateAuction'

import './App.css'
import CreateTeam from './pages/team/CreateTeam'
import AddPlayer from './pages/player/AddPlayer'
import AuctionsInfo from './pages/auctions/AuctionsInfo'
import TeamsInfo from './pages/team/TeamsInfo'
import PlayersInfo from './pages/player/PlayersInfo'

/**
 * This component handles:
 *  - waiting out the splash screen
 *  - showing a loading spinner while auth state is resolving
 *  - redirecting to login if not authenticated
 *  - protecting the /create-auction route for admin users
 */
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only if not already shown in this session
    return sessionStorage.getItem('splashShown') !== 'true'
  })
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false)
        sessionStorage.setItem('splashShown', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSplash])

  if (showSplash) {
    return <SplashScreen />
  }

  // auth is still checking?
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Router>
      { !isAuthenticated
          ? <Routes>
              <Route path="/*" element={<AuthPage />} />
            </Routes>
          : <Layout>
              <Routes>
                <Route path="/"           element={<Dashboard />} />
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route
                  path="/create-auction"
                  element={
                    user?.role === 'admin'
                      ? <CreateAuction />
                      : <Navigate to="/dashboard" replace />
                  }
                />
                {/* catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                <Route path="/create-team"  element={<CreateTeam />} />
                <Route path="/add-players"  element={<AddPlayer />} />
                <Route path="/admin-auction-info"     element={<AuctionsInfo />} />
                <Route path="/admin-teams-info"     element={<TeamsInfo />} />
                <Route path="/admin-players-info"     element={<PlayersInfo />} />
              </Routes>
            </Layout>
      }
    </Router>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <PlayerProvider>
          <TeamProvider>
            <BidProvider>
              <AppContent />
            </BidProvider>
          </TeamProvider>
        </PlayerProvider>
      </AuctionProvider>
    </AuthProvider>
  )
}
