import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppProvider } from './context/AppContext'
import { LiveDataProvider } from './context/LiveDataContext'
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/PricingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WelcomePage from './pages/WelcomePage'
import DashboardLayout from './layouts/DashboardLayout'
import HorseProfile from './pages/HorseProfile'
import RiderProfile from './pages/RiderProfile'
import TrainerProfile from './pages/TrainerProfile'
import LiveDashboard from './pages/LiveDashboard'
import TrainingSchedule from './pages/TrainingSchedule'
import AdminPanel from './pages/AdminPanel'
import HorsesList from './pages/HorsesList'
import RidersList from './pages/RidersList'
import RouteMap from './pages/RouteMap'

function AppContent() {
  const { i18n } = useTranslation()
  
  // Set document direction based on language
  React.useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<LiveDashboard />} />
          <Route path="live" element={<LiveDashboard />} />
          <Route path="horses" element={<HorsesList />} />
          <Route path="horses/:id" element={<HorseProfile />} />
          <Route path="riders" element={<RidersList />} />
          <Route path="riders/:id" element={<RiderProfile />} />
          <Route path="trainers/:id" element={<TrainerProfile />} />
          <Route path="schedule" element={<TrainingSchedule />} />
          <Route path="route-map" element={<RouteMap />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AppProvider>
      <LiveDataProvider>
        <AppContent />
      </LiveDataProvider>
    </AppProvider>
  )
}

export default App
