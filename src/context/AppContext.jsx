import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockUser } from '../data/mockData'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  // Load user from localStorage on mount, fallback to mockUser
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('victorious_user')
      if (savedUser) {
        return JSON.parse(savedUser)
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e)
    }
    return mockUser
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('victorious_authenticated') === 'true'
  })

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('victorious_user', JSON.stringify(user))
      } catch (e) {
        console.error('Error saving user to localStorage:', e)
      }
    }
  }, [user])

  // Save authentication state to localStorage
  useEffect(() => {
    localStorage.setItem('victorious_authenticated', isAuthenticated.toString())
  }, [isAuthenticated])

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
  }

  const login = () => {
    setIsAuthenticated(true)
    // Ensure user is set if not already
    if (!user) {
      setUser(mockUser)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('victorious_user')
    localStorage.removeItem('victorious_authenticated')
  }

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated,
      updateUser,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  )
}
