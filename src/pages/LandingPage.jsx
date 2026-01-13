import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

const LandingPage = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
                alt="Victorious Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-2xl font-bold text-red-600">victorious</div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/login" className="text-gray-700 hover:text-red-600">
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                {t('nav.register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('landing.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('landing.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700"
            >
              {t('landing.getStarted')}
            </Link>
            <Link
              to="/pricing"
              className="bg-white text-red-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-red-600 hover:bg-red-50"
            >
              {t('landing.learnMore')}
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Real-time Monitoring</h3>
            <p className="text-gray-600">
              Monitor your horse's heart rate, speed, and performance in real-time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-gray-600">
              Get detailed insights with charts and analytics for better training decisions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Multi-language Support</h3>
            <p className="text-gray-600">
              Available in English and Arabic with full RTL support.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
