import React, { createContext, useContext, useState } from 'react'
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
  const [user, setUser] = useState(mockUser)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Mock auth state

  const updateUser = (userData) => {
    setUser({ ...user, ...userData })
  }

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
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
