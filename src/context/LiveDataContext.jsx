import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { mockHorses } from '../data/mockData'

const LiveDataContext = createContext()

export const useLiveData = () => {
  const context = useContext(LiveDataContext)
  if (!context) {
    throw new Error('useLiveData must be used within LiveDataProvider')
  }
  return context
}

// Get speed and HR ranges based on status
const getStatusRanges = (status) => {
  switch (status) {
    case 'active':
      return {
        speedMin: 8,
        speedMax: 13,
        hrMin: 45,
        hrMax: 55,
        hasSpeed: true
      }
    case 'resting':
      return {
        speedMin: null,
        speedMax: null,
        hrMin: 30,
        hrMax: 43,
        hasSpeed: false
      }
    case 'training':
      return {
        speedMin: 20,
        speedMax: 25,
        hrMin: 60,
        hrMax: 95,
        hasSpeed: true
      }
    case 'racing':
      return {
        speedMin: 25,
        speedMax: 32,
        hrMin: 95,
        hrMax: 120,
        hasSpeed: true
      }
    case 'No connection':
      return {
        speedMin: null,
        speedMax: null,
        hrMin: null,
        hrMax: null,
        hasSpeed: false
      }
    default:
      return {
        speedMin: 8,
        speedMax: 13,
        hrMin: 45,
        hrMax: 55,
        hasSpeed: true
      }
  }
}

// Speed change pattern: 3, 2, 1, then repeat
const getSpeedChange = (cycleIndex) => {
  const pattern = [3, 2, 1]
  return pattern[cycleIndex % pattern.length]
}

export const LiveDataProvider = ({ children }) => {
  // Initialize horses with proper data based on status
  const [horsesData, setHorsesData] = useState(() => {
    return mockHorses.map(horse => {
    const ranges = getStatusRanges(horse.status)
    
    if (!ranges.hasSpeed) {
      return {
        ...horse,
        currentHr: ranges.hrMin !== null 
          ? ranges.hrMin + Math.floor(Math.random() * (ranges.hrMax - ranges.hrMin + 1))
          : null,
        speed: null
      }
    } else {
      // Initialize with speed within range and calculate HR
      const initialSpeed = ranges.speedMin + Math.random() * (ranges.speedMax - ranges.speedMin)
      return {
        ...horse,
        speed: initialSpeed,
        currentHr: ranges.hrMin + Math.floor(Math.random() * (ranges.hrMax - ranges.hrMin + 1))
      }
    }
    })
  })
  
  const speedCycleRef = useRef({ index: 0, isIncreasing: true })

  useEffect(() => {
    const interval = setInterval(() => {
      setHorsesData(prevHorses => {
        return prevHorses.map(horse => {
          const ranges = getStatusRanges(horse.status)
          
          if (horse.status === 'No connection') {
            // No connection: no speed, no HR
            return {
              ...horse,
              currentHr: null,
              speed: null
            }
          } else if (!ranges.hasSpeed) {
            // Resting: HR between 30-43, no speed
            return {
              ...horse,
              currentHr: ranges.hrMin + Math.floor(Math.random() * (ranges.hrMax - ranges.hrMin + 1)),
              speed: null
            }
          } else {
            // Active/Training/Racing: Update speed with cycling pattern (3, 2, 1) within status range
            const speedChange = getSpeedChange(speedCycleRef.current.index)
            const change = speedCycleRef.current.isIncreasing ? speedChange : -speedChange
            
            let newSpeed = (horse.speed || ranges.speedMin) + change
            
            // Keep speed within status-specific bounds
            if (newSpeed < ranges.speedMin) {
              newSpeed = ranges.speedMin
              speedCycleRef.current.isIncreasing = true
            } else if (newSpeed > ranges.speedMax) {
              newSpeed = ranges.speedMax
              speedCycleRef.current.isIncreasing = false
            }
            
            // Calculate HR within status-specific range
            const newHR = ranges.hrMin + Math.floor(Math.random() * (ranges.hrMax - ranges.hrMin + 1))
            
            return {
              ...horse,
              speed: newSpeed,
              currentHr: newHR
            }
          }
        })
      })
      
      // Update cycle index and direction (3, 2, 1 pattern)
      speedCycleRef.current.index = (speedCycleRef.current.index + 1) % 3
      if (speedCycleRef.current.index === 0) {
        speedCycleRef.current.isIncreasing = !speedCycleRef.current.isIncreasing
      }
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <LiveDataContext.Provider value={{ horsesData }}>
      {children}
    </LiveDataContext.Provider>
  )
}
