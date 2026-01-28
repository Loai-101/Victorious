import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Lottie from 'lottie-react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useApp } from '../context/AppContext'
import fingerprintAnimation from './inmtions/Fingerprint Verification (1).json'

const LoginPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useApp()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showContent, setShowContent] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 1000) // Show after 1 second

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    // Validate credentials
    if (formData.username === 'Victorious' && formData.password === 'v.forever') {
      // Correct credentials - show animation
      setShowAnimation(true)
      // Wait for animation to complete (about 2 seconds based on animation duration) then navigate to welcome page
      setTimeout(() => {
        login()
        navigate('/welcome')
      }, 2500)
    } else {
      // Wrong credentials - show error
      setErrorMessage('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://res.cloudinary.com/dvybb2xnc/video/upload/v1769596383/WhatsApp_Video_2026-01-28_at_1.30.58_PM_hgfru2.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-[1]"></div>
      
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Login Window */}
        <div 
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${
            showContent 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Window Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <img 
                src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
                alt="Victorious Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <h2 className="text-2xl font-bold">Victorious</h2>
            </div>
          </div>
          
          {/* Fingerprint Animation Overlay */}
          {showAnimation && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-20 rounded-2xl">
              <div className="flex flex-col items-center">
                <Lottie 
                  animationData={fingerprintAnimation}
                  loop={false}
                  style={{ width: 200, height: 200 }}
                />
                <p className="text-gray-700 font-semibold mt-4">Verifying...</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className={`p-8 space-y-6 ${showAnimation ? 'opacity-0 pointer-events-none' : ''}`} onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value })
                  setErrorMessage('') // Clear error when user types
                }}
              />
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setErrorMessage('') // Clear error when user types
                }}
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            {/* Login Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
