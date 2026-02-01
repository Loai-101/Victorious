import React, { useState, useMemo } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

const DashboardLayout = () => {
  const { t } = useTranslation()
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Compute menu items with useMemo to ensure it updates when user changes
  const menuItems = useMemo(() => {
    // Base items - always includes these
    const baseItems = [
      { path: '/dashboard', label: t('nav.dashboard') },
      { path: '/dashboard/victoris-agent', label: 'Victoris Agent' },
      { path: '/dashboard/schedule', label: t('nav.schedule') },
      { path: '/dashboard/track-live', label: t('nav.trackLive', 'Track Live') },
      { path: '/dashboard/alerts', label: t('nav.alerts') },
      { path: '/dashboard/devices', label: 'Device Management', icon: '📱' }
    ]

    // If user is not loaded yet, return base items with Reports
    if (!user || !user.role) {
      return [...baseItems, { path: '/dashboard/reports', label: 'Reports', icon: '📊' }]
    }

    // Role-based menu items
    if (user.role === 'trainer_manager') {
      return [
        ...baseItems,
        { path: '/dashboard/horses', label: t('nav.horses'), icon: '🐴' },
        { path: '/dashboard/horses/medical', label: t('nav.horseMedical', 'Horse Medical'), icon: '🏥' },
        { path: '/dashboard/reports', label: 'Reports', icon: '📊' }
      ]
    } else if (user.role === 'stable_manager') {
      return [
        ...baseItems,
        { path: '/dashboard/horses', label: t('nav.horses'), icon: '🐴' },
        { path: '/dashboard/horses/medical', label: t('nav.horseMedical', 'Horse Medical'), icon: '🏥' },
        { path: '/dashboard/riders', label: t('nav.riders'), icon: '👤' },
        { path: '/dashboard/trainers/1', label: t('nav.trainers'), icon: '🏋️' },
        { path: '/dashboard/reports', label: 'Reports', icon: '📊' }
      ]
    } else if (user.role === 'stable_owner' || user.role === 'admin') {
      const items = [
        ...baseItems,
        { path: '/dashboard/horses', label: t('nav.horses'), icon: '🐴' },
        { path: '/dashboard/horses/medical', label: t('nav.horseMedical', 'Horse Medical'), icon: '🏥' },
        { path: '/dashboard/riders', label: t('nav.riders'), icon: '👤' },
        { path: '/dashboard/trainers/1', label: t('nav.trainers'), icon: '🏋️' },
        { path: '/dashboard/reports', label: 'Reports', icon: '📊' },
        { path: '/dashboard/settings', label: 'Settings', icon: '🔧' }
      ]
      if (user.role === 'admin') {
        items.push({ path: '/dashboard/admin', label: t('nav.admin'), icon: '⚙️' })
      }
      return items
    }

    // Default: return base items with Reports if role doesn't match
    return [...baseItems, { path: '/dashboard/reports', label: 'Reports', icon: '📊' }]
  }, [user, t])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed md:static inset-y-0 left-0 z-30 w-64 bg-red-600 text-white transition-transform duration-300 ease-in-out md:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-red-700">
          <div className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
              alt="Victorious Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold text-white">victorious</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-red-200"
          >
            ×
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/dashboard/live') ||
              (item.path === '/dashboard/track-live' && location.pathname.startsWith('/dashboard/track-live')) ||
              (item.path === '/dashboard/alerts' && location.pathname.startsWith('/dashboard/alerts')) ||
              (item.path === '/dashboard/victoris-agent' && location.pathname.startsWith('/dashboard/victoris-agent')) ||
              (item.path === '/dashboard/reports' && location.pathname.startsWith('/dashboard/reports')) ||
              (item.path === '/dashboard/devices' && location.pathname.startsWith('/dashboard/devices')) ||
              (item.path === '/dashboard/settings' && location.pathname.startsWith('/dashboard/settings')) ||
              (item.path === '/dashboard/horses/medical' && location.pathname === '/dashboard/horses/medical')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white ${
                  isActive 
                    ? 'bg-red-800 text-white font-semibold' 
                    : 'hover:bg-red-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600"
          >
            ☰
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
              <img 
                src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
                alt={user?.name || 'User'} 
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              {t('nav.logout')}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
