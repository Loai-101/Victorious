import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { mockHorses, mockRiders, mockTrainers } from '../data/mockData'

const TrainingSchedule = () => {
  const { t } = useTranslation()
  const { user } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [activities, setActivities] = useState({})
  const [selectedActivityType, setSelectedActivityType] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showActivityDetail, setShowActivityDetail] = useState(false)
  const [groupedActivities, setGroupedActivities] = useState(null)
  const [showGroupedModal, setShowGroupedModal] = useState(false)
  const [selectedHorseActivity, setSelectedHorseActivity] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    trainer: '',
    horse: '',
    activityType: '',
    country: ''
  })

  // Horse Training Activity Types
  const trainingTypes = [
    { id: 'long_canter', name: 'Long Canter / Endurance Ride', color: 'green' },
    { id: 'trot_conditioning', name: 'Trot Conditioning', color: 'blue' },
    { id: 'water_training', name: 'Water Training / Hydro Therapy', color: 'cyan' },
    { id: 'multi_phase', name: 'Multi-Phase Training', color: 'red' },
    { id: 'alternative', name: 'Alternative Conditioning', color: 'orange' },
    { id: 'rest_day', name: 'Rest Day', color: 'grey' },
    { id: 'hill_training', name: 'Hill Training', color: 'brown' },
    { id: 'strength_core', name: 'Strength & Core Training', color: 'purple' },
    { id: 'custom', name: 'Custom Horse Session', color: 'purple' },
    { id: 'soft_ground', name: 'Soft Ground Training', color: 'green' },
    { id: 'straight_line', name: 'Straight Line Conditioning', color: 'blue' },
    { id: 'active_walk', name: 'Active Walk / Cool Down', color: 'green' },
    { id: 'rehab', name: 'Rehab / Vet-Supervised', color: 'red' }
  ]

  const otherTypes = [
    { id: 'race', name: 'Race / Competition', color: 'gold' },
    { id: 'objective', name: 'Training Objective', color: 'blue' },
    { id: 'notes', name: 'Trainer / Vet Notes', color: 'grey' },
    { id: 'metrics', name: 'Horse Metrics', color: 'pink' },
    { id: 'availability', name: 'Horse Availability', color: 'grey' }
  ]

  // Load activities from localStorage
  useEffect(() => {
    const savedActivities = localStorage.getItem('training_activities')
    // Always reinitialize to ensure grouped activities (5-15 horses per activity)
    // Check if data has grouped activities (multiple horses per type)
    let needsReinit = true
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities)
        // Check if any day has multiple different activity types (2+ different types)
        const hasMultipleActivityTypes = Object.values(parsed).some(dayActivities => {
          if (!Array.isArray(dayActivities) || dayActivities.length === 0) return false
          // Group by type and trainingType combination
          const grouped = {}
          dayActivities.forEach(activity => {
            const typeKey = activity.type || 'other'
            const trainingTypeKey = activity.trainingType || 'Training'
            const trainerKey = activity.trainer || 'default'
            const key = `${typeKey}_${trainingTypeKey}_${trainerKey}`
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(activity)
          })
          // Check if there are 2+ different activity types on the same day
          const uniqueTypes = Object.keys(grouped).length
          return uniqueTypes >= 2
        })
        needsReinit = !hasMultipleActivityTypes
      } catch {
        needsReinit = true
      }
    }
    
    if (needsReinit) {
      // Clear old data and reinitialize with grouped activities (5-15 horses)
      localStorage.removeItem('training_activities')
      initializeSampleData()
    } else {
      try {
        const parsed = JSON.parse(savedActivities)
        // Migrate existing data to add missing fields
        const migrated = {}
        Object.keys(parsed).forEach(dateKey => {
          migrated[dateKey] = parsed[dateKey].map(activity => {
            // Calculate default distance if missing
            let defaultDistance = activity.distance || activity.totalDistance
            if (!defaultDistance || defaultDistance === '0' || defaultDistance === 0) {
              if (activity.type === 'long_canter') defaultDistance = '25.0'
              else if (activity.type === 'trot_conditioning') defaultDistance = '8.0'
              else if (activity.type === 'multi_phase') defaultDistance = '15.0'
              else if (activity.type === 'active_walk') defaultDistance = '2.0'
              else if (activity.type === 'hill_training') defaultDistance = '3.0'
              else if (activity.type === 'strength_core') defaultDistance = '0.5'
              else if (activity.type === 'water_training') defaultDistance = '0.0'
              else if (activity.type === 'rest_day') defaultDistance = '2.0'
              else defaultDistance = '5.0'
            }
      
      return {
              ...activity,
              trainer: activity.trainer || mockTrainers[0]?.name || 'Ali Hussein Salman',
              trainingType: activity.trainingType || trainingTypes.find(t => t.id === activity.type)?.name || 'Training',
              intensityLevel: activity.intensityLevel || activity.intensity || 'normal',
              distance: defaultDistance,
              timeBreakdown: activity.timeBreakdown || (activity.duration ? `${activity.duration}` : '15 walk 10 trot 35 canter')
            }
          })
        })
        setActivities(migrated)
        localStorage.setItem('training_activities', JSON.stringify(migrated))
      } catch {
        // If parsing fails, reinitialize
        localStorage.removeItem('training_activities')
        initializeSampleData()
      }
    }
  }, [])

  // Initialize sample training data with horse training activities
  const initializeSampleData = () => {
    const sampleActivities = {}
    
    // Trainer names and their color mappings
    const trainers = [
      { name: 'Ali Hussein Salman', color: 'bg-red-100 border-red-300' },
      { name: 'Mohammed Al-Rashid', color: 'bg-blue-100 border-blue-300' },
      { name: 'Fatima Al-Zahra', color: 'bg-purple-100 border-purple-300' },
      { name: 'Ahmed Bin Khalid', color: 'bg-green-100 border-green-300' },
      { name: 'Sarah Al-Mansoori', color: 'bg-yellow-100 border-yellow-300' }
    ]
    
    const getTrainer = (index) => trainers[index % trainers.length]
    
    // Use horses from different countries - Bahrain (0-119), UAE (120-179), France (180-249)
    const getHorseIndex = (dayIndex, activityIndex, countryOffset = 0) => {
      // Create a unique combination based on day, activity, and country
      // countryOffset: 0 = Bahrain, 120 = UAE, 180 = France
      const baseIndex = (Math.abs(dayIndex) * 7 + activityIndex * 3) % 60
      return countryOffset + baseIndex
    }
    
    // Generate activities for January 2026 to April 2026
    const startDate = new Date(2026, 0, 1) // January 1, 2026
    const endDate = new Date(2026, 3, 30) // April 30, 2026
    
    // Race/Competition dates (one per month)
    const raceDates = [
      new Date(2026, 0, 15), // January 15
      new Date(2026, 1, 20), // February 20
      new Date(2026, 2, 18), // March 18
      new Date(2026, 3, 22)  // April 22
    ]
    
    const isRaceDate = (date) => {
      return raceDates.some(raceDate => 
        raceDate.getFullYear() === date.getFullYear() &&
        raceDate.getMonth() === date.getMonth() &&
        raceDate.getDate() === date.getDate()
      )
    }
    
    // Generate activities for each day
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      const dayActivities = []
      const dayOfWeek = d.getDay()
      const dayOfMonth = d.getDate()
      const month = d.getMonth()
      const dayIndex = Math.floor((d - startDate) / (1000 * 60 * 60 * 24))
      
      // Check if this is a race day
      if (isRaceDate(d)) {
        // Race / Competition - 15-20 horses
        const numHorses = 15 + (dayIndex % 6)
        const trainer = getTrainer(month)
        const sharedDistance = 40.0 + (dayIndex % 20)
        
        dayActivities.push(...Array.from({ length: numHorses }, (_, idx) => {
          const horseIndex = getHorseIndex(dayIndex, 0, (idx % 3) * 120) // Mix of countries
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 140 + (idx * 1.5) + (horseIndex % 15)
          const recoveryTime = 12 + (idx % 5)
          
          return {
            id: `race_${dateKey}_${idx + 1}`,
            type: 'race',
            title: 'Race / Competition',
            eventName: `Endurance Championship ${month + 1}/2026`,
            distance: sharedDistance,
            location: horse.country || 'Bahrain',
            result: ['Completed', 'Top 10', 'Top 5', 'Winner'][idx % 4],
            averageSpeed: 15.0 + (idx * 0.2),
            recoveryTime: recoveryTime,
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: trainer.name,
            trainingType: 'Race / Competition',
            intensityLevel: 'high',
            timeBreakdown: '5 walk 10 trot 85 canter',
            notes: `Competition completed. ${horse.name || 'Horse'} performed ${['excellently', 'well', 'good', 'strong'][idx % 4]}.`
          }
        }))
      } else {
        // Regular training days - 2-3 activity types per day
        const numActivityTypes = 2 + (dayIndex % 2) // 2 or 3 activities
        
        for (let actIdx = 0; actIdx < numActivityTypes; actIdx++) {
          const trainer = getTrainer(dayIndex + actIdx)
          const activityTypes = [
            { type: 'long_canter', name: 'Long Canter / Endurance Ride', timeBreakdown: '15 walk 10 trot 35 canter', distance: 25.5, intensity: 'high' },
            { type: 'trot_conditioning', name: 'Trot Conditioning', timeBreakdown: '10 walk 45 trot 1 canter', distance: 8.0, intensity: 'normal' },
            { type: 'multi_phase', name: 'Multi-Phase Training', timeBreakdown: '5 trot 10 canter', distance: 15.0, intensity: 'high' },
            { type: 'strength_core', name: 'Strength & Core Training', timeBreakdown: '10 walk 40 exercise', distance: 0, intensity: 'high' },
            { type: 'hill_training', name: 'Hill Training', timeBreakdown: '10 walk 35 canter', distance: 3.0, intensity: 'high' },
            { type: 'water_training', name: 'Water Training / Hydro Therapy', timeBreakdown: '30 recovery', distance: 0, intensity: 'low' },
            { type: 'active_walk', name: 'Active Walk / Cool Down', timeBreakdown: '30 walk', distance: 2.0, intensity: 'low' }
          ]
          
          const activityType = activityTypes[(dayIndex * 3 + actIdx) % activityTypes.length]
          const numHorses = 5 + (dayIndex % 11) // 5-15 horses
          const countryOffset = (actIdx % 3) * 120 // Rotate countries
          
          dayActivities.push(...Array.from({ length: numHorses }, (_, idx) => {
            const horseIndex = getHorseIndex(dayIndex, actIdx, countryOffset) + idx
            const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
            const riderIndex = (horseIndex + idx) % mockRiders.length
            const baseHR = activityType.intensity === 'high' ? 130 + (idx * 2) : 105 + (idx * 1.5)
            const recoveryTime = activityType.intensity === 'high' ? 7 + (idx % 3) : 5 + (idx % 2)
            
            const baseActivity = {
              id: `activity_${dateKey}_${actIdx + 1}_${idx + 1}`,
              type: activityType.type,
              title: activityType.name,
              horse: horse.name || `Horse ${idx + 1}`,
              country: horse.country || 'Bahrain',
              rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
              trainer: trainer.name,
              trainingType: activityType.name,
              intensityLevel: activityType.intensity,
              timeBreakdown: activityType.timeBreakdown,
              notes: `${activityType.name} completed. ${horse.name || 'Horse'} performed well.`
            }
            
            // Add type-specific fields
            if (activityType.type === 'long_canter') {
              return {
                ...baseActivity,
                distance: activityType.distance,
                targetPace: 12.0,
                averagePace: 11.8 + (idx * 0.1),
                duration: '2:10:00',
                averageHeartRate: Math.min(180, Math.max(100, baseHR)),
                recoveryTime: recoveryTime,
                terrainType: 'Mixed'
              }
            } else if (activityType.type === 'trot_conditioning') {
              return {
                ...baseActivity,
                distance: activityType.distance,
                trotPace: 8.5 + (idx * 0.05),
                duration: '0:56:00',
                averageHeartRate: Math.min(140, Math.max(95, baseHR)),
                terrain: 'Arena'
              }
            } else if (activityType.type === 'multi_phase') {
              return {
                ...baseActivity,
                phases: [
                  { type: 'Trot', distance: 5, targetPace: 8.0 },
                  { type: 'Canter', distance: 10, targetPace: 15.0 }
                ],
                totalDistance: activityType.distance,
                totalDuration: '1:15:00',
                duration: '1:15:00',
                averageHeartRate: Math.min(165, Math.max(125, baseHR)),
                recoveryTime: recoveryTime
              }
            } else if (activityType.type === 'strength_core') {
              return {
                ...baseActivity,
                exerciseType: 'Collection',
                duration: '0:50:00',
                intensity: 'High',
                focusArea: 'Hindquarters'
              }
            } else if (activityType.type === 'hill_training') {
              return {
                ...baseActivity,
                numberOfHills: 5,
                hillLength: 200,
                gradientLevel: 'Steep',
                distance: activityType.distance,
                duration: '0:45:00',
                averageHeartRate: Math.min(170, Math.max(145, baseHR))
              }
            } else if (activityType.type === 'water_training') {
              return {
                ...baseActivity,
                sessionDuration: '0:30:00',
                duration: '0:30:00',
                waterType: 'Pool',
                intensity: 'Low',
                purpose: 'Recovery'
              }
            } else if (activityType.type === 'active_walk') {
              return {
                ...baseActivity,
                duration: '0:30:00',
                distance: activityType.distance,
                purpose: 'Cool-down'
              }
            }
            
            return baseActivity
          }))
        }
      }
      
      sampleActivities[dateKey] = dayActivities
    }
    
    // Also keep the old logic for backward compatibility (past week and current week)
    const today = new Date()
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      
      // Each day will have 2-3 different activity types with different horses from different countries
      const dayActivities = []
      
      if (i === -7) {
        // Last Sunday - Activity 1: Long Canter (Bahrain horses) - 10 horses
        const numHorses1 = 10
        const sharedTrainer1 = mockTrainers[Math.abs(i) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown1 = '15 walk 10 trot 35 canter'
        const sharedDistance1 = 25.5
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 130 + (idx * 2) + (horseIndex % 10)
          const recoveryTime = 7 + (idx % 3)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Canter Endurance Ride',
            distance: sharedDistance1,
            targetPace: 12.0,
            averagePace: 11.8 + (idx * 0.1),
            duration: '2:10:00',
            averageHeartRate: Math.min(180, Math.max(100, baseHR)),
            recoveryTime: recoveryTime,
    terrainType: 'Mixed',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Excellent pace maintained. ${horse.name || 'Horse'} showed good recovery.`
          }
        }))
        
        // Last Sunday - Activity 2: Trot Conditioning (UAE horses) - 8 horses
        const numHorses2 = 8
        const sharedTrainer2 = mockTrainers[(i + 1) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Trot Conditioning'
        const sharedTimeBreakdown2 = '10 walk 45 trot 1 canter'
        const sharedDistance2 = 8.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 105 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'trot_conditioning',
            title: 'Trot Conditioning Session',
            distance: sharedDistance2,
            trotPace: 8.5 + (idx * 0.05),
            duration: '0:56:00',
            averageHeartRate: Math.min(140, Math.max(95, baseHR)),
            terrain: 'Arena',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Fatima Al-Zahra',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'normal',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Low-impact aerobic conditioning. ${horse.name || 'Horse'} maintained steady pace.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === -6) {
        // Last Monday - Activity 1: Multi-Phase (UAE horses) - 11 horses
        const numHorses1 = 11
        const sharedTrainer1 = mockTrainers[Math.abs(i + 1) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Multi-Phase Training'
        const sharedTimeBreakdown1 = '10 walk 20 trot 40 canter'
        const sharedDistance1 = 18.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 138 + (idx * 1.2) + (horseIndex % 9)
          const recoveryTime = 8 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'multi_phase',
            title: 'Multi-Phase Training',
            totalDistance: sharedDistance1,
            totalDuration: '1:30:00',
            duration: '1:30:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Trot and canter phases completed. ${horse.name || 'Horse'} handled transitions well.`
          }
        }))
        
        // Last Monday - Activity 2: Hill Training (France horses) - 9 horses
        const numHorses2 = 9
        const sharedTrainer2 = mockTrainers[(i + 2) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Hill Training'
        const sharedTimeBreakdown2 = '10 walk 35 canter'
        const sharedDistance2 = 3.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 150 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'hill_training',
            title: 'Hill Training Session',
            numberOfHills: 5,
            hillLength: 200,
            gradientLevel: 'Steep',
            distance: sharedDistance2,
            duration: '0:45:00',
            averageHeartRate: Math.min(170, Math.max(145, baseHR)),
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Strength and power development. ${horse.name || 'Horse'} handled steep gradients well.`
          }
        }))
        
        // Last Monday - Activity 3: Strength & Core (Bahrain horses) - 6 horses
        const numHorses3 = 6
        const sharedTrainer3 = mockTrainers[(i + 3) % mockTrainers.length]?.name || 'Fatima Al-Zahra'
        const sharedTrainingType3 = 'Strength & Core Training'
        const sharedTimeBreakdown3 = '5 walk 35 exercise'
        
        dayActivities.push(...Array.from({ length: numHorses3 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 2, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_3_${idx + 1}`,
            type: 'strength_core',
            title: 'Poles Training',
            exerciseType: 'Poles',
            duration: '0:40:00',
            intensity: 'Medium',
            intensityLevel: 'medium',
            focusArea: 'Balance',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Mohammed bin Rashid',
            trainer: sharedTrainer3,
            trainingType: sharedTrainingType3,
            timeBreakdown: sharedTimeBreakdown3,
            notes: `Pole work for coordination. ${horse.name || 'Horse'} showed good balance.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === -5) {
        // Tuesday - Long Canter / Endurance Ride - 8 horses
        const numHorses = 8
        const sharedTrainer = mockTrainers[i % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown = '15 walk 10 trot 35 canter'
        const sharedDistance = 25.5
        const sharedCountry = 'Bahrain'
        
        sampleActivities[dateKey] = Array.from({ length: numHorses }, (_, idx) => {
          const horseIndex = getHorseIndex(i, idx)
          const horse = mockHorses[horseIndex] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          // Create unique heart rate and recovery time for each horse
          const baseHR = 130 + (idx * 2) + (horseIndex % 10)
          const recoveryTime = 7 + (idx % 3) + (horseIndex % 2)
          
          return {
            id: `activity_${dateKey}_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Canter Endurance Ride',
            distance: sharedDistance,
            targetPace: 12.0,
            averagePace: 11.8 + (idx * 0.1),
            duration: '2:10:00',
            averageHeartRate: Math.min(180, Math.max(100, baseHR)),
            recoveryTime: recoveryTime,
    terrainType: 'Mixed',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || sharedCountry,
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer,
            trainingType: sharedTrainingType,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown,
            notes: `Excellent pace maintained. ${horse.name || 'Horse'} showed good recovery and endurance.`
          }
        })
      } else if (i === -4) {
        // Wednesday - Activity 1: Long Canter (UAE horses) - 9 horses
        const numHorses1 = 9
        const sharedTrainer1 = mockTrainers[Math.abs(i + 3) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType1 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown1 = '15 walk 10 trot 35 canter'
        const sharedDistance1 = 25.5
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 130 + (idx * 2) + (horseIndex % 10)
          const recoveryTime = 7 + (idx % 3)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Canter Endurance Ride',
            distance: sharedDistance1,
            targetPace: 12.0,
            averagePace: 11.8 + (idx * 0.1),
            duration: '2:10:00',
            averageHeartRate: Math.min(180, Math.max(100, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Mixed',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Excellent pace maintained. ${horse.name || 'Horse'} showed good recovery.`
          }
        }))
        
        // Wednesday - Activity 2: Strength & Core (France horses) - 7 horses
        const numHorses2 = 7
        const sharedTrainer2 = mockTrainers[(Math.abs(i) + 5) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Strength & Core Training'
        const sharedTimeBreakdown2 = '10 walk 40 exercise'
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'strength_core',
            title: 'Collection & Poles Training',
            exerciseType: 'Collection',
            duration: '0:50:00',
            intensity: 'High',
            intensityLevel: 'high',
            focusArea: 'Hindquarters',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Fatima Al-Zahra',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Focus on hindquarter strength. ${horse.name || 'Horse'} showed good collection.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === -3) {
        // Thursday - Activity 1: Multi-Phase Training (Bahrain horses) - 11 horses
        const numHorses1 = 11
        const sharedTrainer1 = mockTrainers[Math.abs(i + 2) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Multi-Phase Training'
        const sharedTimeBreakdown1 = '5 trot 10 canter'
        const sharedDistance1 = 15.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 135 + (idx * 1.5) + (horseIndex % 12)
          const recoveryTime = 9 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'multi_phase',
            title: 'Multi-Phase Training',
            phases: [
              { type: 'Trot', distance: 5, targetPace: 8.0 },
              { type: 'Canter', distance: 10, targetPace: 15.0 }
            ],
            totalDistance: sharedDistance1,
            totalDuration: '1:15:00',
            duration: '1:15:00',
            averageHeartRate: Math.min(165, Math.max(125, baseHR)),
            recoveryTime: recoveryTime,
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Race simulation completed. ${horse.name || 'Horse'} handled phases well.`
          }
        }))
        
        // Thursday - Activity 2: Water Training (UAE horses) - 6 horses
        const numHorses2 = 6
        const sharedTrainer2 = mockTrainers[(i + 3) % mockTrainers.length]?.name || 'Fatima Al-Zahra'
        const sharedTrainingType2 = 'Water Training / Hydro Therapy'
        const sharedTimeBreakdown2 = '30 recovery'
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'water_training',
            title: 'Hydro Therapy Session',
            sessionDuration: '0:30:00',
            duration: '0:30:00',
            waterType: 'Pool',
            intensity: 'Low',
            intensityLevel: 'low',
            purpose: 'Recovery',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Post-training recovery session. ${horse.name || 'Horse'} recovered well.`
          }
        }))
        
        // Thursday - Activity 3: Hill Training (France horses) - 8 horses
        const numHorses3 = 8
        const sharedTrainer3 = mockTrainers[(i + 4) % mockTrainers.length]?.name || 'Ahmed Bin Khalid'
        const sharedTrainingType3 = 'Hill Training'
        const sharedTimeBreakdown3 = '10 walk 35 canter'
        const sharedDistance3 = 3.0
        
        dayActivities.push(...Array.from({ length: numHorses3 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 2, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 150 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_3_${idx + 1}`,
            type: 'hill_training',
            title: 'Hill Training Session',
            numberOfHills: 5,
            hillLength: 200,
            gradientLevel: 'Steep',
            distance: sharedDistance3,
            duration: '0:45:00',
            averageHeartRate: Math.min(170, Math.max(145, baseHR)),
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer3,
            trainingType: sharedTrainingType3,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown3,
            notes: `Strength and power development. ${horse.name || 'Horse'} handled steep gradients well.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === -2) {
        // Friday - Activity 1: Strength & Core (Bahrain horses) - 7 horses
        const numHorses1 = 7
        const sharedTrainer1 = mockTrainers[(Math.abs(i) + 5) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType1 = 'Strength & Core Training'
        const sharedTimeBreakdown1 = '10 walk 40 exercise'
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'strength_core',
            title: 'Collection & Poles Training',
            exerciseType: 'Collection',
            duration: '0:50:00',
            intensity: 'High',
            intensityLevel: 'high',
            focusArea: 'Hindquarters',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Fatima Al-Zahra',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Focus on hindquarter strength. ${horse.name || 'Horse'} showed good collection.`
          }
        }))
        
        // Friday - Activity 2: Long Canter (UAE horses) - 13 horses
        const numHorses2 = 13
        const sharedTrainer2 = mockTrainers[(i + 6) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType2 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown2 = '15 walk 10 trot 35 canter'
        const sharedDistance2 = 30.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 135 + (idx * 1) + (horseIndex % 8)
          const recoveryTime = 11 + (idx % 3)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Endurance Ride',
            distance: sharedDistance2,
            targetPace: 12.5,
            averagePace: 12.3 + (idx * 0.05),
            duration: '2:26:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Trail',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Long-distance endurance completed. ${horse.name || 'Horse'} maintained excellent pace.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === -1) {
        // Saturday - Activity 1: Long Canter (France horses) - 12 horses
        const numHorses1 = 12
        const sharedTrainer1 = mockTrainers[Math.abs(i + 15) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown1 = '15 walk 10 trot 35 canter'
        const sharedDistance1 = 30.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 135 + (idx * 1) + (horseIndex % 8)
          const recoveryTime = 11 + (idx % 3)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Endurance Ride',
            distance: sharedDistance1,
            targetPace: 12.5,
            averagePace: 12.3 + (idx * 0.05),
            duration: '2:26:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Trail',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Long-distance endurance completed. ${horse.name || 'Horse'} maintained excellent pace.`
          }
        }))
        
        // Saturday - Activity 2: Trot Conditioning (Bahrain horses) - 9 horses
        const numHorses2 = 9
        const sharedTrainer2 = mockTrainers[(i + 16) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Trot Conditioning'
        const sharedTimeBreakdown2 = '10 walk 45 trot 1 canter'
        const sharedDistance2 = 8.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 105 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'trot_conditioning',
            title: 'Trot Conditioning Session',
            distance: sharedDistance2,
            trotPace: 8.5 + (idx * 0.05),
            duration: '0:56:00',
            averageHeartRate: Math.min(140, Math.max(95, baseHR)),
            terrain: 'Arena',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Fatima Al-Zahra',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'normal',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Low-impact aerobic conditioning. ${horse.name || 'Horse'} maintained steady pace.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 0) {
        // Sunday (Today) - Activity 1: Rest Day (Bahrain horses) - 6 horses
        const numHorses1 = 6
        const sharedTrainer1 = mockTrainers[Math.abs(i + 7) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Rest Day'
        const sharedTimeBreakdown1 = '30 walk'
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'rest_day',
            title: 'Rest Day',
            restType: 'Hand Walk',
            reason: 'Recovery after intensive training week',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'low',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Light hand walk for recovery. ${horse.name || 'Horse'} relaxed well.`
          }
        }))
        
        // Sunday - Activity 2: Active Walk (UAE horses) - 8 horses
        const numHorses2 = 8
        const sharedTrainer2 = mockTrainers[(i + 8) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Active Walk / Cool Down'
        const sharedTimeBreakdown2 = '30 walk'
        const sharedDistance2 = 2.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'active_walk',
            title: 'Cool Down Walk',
            duration: '0:30:00',
            distance: sharedDistance2,
            purpose: 'Cool-down',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'low',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Recovery walk completed. ${horse.name || 'Horse'} recovered well.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 1) {
        // Monday - Activity 1: Long Canter (Bahrain horses) - 9 horses
        const numHorses1 = 9
        const sharedTrainer1 = mockTrainers[Math.abs(i + 8) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown1 = '10 walk 15 trot 35 canter'
        const sharedDistance1 = 20.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 128 + (idx * 1.5) + (horseIndex % 7)
          const recoveryTime = 6 + (idx % 3)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'long_canter',
            title: 'Morning Endurance Ride',
            distance: sharedDistance1,
            targetPace: 12.0,
            averagePace: 11.9 + (idx * 0.08),
            duration: '1:40:00',
            averageHeartRate: Math.min(150, Math.max(120, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Trail',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'normal',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Good morning session. ${horse.name || 'Horse'} performed well.`
          }
        }))
        
        // Monday - Activity 2: Multi-Phase (UAE horses) - 10 horses
        const numHorses2 = 10
        const sharedTrainer2 = mockTrainers[(i + 9) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Multi-Phase Training'
        const sharedTimeBreakdown2 = '10 walk 20 trot 40 canter'
        const sharedDistance2 = 18.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 138 + (idx * 1.2) + (horseIndex % 9)
          const recoveryTime = 8 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'multi_phase',
            title: 'Multi-Phase Training',
            totalDistance: sharedDistance2,
            totalDuration: '1:30:00',
            duration: '1:30:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Trot and canter phases completed. ${horse.name || 'Horse'} handled transitions well.`
          }
        }))
        
        // Monday - Activity 3: Strength & Core (France horses) - 5 horses
        const numHorses3 = 5
        const sharedTrainer3 = mockTrainers[(i + 10) % mockTrainers.length]?.name || 'Fatima Al-Zahra'
        const sharedTrainingType3 = 'Strength & Core Training'
        const sharedTimeBreakdown3 = '5 walk 35 exercise'
        
        dayActivities.push(...Array.from({ length: numHorses3 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 2, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_3_${idx + 1}`,
            type: 'strength_core',
            title: 'Poles Training',
            exerciseType: 'Poles',
            duration: '0:40:00',
            intensity: 'Medium',
            intensityLevel: 'medium',
            focusArea: 'Balance',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Mohammed bin Rashid',
            trainer: sharedTrainer3,
            trainingType: sharedTrainingType3,
            timeBreakdown: sharedTimeBreakdown3,
            notes: `Pole work for coordination. ${horse.name || 'Horse'} showed good balance.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 2) {
        // Tuesday - Activity 1: Trot Conditioning (UAE horses) - 11 horses
        const numHorses1 = 11
        const sharedTrainer1 = mockTrainers[Math.abs(i + 3) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType1 = 'Trot Conditioning'
        const sharedTimeBreakdown1 = '5 walk 40 trot'
        const sharedDistance1 = 6.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 105 + (idx * 1) + (horseIndex % 6)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'trot_conditioning',
            title: 'Trot Session',
            distance: sharedDistance1,
            trotPace: 8.0 + (idx * 0.05),
            duration: '0:45:00',
            averageHeartRate: Math.min(125, Math.max(100, baseHR)),
            terrain: 'Arena',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Fatima Al-Zahra',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'normal',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Steady trot work. ${horse.name || 'Horse'} maintained consistent pace.`
          }
        }))
        
        // Tuesday - Activity 2: Long Canter (France horses) - 14 horses
        const numHorses2 = 14
        const sharedTrainer2 = mockTrainers[(i + 4) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType2 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown2 = '15 walk 10 trot 35 canter'
        const sharedDistance2 = 28.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 136 + (idx * 1.2) + (horseIndex % 10)
          const recoveryTime = 9 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Ride',
            distance: sharedDistance2,
            targetPace: 12.5,
            averagePace: 12.4 + (idx * 0.06),
            duration: '2:15:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Mixed',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Endurance training completed. ${horse.name || 'Horse'} showed strong performance.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 3) {
        // Wednesday - Activity 1: Multi-Phase (Bahrain horses) - 13 horses
        const numHorses1 = 13
        const sharedTrainer1 = mockTrainers[Math.abs(i + 6) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Multi-Phase Training'
        const sharedTimeBreakdown1 = '10 walk 20 trot 40 canter'
        const sharedDistance1 = 18.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 138 + (idx * 1.2) + (horseIndex % 9)
          const recoveryTime = 8 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'multi_phase',
            title: 'Multi-Phase Training',
            totalDistance: sharedDistance1,
            totalDuration: '1:30:00',
            duration: '1:30:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Trot and canter phases completed. ${horse.name || 'Horse'} handled transitions well.`
          }
        }))
        
        // Wednesday - Activity 2: Hill Training (UAE horses) - 8 horses
        const numHorses2 = 8
        const sharedTrainer2 = mockTrainers[(i + 7) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Hill Training'
        const sharedTimeBreakdown2 = '10 walk 35 canter'
        const sharedDistance2 = 3.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 150 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'hill_training',
            title: 'Hill Training Session',
            numberOfHills: 5,
            hillLength: 200,
            gradientLevel: 'Steep',
            distance: sharedDistance2,
            duration: '0:45:00',
            averageHeartRate: Math.min(170, Math.max(145, baseHR)),
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Strength and power development. ${horse.name || 'Horse'} handled steep gradients well.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 4) {
        // Thursday - Activity 1: Strength & Core (France horses) - 5 horses
        const numHorses1 = 5
        const sharedTrainer1 = mockTrainers[Math.abs(i + 11) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Strength & Core Training'
        const sharedTimeBreakdown1 = '5 walk 35 exercise'
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'strength_core',
            title: 'Poles Training',
            exerciseType: 'Poles',
            duration: '0:40:00',
            intensity: 'Medium',
            intensityLevel: 'medium',
            focusArea: 'Balance',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Mohammed bin Rashid',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Pole work for coordination. ${horse.name || 'Horse'} showed good balance.`
          }
        }))
        
        // Thursday - Activity 2: Long Canter (Bahrain horses) - 10 horses
        const numHorses2 = 10
        const sharedTrainer2 = mockTrainers[(i + 12) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown2 = '15 walk 10 trot 35 canter'
        const sharedDistance2 = 25.5
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 130 + (idx * 2) + (horseIndex % 10)
          const recoveryTime = 7 + (idx % 3)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Canter Endurance Ride',
            distance: sharedDistance2,
            targetPace: 12.0,
            averagePace: 11.8 + (idx * 0.1),
            duration: '2:10:00',
            averageHeartRate: Math.min(180, Math.max(100, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Mixed',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Excellent pace maintained. ${horse.name || 'Horse'} showed good recovery and endurance.`
          }
        }))
        
        // Thursday - Activity 3: Trot Conditioning (UAE horses) - 7 horses
        const numHorses3 = 7
        const sharedTrainer3 = mockTrainers[(i + 13) % mockTrainers.length]?.name || 'Fatima Al-Zahra'
        const sharedTrainingType3 = 'Trot Conditioning'
        const sharedTimeBreakdown3 = '10 walk 45 trot 1 canter'
        const sharedDistance3 = 8.0
        
        dayActivities.push(...Array.from({ length: numHorses3 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 2, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 105 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_3_${idx + 1}`,
            type: 'trot_conditioning',
            title: 'Trot Conditioning Session',
            distance: sharedDistance3,
            trotPace: 8.5 + (idx * 0.05),
            duration: '0:56:00',
            averageHeartRate: Math.min(140, Math.max(95, baseHR)),
            terrain: 'Arena',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Fatima Al-Zahra',
            trainer: sharedTrainer3,
            trainingType: sharedTrainingType3,
            intensityLevel: 'normal',
            timeBreakdown: sharedTimeBreakdown3,
            notes: `Low-impact aerobic conditioning. ${horse.name || 'Horse'} maintained steady pace.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 5) {
        // Friday - Activity 1: Long Canter (UAE horses) - 14 horses
        const numHorses1 = 14
        const sharedTrainer1 = mockTrainers[Math.abs(i + 12) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Long Canter / Endurance Ride'
        const sharedTimeBreakdown1 = '15 walk 10 trot 35 canter'
        const sharedDistance1 = 28.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 136 + (idx * 1.2) + (horseIndex % 10)
          const recoveryTime = 9 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'long_canter',
            title: 'Long Ride',
            distance: sharedDistance1,
            targetPace: 12.5,
            averagePace: 12.4 + (idx * 0.06),
            duration: '2:15:00',
            averageHeartRate: Math.min(160, Math.max(130, baseHR)),
            recoveryTime: recoveryTime,
            terrainType: 'Mixed',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Endurance training completed. ${horse.name || 'Horse'} showed strong performance.`
          }
        }))
        
        // Friday - Activity 2: Multi-Phase (France horses) - 11 horses
        const numHorses2 = 11
        const sharedTrainer2 = mockTrainers[(i + 13) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Multi-Phase Training'
        const sharedTimeBreakdown2 = '5 trot 10 canter'
        const sharedDistance2 = 15.0
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 135 + (idx * 1.5) + (horseIndex % 12)
          const recoveryTime = 9 + (idx % 4)
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'multi_phase',
            title: 'Multi-Phase Training',
            phases: [
              { type: 'Trot', distance: 5, targetPace: 8.0 },
              { type: 'Canter', distance: 10, targetPace: 15.0 }
            ],
            totalDistance: sharedDistance2,
            totalDuration: '1:15:00',
            duration: '1:15:00',
            averageHeartRate: Math.min(165, Math.max(125, baseHR)),
            recoveryTime: recoveryTime,
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Race simulation completed. ${horse.name || 'Horse'} handled phases well.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      } else if (i === 6) {
        // Saturday - Activity 1: Active Walk (Bahrain horses) - 10 horses
        const numHorses1 = 10
        const sharedTrainer1 = mockTrainers[Math.abs(i + 13) % mockTrainers.length]?.name || 'Ali Hussein Salman'
        const sharedTrainingType1 = 'Active Walk / Cool Down'
        const sharedTimeBreakdown1 = '30 walk'
        const sharedDistance1 = 2.0
        
        dayActivities.push(...Array.from({ length: numHorses1 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 0, 0) + idx // Bahrain horses
          const horse = mockHorses[horseIndex] || mockHorses[idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_1_${idx + 1}`,
            type: 'active_walk',
            title: 'Cool Down Walk',
            duration: '0:30:00',
            distance: sharedDistance1,
            purpose: 'Cool-down',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'Bahrain',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer1,
            trainingType: sharedTrainingType1,
            intensityLevel: 'low',
            timeBreakdown: sharedTimeBreakdown1,
            notes: `Recovery walk completed. ${horse.name || 'Horse'} recovered well.`
          }
        }))
        
        // Saturday - Activity 2: Water Training (UAE horses) - 6 horses
        const numHorses2 = 6
        const sharedTrainer2 = mockTrainers[(i + 14) % mockTrainers.length]?.name || 'Mohammed Al-Rashid'
        const sharedTrainingType2 = 'Water Training / Hydro Therapy'
        const sharedTimeBreakdown2 = '30 recovery'
        
        dayActivities.push(...Array.from({ length: numHorses2 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 1, 120) + idx // UAE horses
          const horse = mockHorses[horseIndex] || mockHorses[120 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          
          return {
            id: `activity_${dateKey}_2_${idx + 1}`,
            type: 'water_training',
            title: 'Hydro Therapy Session',
            sessionDuration: '0:30:00',
            duration: '0:30:00',
            waterType: 'Pool',
            intensity: 'Low',
            intensityLevel: 'low',
            purpose: 'Recovery',
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'UAE',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer2,
            trainingType: sharedTrainingType2,
            timeBreakdown: sharedTimeBreakdown2,
            notes: `Post-training recovery session. ${horse.name || 'Horse'} recovered well.`
          }
        }))
        
        // Saturday - Activity 3: Hill Training (France horses) - 9 horses
        const numHorses3 = 9
        const sharedTrainer3 = mockTrainers[(i + 15) % mockTrainers.length]?.name || 'Fatima Al-Zahra'
        const sharedTrainingType3 = 'Hill Training'
        const sharedTimeBreakdown3 = '10 walk 35 canter'
        const sharedDistance3 = 3.0
        
        dayActivities.push(...Array.from({ length: numHorses3 }, (_, idx) => {
          const horseIndex = getHorseIndex(i, 2, 180) + idx // France horses
          const horse = mockHorses[horseIndex] || mockHorses[180 + idx] || {}
          const riderIndex = (horseIndex + idx) % mockRiders.length
          const baseHR = 150 + (idx * 1.5) + (horseIndex % 8)
          
          return {
            id: `activity_${dateKey}_3_${idx + 1}`,
            type: 'hill_training',
            title: 'Hill Training Session',
            numberOfHills: 5,
            hillLength: 200,
            gradientLevel: 'Steep',
            distance: sharedDistance3,
            duration: '0:45:00',
            averageHeartRate: Math.min(170, Math.max(145, baseHR)),
            horse: horse.name || `Horse ${idx + 1}`,
            country: horse.country || 'France',
            rider: mockRiders[riderIndex]?.name || 'Ahmed Al-Mansoori',
            trainer: sharedTrainer3,
            trainingType: sharedTrainingType3,
            intensityLevel: 'high',
            timeBreakdown: sharedTimeBreakdown3,
            notes: `Strength and power development. ${horse.name || 'Horse'} handled steep gradients well.`
          }
        }))
        
        sampleActivities[dateKey] = dayActivities
      }
    }
    
    setActivities(sampleActivities)
    localStorage.setItem('training_activities', JSON.stringify(sampleActivities))
  }

  // Get activities for a specific date with filters applied
  const getActivitiesForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0]
    let dayActivities = activities[dateKey] || []
    
    // Apply filters
    if (filters.trainer) {
      dayActivities = dayActivities.filter(activity => activity.trainer === filters.trainer)
    }
    if (filters.horse) {
      dayActivities = dayActivities.filter(activity => activity.horse === filters.horse)
    }
    if (filters.activityType) {
      dayActivities = dayActivities.filter(activity => activity.type === filters.activityType)
    }
    if (filters.country) {
      dayActivities = dayActivities.filter(activity => activity.country === filters.country)
    }
    
    return dayActivities
  }
  
  // Get unique values for filter dropdowns
  const getUniqueTrainers = () => {
    const trainers = new Set()
    Object.values(activities).forEach(dayActivities => {
      dayActivities.forEach(activity => {
        if (activity.trainer) trainers.add(activity.trainer)
      })
    })
    return Array.from(trainers).sort()
  }
  
  const getUniqueHorses = () => {
    const horses = new Set()
    Object.values(activities).forEach(dayActivities => {
      dayActivities.forEach(activity => {
        if (activity.horse) horses.add(activity.horse)
      })
    })
    return Array.from(horses).sort()
  }
  
  const getUniqueCountries = () => {
    const countries = new Set()
    Object.values(activities).forEach(dayActivities => {
      dayActivities.forEach(activity => {
        if (activity.country) countries.add(activity.country)
      })
    })
    return Array.from(countries).sort()
  }
  
  const clearFilters = () => {
    setFilters({
      trainer: '',
      horse: '',
      activityType: '',
      country: ''
    })
  }
  
  const hasActiveFilters = () => {
    return filters.trainer || filters.horse || filters.activityType || filters.country
  }

  // Check if date is today
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Get first day of month
  const getFirstDayOfMonth = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return firstDay.getDay()
  }

  // Get days in month
  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  }

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get month name
  const getMonthName = () => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = []
    const firstDay = getFirstDayOfMonth()
    const daysInMonth = getDaysInMonth()
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  // Calculate summary metrics
  const calculateSummary = () => {
    let totalDuration = 0 // in minutes
    let totalDistance = 0
    let canterDuration = 0 // in minutes
    
    // Calculate from ALL activities (not just current week)
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      
      dayActivities.forEach(activity => {
        // Handle duration field
        let durationMinutes = 0
        if (activity.duration) {
          const timeParts = activity.duration.split(':')
          if (timeParts.length === 3) {
            // Format: H:MM:SS
            durationMinutes = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0) + Math.round(parseInt(timeParts[2] || 0) / 60)
          } else if (timeParts.length === 2) {
            // Format: MM:SS or H:MM
            if (parseInt(timeParts[0] || 0) > 59) {
              // Assume H:MM format
              durationMinutes = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
    } else {
              // Assume MM:SS format
              durationMinutes = parseInt(timeParts[0] || 0) + Math.round(parseInt(timeParts[1] || 0) / 60)
            }
    } else {
            // Single number - assume minutes
            durationMinutes = parseInt(timeParts[0] || 0)
          }
        }
        
        // Handle totalDuration for multi_phase activities
        if (activity.totalDuration) {
          const timeParts = activity.totalDuration.split(':')
          if (timeParts.length === 3) {
            durationMinutes = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0) + Math.round(parseInt(timeParts[2] || 0) / 60)
          } else if (timeParts.length === 2) {
            if (parseInt(timeParts[0] || 0) > 59) {
              durationMinutes = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
            } else {
              durationMinutes = parseInt(timeParts[0] || 0) + Math.round(parseInt(timeParts[1] || 0) / 60)
            }
          }
        }
        
        // Handle sessionDuration for water_training
        if (activity.sessionDuration) {
          const timeParts = activity.sessionDuration.split(':')
          if (timeParts.length === 3) {
            durationMinutes = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0) + Math.round(parseInt(timeParts[2] || 0) / 60)
          } else if (timeParts.length === 2) {
            if (parseInt(timeParts[0] || 0) > 59) {
              durationMinutes = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
            } else {
              durationMinutes = parseInt(timeParts[0] || 0) + Math.round(parseInt(timeParts[1] || 0) / 60)
            }
          }
        }
        
        totalDuration += durationMinutes
        
        // Calculate canter duration from timeBreakdown
        if (activity.timeBreakdown) {
          const breakdown = activity.timeBreakdown.toLowerCase()
          const canterMatch = breakdown.match(/(\d+)\s*canter/)
          if (canterMatch) {
            canterDuration += parseInt(canterMatch[1]) || 0
          }
        }
        
        if (activity.distance) {
          totalDistance += parseFloat(activity.distance) || 0
        }
        if (activity.totalDistance) {
          totalDistance += parseFloat(activity.totalDistance) || 0
        }
      })
    })
    
    // Format duration as H:MM
    const formatDuration = (minutes) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}:${String(mins).padStart(2, '0')}`
    }
    
    // Find horses not training for 2 weeks
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    const allHorseNames = new Set()
    const trainedHorses = new Set()
    
    // Get all unique horse names from activities in the last 2 weeks
    Object.keys(activities).forEach(dateKey => {
      const activityDate = new Date(dateKey)
      if (activityDate >= twoWeeksAgo) {
        const dayActivities = activities[dateKey] || []
        dayActivities.forEach(activity => {
          if (activity.horse) {
            trainedHorses.add(activity.horse)
          }
        })
      }
    })
    
    // Get all horses from mockHorses
    mockHorses.forEach(horse => {
      if (horse.name) {
        allHorseNames.add(horse.name)
      }
    })
    
    // Find horses not trained in last 2 weeks
    const notTrainedHorses = Array.from(allHorseNames).filter(horseName => !trainedHorses.has(horseName))
    
    // Get all unique trainers with their colors
    const trainers = [
      { name: 'Ali Hussein Salman', color: 'bg-red-100 border-red-300 text-red-800' },
      { name: 'Mohammed Al-Rashid', color: 'bg-blue-100 border-blue-300 text-blue-800' },
      { name: 'Fatima Al-Zahra', color: 'bg-purple-100 border-purple-300 text-purple-800' },
      { name: 'Ahmed Bin Khalid', color: 'bg-green-100 border-green-300 text-green-800' },
      { name: 'Sarah Al-Mansoori', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' }
    ]
    
    return {
      totalDuration: formatDuration(totalDuration),
      totalDistance: totalDistance.toFixed(2),
      canterDuration: formatDuration(canterDuration),
      notTrainedHorsesCount: notTrainedHorses.length,
      notTrainedHorses: notTrainedHorses,
      trainers: trainers // Show all trainers
    }
  }

  const summary = calculateSummary()

  // Handle add activity
  const handleAddActivity = (type) => {
    if (!selectedDate) {
      setSelectedDate(new Date())
    }
    setSelectedActivityType(type)
    setShowAddModal(true)
  }

  // Save activity
  const handleSaveActivity = (activityData) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const newActivities = { ...activities }
    if (!newActivities[dateKey]) {
      newActivities[dateKey] = []
    }
    
    // Get horse country if horse is selected
    let country = activityData.country
    if (activityData.horse && !country) {
      const horseData = mockHorses.find(h => h.name === activityData.horse)
      country = horseData?.country || ''
    }
    
    newActivities[dateKey].push({
      id: `activity_${dateKey}_${Date.now()}`,
      ...activityData,
      country: country,
      type: selectedActivityType
    })
    setActivities(newActivities)
    localStorage.setItem('training_activities', JSON.stringify(newActivities))
    setShowAddModal(false)
    setSelectedActivityType(null)
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <div className="flex bg-gray-50">
      {/* Main Calendar Area */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{getMonthName()}</h1>
          <button
              onClick={goToToday}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
              Today
          </button>
            <div className="flex items-center gap-2">
          <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                ←
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                →
          </button>
      </div>
    </div>
        
        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
              hasActiveFilters() 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters() && (
              <span className="bg-white text-red-600 rounded-full px-2 py-0.5 text-xs font-bold">
                {[filters.trainer, filters.horse, filters.activityType, filters.country].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trainer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
            <select
                value={filters.trainer}
                onChange={(e) => setFilters({ ...filters, trainer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="">All Trainers</option>
                {getUniqueTrainers().map(trainer => (
                  <option key={trainer} value={trainer}>{trainer}</option>
              ))}
            </select>
            </div>
            
            {/* Horse Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horse</label>
              <select
                value={filters.horse}
                onChange={(e) => setFilters({ ...filters, horse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="">All Horses</option>
                {getUniqueHorses().slice(0, 50).map(horse => (
                  <option key={horse} value={horse}>{horse}</option>
                ))}
              </select>
            </div>
            
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                value={filters.activityType}
                onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="">All Activities</option>
                {trainingTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
                {otherTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="">All Countries</option>
                {getUniqueCountries().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-visible">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                {day}
      </div>
            ))}
    </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayObj, index) => {
              const dayActivities = getActivitiesForDate(dayObj.date)
              const isCurrentDay = isToday(dayObj.date)

  return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                    !dayObj.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } ${isCurrentDay ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !dayObj.isCurrentMonth ? 'text-gray-400' : isCurrentDay ? 'text-blue-600 font-bold' : 'text-gray-900'
                  }`}>
                    {isCurrentDay ? `Today ${dayObj.date.getDate()}` : dayObj.date.getDate()}
      </div>

                  {/* Activity Cards - Grouped by type and trainingType */}
                  <div className="space-y-1">
                    {(() => {
                      // Group activities by a unique combination to show different activities separately
                      const grouped = {}
                      dayActivities.forEach(activity => {
                        // Create a unique key combining type, trainingType, and trainer to ensure separate tags
                        const typeKey = activity.type || 'other'
                        const trainingTypeKey = activity.trainingType || 'Training'
                        const trainerKey = activity.trainer || 'default'
                        // Use a combination that ensures each activity type shows separately
                        const key = `${typeKey}_${trainingTypeKey}_${trainerKey}`
                        if (!grouped[key]) {
                          grouped[key] = []
                        }
                        grouped[key].push(activity)
                      })
                      
                      return (
                        <>
                          {Object.entries(grouped).slice(0, 3).map(([key, activitiesList]) => {
                            const firstActivity = activitiesList[0]
                            const type = firstActivity.type || 'other'
                        const activityType = trainingTypes.find(t => t.id === firstActivity.type) || 
                                            otherTypes.find(t => t.id === firstActivity.type)
                        
                        // Get trainer-specific color
                        const trainerName = firstActivity.trainer || 'Ali Hussein Salman'
                        let bgColor = 'bg-green-100 border-green-300' // Default
                        let headerGradient = 'from-green-600 to-green-700' // Default gradient
                        let borderColor = 'border-green-300' // Default border
                        
                        if (trainerName === 'Ali Hussein Salman') {
                          bgColor = 'bg-red-100 border-red-300'
                          headerGradient = 'from-red-600 to-red-700'
                          borderColor = 'border-red-300'
                        } else if (trainerName === 'Mohammed Al-Rashid') {
                          bgColor = 'bg-blue-100 border-blue-300'
                          headerGradient = 'from-blue-600 to-blue-700'
                          borderColor = 'border-blue-300'
                        } else if (trainerName === 'Fatima Al-Zahra') {
                          bgColor = 'bg-purple-100 border-purple-300'
                          headerGradient = 'from-purple-600 to-purple-700'
                          borderColor = 'border-purple-300'
                        } else if (trainerName === 'Ahmed Bin Khalid') {
                          bgColor = 'bg-green-100 border-green-300'
                          headerGradient = 'from-green-600 to-green-700'
                          borderColor = 'border-green-300'
                        } else if (trainerName === 'Sarah Al-Mansoori') {
                          bgColor = 'bg-yellow-100 border-yellow-300'
                          headerGradient = 'from-yellow-600 to-yellow-700'
                          borderColor = 'border-yellow-300'
                        } else {
                          // Fallback to activity type color
                          bgColor = firstActivity.type === 'long_canter' ? 'bg-green-100 border-green-300' :
                                    firstActivity.type === 'trot_conditioning' ? 'bg-blue-100 border-blue-300' :
                                    firstActivity.type === 'water_training' ? 'bg-cyan-100 border-cyan-300' :
                                    firstActivity.type === 'multi_phase' ? 'bg-red-100 border-red-300' :
                                    firstActivity.type === 'hill_training' ? 'bg-orange-100 border-orange-300' :
                                    firstActivity.type === 'strength_core' ? 'bg-purple-100 border-purple-300' :
                                    firstActivity.type === 'rest_day' ? 'bg-gray-100 border-gray-300' :
                                    firstActivity.type === 'race' ? 'bg-yellow-100 border-yellow-300' :
                                    'bg-green-100 border-green-300'
                          headerGradient = firstActivity.type === 'long_canter' ? 'from-green-600 to-green-700' :
                                          firstActivity.type === 'trot_conditioning' ? 'from-blue-600 to-blue-700' :
                                          firstActivity.type === 'water_training' ? 'from-cyan-600 to-cyan-700' :
                                          firstActivity.type === 'multi_phase' ? 'from-red-600 to-red-700' :
                                          firstActivity.type === 'hill_training' ? 'from-orange-600 to-orange-700' :
                                          firstActivity.type === 'strength_core' ? 'from-purple-600 to-purple-700' :
                                          firstActivity.type === 'rest_day' ? 'from-gray-600 to-gray-700' :
                                          firstActivity.type === 'race' ? 'from-yellow-600 to-yellow-700' :
                                          'from-green-600 to-green-700'
                          borderColor = firstActivity.type === 'long_canter' ? 'border-green-300' :
                                       firstActivity.type === 'trot_conditioning' ? 'border-blue-300' :
                                       firstActivity.type === 'water_training' ? 'border-cyan-300' :
                                       firstActivity.type === 'multi_phase' ? 'border-red-300' :
                                       firstActivity.type === 'hill_training' ? 'border-orange-300' :
                                       firstActivity.type === 'strength_core' ? 'border-purple-300' :
                                       firstActivity.type === 'rest_day' ? 'border-gray-300' :
                                       firstActivity.type === 'race' ? 'border-yellow-300' :
                                       'border-green-300'
                        }

                        // Get shared data from first activity (same for all in group)
                        const getTimeBreakdown = (activity) => {
                        if (activity.timeBreakdown) return activity.timeBreakdown
                        // Generate sample breakdown based on activity type
                        if (activity.type === 'multi_phase' && activity.phases) {
                          return activity.phases.map(p => `${p.distance || 0} ${p.type.toLowerCase()}`).join(' ')
                        }
                        if (activity.type === 'long_canter') {
                          return `35 canter`
                        }
                        if (activity.type === 'trot_conditioning') {
                          return `45 trot`
                        }
                        if (activity.type === 'active_walk') {
                          return `30 walk`
                        }
                        if (activity.duration) {
                          const timeParts = activity.duration.split(':')
                          let totalMins = 0
                          if (timeParts.length === 3) {
                            totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                          } else if (timeParts.length === 2) {
                            if (parseInt(timeParts[0] || 0) > 59) {
                              totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                            } else {
                              totalMins = parseInt(timeParts[0] || 0)
                            }
                          }
                          // Generate breakdown: walk, trot, canter
                          const walkMins = Math.floor(totalMins * 0.2)
                          const trotMins = Math.floor(totalMins * 0.3)
                          const canterMins = totalMins - walkMins - trotMins
                          return `${walkMins} walk ${trotMins} trot ${canterMins} canter`
                        }
                        return '15 walk 10 trot 35 canter'
                      }

                      // Get intensity level
                      const getIntensity = (activity) => {
                        return activity.intensityLevel || activity.intensity || 'normal'
                      }

                      // Get distance - provide smart defaults
                      const getDistance = (activity) => {
                        if (activity.distance) return activity.distance
                        if (activity.totalDistance) return activity.totalDistance
                        // Generate default based on activity type and duration
                        if (activity.duration) {
                          const timeParts = activity.duration.split(':')
                          let totalMins = 0
                          if (timeParts.length === 3) {
                            totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                          } else if (timeParts.length === 2) {
                            if (parseInt(timeParts[0] || 0) > 59) {
                              totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                            } else {
                              totalMins = parseInt(timeParts[0] || 0)
                            }
                          }
                          // Estimate distance based on activity type
                          if (activity.type === 'long_canter' || activity.type === 'multi_phase') {
                            return (totalMins * 0.2).toFixed(1) // ~12 km/h average
                          } else if (activity.type === 'trot_conditioning') {
                            return (totalMins * 0.13).toFixed(1) // ~8 km/h average
                          } else if (activity.type === 'active_walk') {
                            return (totalMins * 0.067).toFixed(1) // ~4 km/h average
                          } else {
                            return (totalMins * 0.1).toFixed(1) // ~6 km/h average
                          }
                        }
                        // Default based on activity type
                        if (activity.type === 'long_canter') return '25.0'
                        if (activity.type === 'trot_conditioning') return '8.0'
                        if (activity.type === 'multi_phase') return '15.0'
                        if (activity.type === 'active_walk') return '2.0'
                        return '5.0' // Default distance
                      }

                      // Generate unique graph data from activity metrics - different for each activity
                      const generateGraphData = (activity) => {
                        // Create unique seed from multiple activity properties
                        const activityId = activity.id || ''
                        const horseName = activity.horse || ''
                        const trainerName = activity.trainer || ''
                        const seed = (activityId + horseName + trainerName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                        
                        // Use heart rate if available
                        if (activity.averageHeartRate) {
                          const baseHR = activity.averageHeartRate
                          // Create unique variation pattern for each activity
                          const pattern = (seed % 7) // 0-6 pattern variation
                          const variation = ((seed % 20) - 10) * 0.5 // -5 to +5 variation
                          // Generate 7 data points with unique pattern
                          const patterns = [
                            [baseHR - 25, baseHR - 12, baseHR - 6, baseHR, baseHR + 6, baseHR + 12, baseHR + 20],
                            [baseHR - 20, baseHR - 10, baseHR - 5, baseHR, baseHR + 8, baseHR + 15, baseHR + 18],
                            [baseHR - 22, baseHR - 8, baseHR - 4, baseHR, baseHR + 5, baseHR + 10, baseHR + 22],
                            [baseHR - 18, baseHR - 9, baseHR - 3, baseHR, baseHR + 7, baseHR + 14, baseHR + 19],
                            [baseHR - 24, baseHR - 11, baseHR - 7, baseHR, baseHR + 4, baseHR + 11, baseHR + 17],
                            [baseHR - 19, baseHR - 7, baseHR - 2, baseHR, baseHR + 9, baseHR + 16, baseHR + 21],
                            [baseHR - 21, baseHR - 13, baseHR - 5, baseHR, baseHR + 6, baseHR + 13, baseHR + 20]
                          ]
                          return patterns[pattern].map(hr => {
                            const adjusted = hr + variation
                            return Math.max(60, Math.min(180, adjusted))
                          })
                        }
                        // Use pace if available
                        if (activity.averagePace || activity.targetPace) {
                          const pace = activity.averagePace || activity.targetPace
                          const basePace = parseFloat(pace) || 12
                          const pattern = (seed % 5)
                          const variation = ((seed % 12) - 6) * 0.2
                          const patterns = [
                            [basePace - 2.5, basePace - 1.2, basePace - 0.6, basePace, basePace + 0.6, basePace + 1.2, basePace + 2.5],
                            [basePace - 2.0, basePace - 1.0, basePace - 0.5, basePace, basePace + 0.8, basePace + 1.5, basePace + 2.2],
                            [basePace - 2.8, basePace - 1.4, basePace - 0.7, basePace, basePace + 0.5, basePace + 1.1, basePace + 2.0],
                            [basePace - 2.2, basePace - 1.1, basePace - 0.4, basePace, basePace + 0.7, basePace + 1.3, basePace + 2.4],
                            [basePace - 2.6, basePace - 1.3, basePace - 0.8, basePace, basePace + 0.4, basePace + 1.0, basePace + 1.8]
                          ]
                          return patterns[pattern].map(p => {
                            const adjusted = p + variation
                            return Math.max(0, adjusted * 5)
                          })
                        }
                        // Use distance progression with unique variation
                        if (activity.distance || activity.totalDistance) {
                          const totalDist = parseFloat(activity.distance || activity.totalDistance) || 20
                          const pattern = (seed % 4)
                          const variation = (seed % 20) / 15
                          const segmentDist = totalDist / 7
                          const patterns = [
                            [1, 2, 3, 4, 5, 6, 7], // Linear
                            [1, 1.5, 2.5, 4, 5.5, 6.5, 7], // Accelerating
                            [1, 2, 3.5, 4.5, 5.5, 6.5, 7], // Steady then fast
                            [1, 1.8, 2.8, 4, 5.2, 6.2, 7] // Slow start
                          ]
                          return patterns[pattern].map((multiplier, i) => {
                            const dist = segmentDist * multiplier
                            const progress = (dist / totalDist) * 100
                            return progress + (variation * (i % 2 === 0 ? 0.5 : -0.3))
                          })
                        }
                        // Default: show duration progression with unique variation
                        if (activity.duration) {
                          const timeParts = activity.duration.split(':')
                          let totalMins = 0
                          if (timeParts.length === 3) {
                            totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                          } else if (timeParts.length === 2) {
                            if (parseInt(timeParts[0] || 0) > 59) {
                              totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                            } else {
                              totalMins = parseInt(timeParts[0] || 0)
                            }
                          }
                          const pattern = (seed % 6)
                          const variation = (seed % 25) / 2.5
                          const segmentMins = totalMins / 7
                          const patterns = [
                            [1, 2, 3, 4, 5, 6, 7],
                            [1, 1.8, 2.8, 4, 5.2, 6.2, 7],
                            [1, 2.2, 3.5, 4.5, 5.5, 6.5, 7],
                            [1, 1.5, 2.5, 4, 5.5, 6.5, 7],
                            [1, 2, 3.2, 4.2, 5.2, 6.2, 7],
                            [1, 1.7, 2.7, 4, 5.3, 6.3, 7]
                          ]
                          return patterns[pattern].map((multiplier, i) => {
                            const mins = segmentMins * multiplier
                            const progress = (mins / totalMins) * 100
                            return progress + (variation * (i % 3 === 0 ? 0.4 : -0.2))
                          })
                        }
                        // Fallback with unique variation based on multiple factors
                        const baseValues = [60, 70, 75, 80, 85, 90, 95]
                        return baseValues.map((val, i) => {
                          const variation = ((seed + i * 7) % 15) - 7
                          return val + variation
                        })
                      }
                      
                        // Get shared values from first activity
                        const sharedTimeBreakdown = getTimeBreakdown(firstActivity)
                        const sharedDistance = getDistance(firstActivity)
                        const sharedTrainer = firstActivity.trainer || mockTrainers[0]?.name || 'Ali Hussein Salman'
                        const sharedTrainingType = firstActivity.trainingType || 
                                                  trainingTypes.find(t => t.id === firstActivity.type)?.name || 
                                                  otherTypes.find(t => t.id === firstActivity.type)?.name || 
                                                  'Training'
                        const sharedIntensity = getIntensity(firstActivity)
                        const sharedCountry = firstActivity.country || (() => {
                          const horseData = mockHorses.find(h => h.name === firstActivity.horse)
                          return horseData?.country || 'Bahrain'
                        })()

                        return (
                          <div
                            key={type}
                            className={`rounded-lg border-2 ${borderColor} ${bgColor} cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 bg-white overflow-hidden`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDate(dayObj.date)
                              setGroupedActivities(activitiesList)
                              setShowGroupedModal(true)
                            }}
                          >
                            {/* Header with Horse Count */}
                            <div className={`bg-gradient-to-r ${headerGradient} px-3 py-2.5`}>
                              <div className="flex items-center justify-between">
                                <span className="text-white text-xs font-bold">
                                  {activitiesList.length} {activitiesList.length === 1 ? 'Horse' : 'Horses'}
                                </span>
                                <svg className="w-3.5 h-3.5 text-white opacity-95 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
        </div>
      </div>

                            {/* Content */}
                            <div className="px-3 py-2.5 space-y-2">
                              {/* Time Breakdown - Shared */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-shrink-0">Time</span>
                                <span className="text-gray-900 text-xs font-semibold text-right break-words flex-1">{sharedTimeBreakdown}</span>
        </div>

                              {/* Distance - Shared */}
                              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                                <span className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-shrink-0">Distance</span>
                                <span className="text-gray-900 text-xs font-semibold text-right">{parseFloat(sharedDistance).toFixed(1)} KM</span>
                              </div>

                              {/* Trainer - Shared */}
                              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                                <span className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-shrink-0">Trainer</span>
                                <span className="text-gray-900 text-xs font-semibold text-right break-words flex-1 truncate" title={sharedTrainer}>{sharedTrainer}</span>
                              </div>

                              {/* Training Type & Intensity - Shared */}
                              <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-gray-100">
                                <span className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-shrink-0 pt-0.5">Type</span>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end flex-1 min-w-0">
                                  <span className="text-gray-900 text-xs font-semibold break-words truncate" title={sharedTrainingType}>{sharedTrainingType}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                                    sharedIntensity === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                                    sharedIntensity === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                    'bg-green-100 text-green-700 border border-green-200'
                                  }`}>
                                    {sharedIntensity}
                    </span>
        </div>
      </div>

                              {/* Country - Shared */}
                              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                                <span className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-shrink-0">Country</span>
                                <span className="text-gray-900 text-xs font-semibold text-right break-words flex-1">{sharedCountry}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                          {Object.keys(grouped).length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{Object.keys(grouped).length - 2} more types
                            </div>
                          )}
                        </>
                      )
                    })()}
      </div>

                  {/* Add button for empty days */}
                  {dayActivities.length === 0 && dayObj.isCurrentMonth && (
        <button
                      onClick={() => {
                        setSelectedDate(dayObj.date)
                        setShowAddModal(true)
                      }}
                      className="w-full text-xs text-gray-400 hover:text-red-600 py-1"
                    >
                      + Add
        </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Panel - Fixed (No Scroll) */}
      <div className="w-80 bg-white border-l border-gray-200 h-screen flex flex-col sticky top-0 overflow-hidden">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">SUMMARY</h2>
          
          {/* Training Statistics */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Duration</span>
                <span className="font-semibold text-gray-900">{summary.totalDuration}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((parseInt(summary.totalDuration.split(':')[0]) || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Distance</span>
                <span className="font-semibold text-gray-900">{summary.totalDistance} km</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((parseFloat(summary.totalDistance) || 0) * 2, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Canter Duration</span>
                <span className="font-semibold text-gray-900">{summary.canterDuration}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((parseInt(summary.canterDuration.split(':')[0]) || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Horses Not Training for 2 Weeks */}
          <div className="pt-4 border-t border-gray-200 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Horses Not Training</h3>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-orange-700">{summary.notTrainedHorsesCount}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">Horses not trained in last 2 weeks</div>
                </div>
                <div className="text-orange-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* All Trainers */}
          <div className="pt-4 border-t border-gray-200 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Trainers</h3>
            <div className="space-y-1.5">
              {summary.trainers.map((trainer, idx) => (
                <div
                  key={idx}
                  className={`${trainer.color} rounded-lg p-2 border-2 flex items-center justify-between`}
                >
                  <span className="text-xs font-semibold">{trainer.name}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{
                    backgroundColor: trainer.color.includes('red') ? '#ef4444' :
                                    trainer.color.includes('blue') ? '#3b82f6' :
                                    trainer.color.includes('purple') ? '#a855f7' :
                                    trainer.color.includes('green') ? '#22c55e' :
                                    '#eab308'
                  }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Horses Training Chart */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Horses Training</h3>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              {/* Calculate unique horses from all activities */}
              {(() => {
                const uniqueHorses = new Set()
                Object.values(activities).forEach(dayActivities => {
                  dayActivities.forEach(activity => {
                    if (activity.horse) {
                      uniqueHorses.add(activity.horse)
                    }
                  })
                })
                const totalHorses = uniqueHorses.size
                const maxHorses = mockHorses.length
                const percentage = maxHorses > 0 ? (totalHorses / maxHorses) * 100 : 0
                
                // Calculate horses training by day (last 7 days)
                const today = new Date()
                const dailyCounts = []
                for (let i = 6; i >= 0; i--) {
                  const date = new Date(today)
                  date.setDate(today.getDate() - i)
                  const dateKey = date.toISOString().split('T')[0]
                  const dayActivities = activities[dateKey] || []
                  const dayHorses = new Set()
                  dayActivities.forEach(activity => {
                    if (activity.horse) {
                      dayHorses.add(activity.horse)
                    }
                  })
                  dailyCounts.push({
                    date: date,
                    count: dayHorses.size,
                    label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' })
                  })
                }
                
                const maxDailyCount = Math.max(...dailyCounts.map(d => d.count), 1)
                
                return (
                  <div className="space-y-3">
                    {/* Total Count */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">{totalHorses}</div>
                      <div className="text-xs text-gray-600">Total Horses Training</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{totalHorses} of {maxHorses} horses</div>
                    </div>
                    
                    {/* Daily Chart */}
                    <div className="mt-4">
                      <div className="text-[10px] font-semibold text-gray-600 mb-2 text-center">Last 7 Days</div>
                      <div className="flex items-end justify-between gap-0.5 h-24">
                        {dailyCounts.map((day, idx) => {
                          const height = maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className="w-full flex flex-col items-center justify-end" style={{ height: '70px' }}>
                                <div
                                  className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all hover:from-red-600 hover:to-red-500"
                                  style={{ height: `${Math.max(height, 5)}%`, minHeight: day.count > 0 ? '3px' : '0' }}
                                  title={`${day.count} horses on ${day.label}`}
                                ></div>
                              </div>
                              <div className="text-[10px] text-gray-600 mt-1.5 font-medium">{day.count}</div>
                              <div className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight">{day.label}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Add Activity'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Select an activity type to add to your training schedule</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedActivityType(null)
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedActivityType ? (
                <>
                  {/* Add Training Activity */}
                  <div className="mb-8">
                    <h4 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-600">Add Training Activity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {trainingTypes.map(type => (
                  <button
                          key={type.id}
                          onClick={() => handleAddActivity(type.id)}
                          className="group flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                              {type.name}
                            </span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                  </button>
                ))}
              </div>
            </div>

                  {/* Add Other */}
                  <div className="mb-8">
                    <h4 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">Add Other</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {otherTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => handleAddActivity(type.id)}
                          className="group flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left shadow-sm hover:shadow-md relative"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {type.name}
                            </span>
                          </div>
                          {(type.id === 'notes' || type.id === 'availability') && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
            </div>

                  {/* Upload Device Files */}
                  <div className="border-t pt-6">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Upload Device Files</h4>
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors">
                      <button className="w-full flex flex-col items-center justify-center py-4 hover:bg-white rounded-lg transition-colors">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="font-semibold text-gray-700 mb-1">Upload File</span>
                        <span className="text-xs text-gray-500">Click to browse or drag and drop</span>
                      </button>
                      <p className="text-xs text-blue-600 mt-4 text-center hover:underline cursor-pointer">
                        Learn about the many ways to AutoSync your activity data.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <ActivityForm
                  activityType={selectedActivityType}
                  selectedDate={selectedDate}
                  trainingTypes={trainingTypes}
                  otherTypes={otherTypes}
                  onSave={handleSaveActivity}
                  onBack={() => setSelectedActivityType(null)}
                  onCancel={() => {
                    setSelectedActivityType(null)
                    setShowAddModal(false)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grouped Activities Modal - Shows all horses */}
      {showGroupedModal && groupedActivities && groupedActivities.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Training Activity - {groupedActivities.length} {groupedActivities.length === 1 ? 'Horse' : 'Horses'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGroupedModal(false)
                  setGroupedActivities(null)
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Trainer at Top */}
            {groupedActivities[0]?.trainer && (
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {groupedActivities[0].trainer.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Trainer</div>
                    <div className="text-lg font-bold text-gray-900">{groupedActivities[0].trainer}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Shared Activity Info */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Time Breakdown</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {(() => {
                      const first = groupedActivities[0]
                      if (first.timeBreakdown) return first.timeBreakdown
                      if (first.duration) return first.duration
                      return '15 walk 10 trot 35 canter'
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Distance</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {(() => {
                      const first = groupedActivities[0]
                      const dist = first.distance || first.totalDistance || '0'
                      return `${parseFloat(dist).toFixed(1)} KM`
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Training Type</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {groupedActivities[0].trainingType || 'Training'}
                    <span className="ml-2 text-xs px-2 py-0.5 bg-gray-200 rounded">
                      {groupedActivities[0].intensityLevel || 'normal'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Country</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {groupedActivities[0].country || 'Bahrain'}
                  </div>
                </div>
              </div>
            </div>

            {/* Horses List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {groupedActivities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    onClick={() => {
                      setSelectedHorseActivity(activity)
                      setShowGroupedModal(false)
                      setShowActivityDetail(true)
                    }}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {activity.horse?.charAt(0) || 'H'}
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-gray-900 mb-1">{activity.horse || 'Unknown Horse'}</div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Rider:</span> {activity.rider || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.averageHeartRate && (
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">HR:</span> {activity.averageHeartRate} bpm
                          </div>
                        )}
                        {activity.recoveryTime && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Recovery:</span> {activity.recoveryTime} min
                          </div>
                        )}
                      </div>
                      <svg className="w-6 h-6 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal - Individual Horse Details */}
      {showActivityDetail && (selectedActivity || selectedHorseActivity) && (() => {
        const currentActivity = selectedHorseActivity || selectedActivity
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Activity Details - {currentActivity.horse || 'Horse'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowActivityDetail(false)
                  setSelectedActivity(null)
                  setSelectedHorseActivity(null)
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Horse Name - Unique per horse */}
                {currentActivity.horse && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-sm font-medium text-gray-700 mb-1">Horse Name</div>
                    <div className="text-lg font-bold text-red-600">{currentActivity.horse}</div>
                  </div>
                )}

                {/* Time Breakdown - Shared */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Time Breakdown</div>
                  <div className="text-base font-semibold text-gray-900">
                    {(() => {
                      if (currentActivity.timeBreakdown) return currentActivity.timeBreakdown
                      if (currentActivity.type === 'multi_phase' && currentActivity.phases) {
                        return currentActivity.phases.map(p => `${p.distance || 0} ${p.type.toLowerCase()}`).join(' ')
                      }
                      if (currentActivity.duration) {
                        return currentActivity.duration
                      }
                      return '15 walk 10 trot 35 canter'
                    })()}
                  </div>
                </div>

                {/* Distance - Shared */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Distance</div>
                  <div className="text-base font-semibold text-gray-900">
                    {(() => {
                      const dist = currentActivity.distance || currentActivity.totalDistance || '0'
                      return `${parseFloat(dist).toFixed(1)} KM`
                    })()}
                  </div>
                </div>

                {/* Trainer - Shared */}
                {currentActivity.trainer && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Trainer</div>
                    <div className="text-base font-semibold text-gray-900">{currentActivity.trainer}</div>
                  </div>
                )}

                {/* Training Type & Intensity - Shared */}
                {currentActivity.trainingType && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Training Type</div>
                    <div className="text-base font-semibold text-gray-900">
                      {currentActivity.trainingType}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Intensity: <span className="font-semibold">{currentActivity.intensityLevel || currentActivity.intensity || 'normal'}</span>
                    </div>
                  </div>
                )}

                {/* Country - Shared */}
                {(() => {
                  const country = currentActivity.country || (() => {
                    const horseData = mockHorses.find(h => h.name === currentActivity.horse)
                    return horseData?.country || 'Bahrain'
                  })()
                  return country ? (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">Country</div>
                      <div className="text-base font-semibold text-gray-900">{country}</div>
                    </div>
                  ) : null
                })()}

                {/* Heart Rate - Unique per horse */}
                {currentActivity.averageHeartRate && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Heart Rate</div>
                    <div className="text-base font-semibold text-gray-900">{currentActivity.averageHeartRate} bpm</div>
                  </div>
                )}

                {/* Recovery Time - Unique per horse */}
                {currentActivity.recoveryTime && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Recovery Time</div>
                    <div className="text-base font-semibold text-gray-900">{currentActivity.recoveryTime} minutes</div>
                  </div>
                )}

                {/* Notes - Unique per horse */}
                {currentActivity.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Notes</div>
                    <div className="text-sm text-gray-900">{currentActivity.notes}</div>
                  </div>
                )}

                {/* Graph */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Performance Graph
          </div>
                  <div className="h-32 flex items-end gap-2">
                    {(() => {
                      // Generate unique graph data from activity - different for each activity
                      const activityId = currentActivity.id || ''
                      const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                      
                      let graphData = []
                      let graphLabel = 'Performance Metrics'
                      
                      if (currentActivity.averageHeartRate) {
                        const baseHR = currentActivity.averageHeartRate
                        const variation = (seed % 10) - 5 // -5 to +5 variation
                        graphData = [
                          Math.max(60, baseHR - 25 + variation),
                          baseHR - 12 + (variation * 0.5),
                          baseHR - 6 + (variation * 0.3),
                          baseHR + variation,
                          baseHR + 6 - (variation * 0.3),
                          baseHR + 12 - (variation * 0.5),
                          Math.min(180, baseHR + 20 - variation)
                        ]
                        graphLabel = 'Heart Rate (bpm)'
                      } else if (currentActivity.averagePace || currentActivity.targetPace) {
                        const pace = currentActivity.averagePace || currentActivity.targetPace
                        const basePace = parseFloat(pace) || 12
                        const variation = ((seed % 8) - 4) * 0.3
                        graphData = [
                          basePace - 2.5 + variation,
                          basePace - 1.2 + (variation * 0.6),
                          basePace - 0.6 + (variation * 0.4),
                          basePace + variation,
                          basePace + 0.6 - (variation * 0.4),
                          basePace + 1.2 - (variation * 0.6),
                          basePace + 2.5 - variation
                        ].map(p => Math.max(0, p * 5))
                        graphLabel = 'Pace (km/h)'
                      } else if (currentActivity.distance || currentActivity.totalDistance) {
                        const totalDist = parseFloat(currentActivity.distance || currentActivity.totalDistance) || 20
                        const variation = (seed % 15) / 10
                        const segmentDist = totalDist / 7
                        graphData = Array.from({ length: 7 }, (_, i) => {
                          const dist = segmentDist * (i + 1)
                          const progress = (dist / totalDist) * 100
                          return progress + (variation * (i % 3 === 0 ? 1 : -0.5))
                        })
                        graphLabel = 'Distance Progression (%)'
                      } else if (currentActivity.duration) {
                        const timeParts = currentActivity.duration.split(':')
                        let totalMins = 0
                        if (timeParts.length === 3) {
                          totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                        } else if (timeParts.length === 2) {
                          if (parseInt(timeParts[0] || 0) > 59) {
                            totalMins = parseInt(timeParts[0] || 0) * 60 + parseInt(timeParts[1] || 0)
                          } else {
                            totalMins = parseInt(timeParts[0] || 0)
                          }
                        }
                        const variation = (seed % 20) / 2
                        const segmentMins = totalMins / 7
                        graphData = Array.from({ length: 7 }, (_, i) => {
                          const mins = segmentMins * (i + 1)
                          const progress = (mins / totalMins) * 100
                          return progress + (variation * (i % 2 === 0 ? 0.3 : -0.2))
                        })
                        graphLabel = 'Duration Progression (%)'
                      } else {
                        const baseValues = [60, 70, 75, 80, 85, 90, 95]
                        graphData = baseValues.map((val, i) => val + ((seed + i) % 10) - 5)
                        graphLabel = 'Performance Index'
                      }
                      
                      const maxValue = Math.max(...graphData)
                      const minValue = Math.min(...graphData)
                      const range = maxValue - minValue || 1
                      
                      return (
                        <div className="w-full">
                          <div className="h-40 flex items-end gap-2 pb-2">
                            {graphData.map((value, idx) => {
                              const normalizedValue = range > 0 ? ((value - minValue) / range) * 100 : 50
                              // Ensure bars are visible with minimum 20% height
                              const barHeight = Math.max(20, Math.min(100, normalizedValue))
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                                  <div
                                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-md"
                                    style={{ height: `${barHeight}%`, minHeight: '8px' }}
                                    title={currentActivity.averageHeartRate ? `HR: ${Math.round(value)} bpm` : 
                                           (currentActivity.averagePace || currentActivity.targetPace) ? `Pace: ${(value / 5).toFixed(1)} km/h` :
                                           `Value: ${value.toFixed(1)}`}
                                  ></div>
                                  <div className="text-xs text-gray-700 mt-2 font-bold">
                                    {currentActivity.averageHeartRate ? Math.round(value) :
                                     (currentActivity.averagePace || currentActivity.targetPace) ? (value / 5).toFixed(1) :
                                     value.toFixed(0)}
          </div>
                                  <div className="text-xs text-gray-400 mt-0.5">{idx + 1}</div>
          </div>
                              )
                            })}
        </div>
        </div>
                      )
                    })()}
        </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  {currentActivity.averageHeartRate && (
                    <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                      <div className="text-xs font-medium text-gray-700">Heart Rate</div>
                      <div className="text-sm font-semibold text-gray-900">{currentActivity.averageHeartRate} bpm</div>
                    </div>
                  )}
                  {currentActivity.recoveryTime && (
                    <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                      <div className="text-xs font-medium text-gray-700">Recovery Time</div>
                      <div className="text-sm font-semibold text-gray-900">{currentActivity.recoveryTime} min</div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {currentActivity.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Notes</div>
                    <div className="text-sm text-gray-600">{currentActivity.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                onClick={() => {
                  setShowActivityDetail(false)
                  setSelectedActivity(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
                    </button>
                    <button
                onClick={() => {
                  setShowActivityDetail(false)
                  setSelectedActivity(null)
                  setSelectedHorseActivity(null)
                  setSelectedDate(selectedDate)
                  setSelectedActivityType(currentActivity.type)
                  setShowAddModal(true)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Edit
                    </button>
                  </div>
          </div>
        </div>
        )
      })()}
    </div>
  )
}

// Activity Form Component
const ActivityForm = ({ activityType, selectedDate, trainingTypes, otherTypes, onSave, onCancel, onBack }) => {
  const activityTypeName = trainingTypes.find(t => t.id === activityType)?.name || 
                          otherTypes.find(t => t.id === activityType)?.name || 
                          activityType
  
  const isTrainingType = trainingTypes.find(t => t.id === activityType) !== undefined
  // Also show horse fields for Race, Objective, Notes, Metrics, and Availability
  const showHorseFields = isTrainingType || 
                         activityType === 'race' || 
                         activityType === 'objective' || 
                         activityType === 'notes' || 
                         activityType === 'metrics' || 
                         activityType === 'availability'

  const [formData, setFormData] = useState({
    title: activityTypeName,
    horses: [{ horse: '', rider: '', trainer: '' }], // Array of horse/rider/trainer combinations
    trainingType: activityTypeName,
    // Long Canter / Endurance Ride
    distance: '',
    targetPace: '',
    averagePace: '',
    duration: '',
    averageHeartRate: '',
    recoveryTime: '',
    terrainType: '',
    // Trot Conditioning
    trotPace: '',
    terrain: '',
    // Water Training
    sessionDuration: '',
    waterType: '',
    intensity: '',
    purpose: '',
    // Multi-Phase
    phases: [],
    totalDistance: '',
    totalDuration: '',
    // Alternative Conditioning
    trainingTypeAlt: '',
    intensityLevel: '',
    // Rest Day
    restType: '',
    reason: '',
    // Hill Training
    numberOfHills: '',
    hillLength: '',
    gradientLevel: '',
    // Strength & Core
    exerciseType: '',
    focusArea: '',
    // Custom
    description: '',
    // Soft Ground
    groundType: '',
    pace: '',
    // Straight Line
    // Rehab
    rehabType: '',
    supervisedBy: '',
    restrictions: '',
    // Race
    eventName: '',
    location: '',
    result: '',
    averageSpeed: '',
    // Objective
    objectiveType: '',
    targetMetric: '',
    value: '',
    // Notes
    author: '',
    role: '',
    noteType: '',
    // Metrics
    metricType: '',
    unit: '',
    // Availability
    status: '',
    fromDate: '',
    toDate: '',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trainingTypeName = trainingTypes.find(t => t.id === activityType)?.name || 
                            otherTypes.find(t => t.id === activityType)?.name || 
                            activityType
    
    const horsesToSave = formData.horses.filter(h => h.horse)
    
    if (horsesToSave.length === 0) {
      alert('Please select at least one horse.')
      return
    }
    
    // Create multiple activities - one for each horse/rider/trainer combination
    horsesToSave.forEach((horseData, index) => {
      onSave({
        ...formData,
        horse: horseData.horse,
        rider: horseData.rider,
        trainer: horseData.trainer,
        trainingType: trainingTypeName
      })
    })
    
    // Close modal after all activities are saved
    setTimeout(() => {
      if (onCancel) onCancel()
    }, 100)
  }
  
  const addHorseEntry = () => {
    setFormData({
      ...formData,
      horses: [...formData.horses, { horse: '', rider: '', trainer: '' }]
    })
  }
  
  const removeHorseEntry = (index) => {
    if (formData.horses.length > 1) {
      setFormData({
        ...formData,
        horses: formData.horses.filter((_, i) => i !== index)
      })
    }
  }
  
  const updateHorseField = (index, field, value) => {
    const updatedHorses = [...formData.horses]
    updatedHorses[index] = { ...updatedHorses[index], [field]: value }
    setFormData({ ...formData, horses: updatedHorses })
  }

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  
  const handleSendToRider = () => {
    // Check if at least one horse and rider are selected
    const hasRiderData = formData.horses.some(h => h.horse && h.rider)
    
    if (!hasRiderData) {
      alert('Please select at least one Horse and Rider to send training information.')
      return
    }
    
    // Collect all riders that need to be notified
    const ridersToNotify = formData.horses
      .filter(h => h.horse && h.rider)
      .map(h => ({
        rider: h.rider,
        horse: h.horse,
        trainer: h.trainer || 'Not specified'
      }))
    
    // Create training information message
    const trainingInfo = {
      activityType: activityTypeName,
      date: selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '',
      details: {
        distance: formData.distance || formData.totalDistance || 'N/A',
        duration: formData.duration || formData.totalDuration || 'N/A',
        terrain: formData.terrainType || formData.terrain || 'N/A',
        notes: formData.notes || ''
      },
      horses: ridersToNotify
    }
    
    // Simulate sending to rider (in real app, this would be an API call)
    console.log('Sending training information to riders:', trainingInfo)
    
    // Show success message
    const riderNames = [...new Set(ridersToNotify.map(r => r.rider))].join(', ')
    alert(`Training information sent successfully to:\n${riderNames}\n\nActivity: ${activityTypeName}\nDate: ${trainingInfo.date}`)
  }

  const renderFields = () => {
    switch (activityType) {
      case 'long_canter':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km) *</label>
              <input type="number" step="0.1" required value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Pace (km/h)</label>
                <input type="number" step="0.1" value={formData.targetPace} onChange={(e) => updateField('targetPace', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Pace (km/h)</label>
                <input type="number" step="0.1" value={formData.averagePace} onChange={(e) => updateField('averagePace', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="2:00:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Heart Rate (bpm)</label>
                <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Time (min)</label>
                <input type="number" value={formData.recoveryTime} onChange={(e) => updateField('recoveryTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terrain Type</label>
              <select value={formData.terrainType} onChange={(e) => updateField('terrainType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Flat">Flat</option>
                <option value="Hills">Hills</option>
                <option value="Mixed">Mixed</option>
                <option value="Trail">Trail</option>
                <option value="Arena">Arena</option>
              </select>
            </div>
          </>
        )

      case 'trot_conditioning':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trot Pace (km/h)</label>
              <input type="number" step="0.1" value={formData.trotPace} onChange={(e) => updateField('trotPace', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average Heart Rate (bpm)</label>
              <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terrain</label>
              <select value={formData.terrain} onChange={(e) => updateField('terrain', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Arena">Arena</option>
                <option value="Trail">Trail</option>
                <option value="Track">Track</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </>
        )

      case 'water_training':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Duration</label>
              <input type="text" placeholder="0:30:00" value={formData.sessionDuration} onChange={(e) => updateField('sessionDuration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Water Type</label>
              <select value={formData.waterType} onChange={(e) => updateField('waterType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Sea">Sea</option>
                <option value="Pool">Pool</option>
                <option value="Treadmill">Treadmill</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
                <select value={formData.intensity} onChange={(e) => updateField('intensity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select value={formData.purpose} onChange={(e) => updateField('purpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select</option>
                  <option value="Recovery">Recovery</option>
                  <option value="Strength">Strength</option>
                  <option value="Rehab">Rehab</option>
                </select>
              </div>
            </div>
          </>
        )

      case 'multi_phase':
        return (
          <>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Distance (km)</label>
              <input type="number" step="0.1" value={formData.totalDistance} onChange={(e) => updateField('totalDistance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration</label>
              <input type="text" placeholder="1:30:00" value={formData.totalDuration} onChange={(e) => updateField('totalDuration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
            <div className="grid grid-cols-2 gap-4">
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Heart Rate (bpm)</label>
                <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Time (min)</label>
                <input type="number" value={formData.recoveryTime} onChange={(e) => updateField('recoveryTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase Details (e.g., "Trot 5km @ 8km/h, Canter 10km @ 15km/h")</label>
              <textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Describe phases..." />
            </div>
          </>
        )

      case 'alternative':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
              <select value={formData.trainingTypeAlt} onChange={(e) => updateField('trainingTypeAlt', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Sand">Sand</option>
                <option value="Trail">Trail</option>
                <option value="Mixed Terrain">Mixed Terrain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensity Level</label>
              <select value={formData.intensityLevel} onChange={(e) => updateField('intensityLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average Heart Rate (bpm)</label>
              <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'rest_day':
        return (
          <>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rest Type</label>
              <select value={formData.restType} onChange={(e) => updateField('restType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Full Rest">Full Rest</option>
                <option value="Hand Walk">Hand Walk</option>
              </select>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input type="text" value={formData.reason} onChange={(e) => updateField('reason', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          </>
        )

      case 'hill_training':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Hills</label>
                <input type="number" value={formData.numberOfHills} onChange={(e) => updateField('numberOfHills', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hill Length (m)</label>
                <input type="number" value={formData.hillLength} onChange={(e) => updateField('hillLength', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gradient Level</label>
              <select value={formData.gradientLevel} onChange={(e) => updateField('gradientLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="Steep">Steep</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average Heart Rate (bpm)</label>
              <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'strength_core':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</label>
              <select value={formData.exerciseType} onChange={(e) => updateField('exerciseType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Cavaletti">Cavaletti</option>
                <option value="Collection">Collection</option>
                <option value="Poles">Poles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
              <select value={formData.intensityLevel} onChange={(e) => updateField('intensityLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus Area</label>
              <select value={formData.focusArea} onChange={(e) => updateField('focusArea', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Core">Core</option>
                <option value="Hindquarters">Hindquarters</option>
                <option value="Balance">Balance</option>
              </select>
            </div>
          </>
        )

      case 'custom':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km) - Optional</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'soft_ground':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ground Type</label>
              <select value={formData.groundType} onChange={(e) => updateField('groundType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Sand">Sand</option>
                <option value="Grass">Grass</option>
                <option value="Arena">Arena</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pace (km/h)</label>
              <input type="number" step="0.1" value={formData.pace} onChange={(e) => updateField('pace', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average Heart Rate (bpm)</label>
              <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'straight_line':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Pace (km/h)</label>
                <input type="number" step="0.1" value={formData.targetPace} onChange={(e) => updateField('targetPace', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Pace (km/h)</label>
                <input type="number" step="0.1" value={formData.averagePace} onChange={(e) => updateField('averagePace', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:45:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
              <input type="number" value={formData.averageHeartRate} onChange={(e) => updateField('averageHeartRate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'active_walk':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:30:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <select value={formData.purpose} onChange={(e) => updateField('purpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Warm-up">Warm-up</option>
                <option value="Cool-down">Cool-down</option>
                <option value="Recovery">Recovery</option>
              </select>
            </div>
          </>
        )

      case 'rehab':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rehab Type</label>
              <input type="text" value={formData.rehabType} onChange={(e) => updateField('rehabType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervised By</label>
              <select value={formData.supervisedBy} onChange={(e) => updateField('supervisedBy', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Vet">Vet</option>
                <option value="Physio">Physio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" placeholder="0:30:00" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensity Level</label>
              <select value={formData.intensityLevel} onChange={(e) => updateField('intensityLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restrictions</label>
              <textarea value={formData.restrictions} onChange={(e) => updateField('restrictions', e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'race':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
              <input type="text" required value={formData.eventName} onChange={(e) => updateField('eventName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" value={formData.distance} onChange={(e) => updateField('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => updateField('location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
              <input type="text" value={formData.result} onChange={(e) => updateField('result', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g., 1st Place, Completed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Speed (km/h)</label>
                <input type="number" step="0.1" value={formData.averageSpeed} onChange={(e) => updateField('averageSpeed', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Time (min)</label>
                <input type="number" value={formData.recoveryTime} onChange={(e) => updateField('recoveryTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
          </>
        )

      case 'objective':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objective Type</label>
              <select value={formData.objectiveType} onChange={(e) => updateField('objectiveType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Speed">Speed</option>
                <option value="Recovery">Recovery</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Metric</label>
              <input type="text" value={formData.targetMetric} onChange={(e) => updateField('targetMetric', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g., Average Speed, Heart Rate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="text" value={formData.value} onChange={(e) => updateField('value', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'notes':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" value={formData.author} onChange={(e) => updateField('author', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => updateField('role', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Vet">Vet</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
              <input type="text" value={formData.noteType} onChange={(e) => updateField('noteType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes *</label>
              <textarea required value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'metrics':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric Type</label>
              <select value={formData.metricType} onChange={(e) => updateField('metricType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="HR">HR</option>
                <option value="Speed">Speed</option>
                <option value="Distance">Distance</option>
                <option value="Recovery">Recovery</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input type="text" value={formData.value} onChange={(e) => updateField('value', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input type="text" value={formData.unit} onChange={(e) => updateField('unit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={formData.date || selectedDate?.toISOString().split('T')[0]} onChange={(e) => updateField('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      case 'availability':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                <option value="Available">Available</option>
                <option value="Rest">Rest</option>
                <option value="Injured">Injured</option>
                <option value="Traveling">Traveling</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" value={formData.fromDate || selectedDate?.toISOString().split('T')[0]} onChange={(e) => updateField('fromDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" value={formData.toDate} onChange={(e) => updateField('toDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input type="text" value={formData.reason} onChange={(e) => updateField('reason', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div>
      {/* Back Button */}
                    <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Activity Selection</span>
                    </button>

      {/* Activity Type Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">{activityTypeName}</h3>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below</p>
                  </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
            </div>

      {/* Common fields for ALL training activities and other horse-related activities */}
      {showHorseFields && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
          <h4 className="text-sm font-bold text-blue-900 mb-3">Horse Training Information</h4>
          <div className="space-y-4">
            {formData.horses.map((horseData, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {index > 0 && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Entry {index + 1}</span>
                <button
                      type="button"
                      onClick={() => removeHorseEntry(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                </button>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horse <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isTrainingType || activityType === 'race' || activityType === 'metrics' || activityType === 'availability'}
                      value={horseData.horse}
                      onChange={(e) => updateHorseField(index, 'horse', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      <option value="">Select Horse</option>
                      {mockHorses.slice(0, 20).map(horse => (
                        <option key={horse.id} value={horse.name}>{horse.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rider</label>
                    <select
                      value={horseData.rider}
                      onChange={(e) => updateHorseField(index, 'rider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      <option value="">Select Rider</option>
                      {mockRiders.slice(0, 20).map(rider => (
                        <option key={rider.id} value={rider.name}>{rider.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                    <select
                      value={horseData.trainer}
                      onChange={(e) => updateHorseField(index, 'trainer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      <option value="">Select Trainer</option>
                      {mockTrainers.map(trainer => (
                        <option key={trainer.id} value={trainer.name}>{trainer.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
                <button
              type="button"
              onClick={addHorseEntry}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Horse / Rider / Trainer
                </button>
              </div>
        </div>
      )}

      {/* Activity-specific fields */}
      {renderFields()}

      {/* Notes field for all activities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
            </div>

        <div className="space-y-3 pt-4">
          {/* Send to Rider Button */}
          {showHorseFields && (
            <button
              type="button"
              onClick={handleSendToRider}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Training to Rider
            </button>
          )}
          
          {/* Cancel and Save Buttons */}
              <div className="flex gap-3">
                <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
              Save
                </button>
              </div>
            </div>
      </form>
    </div>
  )
}

export default TrainingSchedule
