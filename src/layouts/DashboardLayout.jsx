import React, { useState } from 'react'
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

  // Compute menu items directly - always includes alerts in baseItems
  const baseItems = [
    { path: '/dashboard', label: t('nav.dashboard') },
    { path: '/dashboard/schedule', label: t('nav.schedule') },
    { path: '/dashboard/route-map', label: 'route map' },
    { path: '/dashboard/alerts', label: t('nav.alerts') }
  ]

  let menuItems = baseItems

  if (user?.role === 'horse_owner') {
    menuItems = [
      ...baseItems,
      { path: '/dashboard/horses', label: t('nav.horses'), icon: '🐴' }
    ]
  } else if (user?.role === 'stable_manager') {
    menuItems = [
      ...baseItems,
      { path: '/dashboard/horses', label: t('nav.horses'), icon: '🐴' },
      { path: '/dashboard/riders', label: t('nav.riders'), icon: '👤' },
      { path: '/dashboard/trainers/1', label: t('nav.trainers'), icon: '🏋️' }
    ]
  } else if (user?.role === 'stable_owner' || user?.role === 'admin') {
    menuItems = [
      ...baseItems,
      { path: '/dashboard/horses', label: t('nav.horses'), icon: '🐴' },
      { path: '/dashboard/riders', label: t('nav.riders'), icon: '👤' },
      { path: '/dashboard/trainers/1', label: t('nav.trainers'), icon: '🏋️' }
    ]
    
    if (user?.role === 'admin') {
      menuItems.push({ path: '/dashboard/admin', label: t('nav.admin'), icon: '⚙️' })
    }
  }

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
              (item.path === '/dashboard/route-map' && location.pathname.startsWith('/dashboard/route-map')) ||
              (item.path === '/dashboard/alerts' && location.pathname.startsWith('/dashboard/alerts'))
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
