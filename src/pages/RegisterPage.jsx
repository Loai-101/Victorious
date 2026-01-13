import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { countries, cities } from '../data/mockData'

const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    esimImage: null,
    deviceIdImage: null,
    barcodeImage: null,
    status: 'pending'
  })
  const [selectedCountry, setSelectedCountry] = useState('')

  const handleFileChange = (field, e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, [field]: file })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock registration - just navigate to login
    navigate('/login')
  }

  const handleCountryChange = (e) => {
    const country = e.target.value
    setSelectedCountry(country)
    setFormData({ ...formData, country, city: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
              alt="Victorious Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <Link to="/" className="text-2xl font-bold text-red-600">victorious</Link>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{t('register.title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.fullName')}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.phone')}
              </label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.email')}
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.country')}
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={selectedCountry}
                onChange={handleCountryChange}
              >
                <option value="">{t('register.country')}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.city')}
              </label>
              <select
                required
                disabled={!selectedCountry}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="">{t('register.city')}</option>
                {selectedCountry && cities[selectedCountry]?.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.esimImage')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('esimImage', e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.deviceIdImage')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('deviceIdImage', e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.barcodeImage')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('barcodeImage', e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t('register.status')}:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {t(`register.${formData.status}`)}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-md font-semibold hover:bg-red-700"
          >
            {t('register.submit')}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t('register.hasAccount')} </span>
            <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
              {t('register.login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
