import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useApp } from '../context/AppContext'

const PricingPage = () => {
  const { t } = useTranslation()
  const { user } = useApp()

  const plans = [
    {
      name: 'free',
      price: 0,
      features: [
        '1 Horse',
        'Basic Monitoring',
        'Limited History',
        'Email Support'
      ]
    },
    {
      name: 'pro',
      price: 29,
      features: [
        '10 Horses',
        'Advanced Analytics',
        'Full History',
        'Priority Support',
        'Training Schedule'
      ]
    },
    {
      name: 'enterprise',
      price: 99,
      features: [
        'Unlimited Horses',
        'All Analytics',
        'Full History',
        '24/7 Support',
        'Training Schedule',
        'Admin Panel',
        'Custom Reports'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
                alt="Victorious Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <Link to="/" className="text-2xl font-bold text-red-600">victorious</Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/login" className="text-gray-700 hover:text-red-600">
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">{t('pricing.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                plan.name === user?.subscription ? 'ring-2 ring-red-600' : ''
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{t(`pricing.${plan.name}`)}</h3>
                <div className="text-4xl font-bold text-red-600">
                  ${plan.price}
                  <span className="text-lg text-gray-500">/{t('pricing.month')}</span>
                </div>
                {plan.name === user?.subscription && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {t('pricing.current')}
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold ${
                  plan.name === user?.subscription
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                disabled={plan.name === user?.subscription}
              >
                {plan.name === user?.subscription ? t('pricing.current') : t('pricing.upgrade')}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default PricingPage
