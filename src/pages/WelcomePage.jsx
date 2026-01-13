import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie from 'lottie-react'
import welcomeAnimation from './inmtions/Welcome.json'

const WelcomePage = () => {
  const navigate = useNavigate()
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // Wait for animation to complete (approximately 3-4 seconds based on animation duration)
    // Then navigate to dashboard
    const timer = setTimeout(() => {
      setAnimationComplete(true)
      navigate('/dashboard')
    }, 4000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source 
          src="https://res.cloudinary.com/dvybb2xnc/video/upload/v1768288063/WhatsApp_Video_2026-01-13_at_10.06.57_AM_bxql5y.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      
      {/* Welcome Animation */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        <Lottie 
          animationData={welcomeAnimation}
          loop={false}
          style={{ width: 400, height: 400 }}
        />
        {!animationComplete && (
          <p className="text-white text-xl font-semibold mt-4 animate-pulse">
            Welcome to Victorious
          </p>
        )}
      </div>
    </div>
  )
}

export default WelcomePage
