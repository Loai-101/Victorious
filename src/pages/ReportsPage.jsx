import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { useLiveData } from '../context/LiveDataContext'
import { mockHorses, mockRiders, mockTrainers } from '../data/mockData'
import { localStorageService } from '../utils/localStorageService'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const ReportsPage = () => {
  const { t } = useTranslation()
  const { user } = useApp()
  const { horsesData: allHorsesData } = useLiveData()
  const [selectedReportType, setSelectedReportType] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedHorses, setSelectedHorses] = useState([])
  const [horseNameInput, setHorseNameInput] = useState('')
  const [selectedTrainers, setSelectedTrainers] = useState([])
  const [selectedRiders, setSelectedRiders] = useState([])
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Report types
  const reportTypes = [
    {
      id: 'horse_performance',
      name: 'Horse Performance Report',
      description: 'Detailed performance metrics for selected horses',
      category: 'Horses'
    },
    {
      id: 'horse_health',
      name: 'Horse Health Report',
      description: 'Health status and medical records',
      category: 'Horses'
    },
    {
      id: 'training_summary',
      name: 'Training Summary Report',
      description: 'Training activities and statistics',
      category: 'Training'
    },
    {
      id: 'training_detailed',
      name: 'Detailed Training Report',
      description: 'Day-by-day training activities',
      category: 'Training'
    },
    {
      id: 'rider_performance',
      name: 'Rider Performance Report',
      description: 'Rider statistics and achievements',
      category: 'Riders'
    },
    {
      id: 'trainer_performance',
      name: 'Trainer Performance Report',
      description: 'Trainer statistics and horse assignments',
      category: 'Trainers'
    },
    {
      id: 'heart_rate_analysis',
      name: 'Heart Rate Analysis Report',
      description: 'Heart rate trends and patterns',
      category: 'Analytics'
    },
    {
      id: 'speed_analysis',
      name: 'Speed Analysis Report',
      description: 'Speed metrics and trends',
      category: 'Analytics'
    },
    {
      id: 'distance_tracking',
      name: 'Distance Tracking Report',
      description: 'Distance covered by horses',
      category: 'Analytics'
    },
    {
      id: 'recovery_analysis',
      name: 'Recovery Analysis Report',
      description: 'Recovery time and patterns',
      category: 'Analytics'
    },
    {
      id: 'battery_status',
      name: 'Battery Status Report',
      description: 'Device battery levels and status',
      category: 'System'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'All-in-one comprehensive report',
      category: 'All'
    },
    {
      id: 'horses_no_training_1week',
      name: 'Horses - No Training (1 Week)',
      description: 'Horses with no training activities in the last week',
      category: 'Horses'
    },
    {
      id: 'horses_no_training_2weeks',
      name: 'Horses - No Training (2 Weeks)',
      description: 'Horses with no training activities in the last 2 weeks',
      category: 'Horses'
    },
    {
      id: 'riders_no_training_1week',
      name: 'Riders - No Training (1 Week)',
      description: 'Riders with no training activities in the last week',
      category: 'Riders'
    },
    {
      id: 'riders_no_training_2weeks',
      name: 'Riders - No Training (2 Weeks)',
      description: 'Riders with no training activities in the last 2 weeks',
      category: 'Riders'
    }
  ]

  // Get activities from localStorage
  const getTrainingActivities = () => {
    const savedActivities = localStorage.getItem('training_activities')
    if (savedActivities) {
      try {
        return JSON.parse(savedActivities)
      } catch (e) {
        return {}
      }
    }
    return {}
  }

  // Initialize medical data for reports if needed
  const initializeMedicalDataForReports = () => {
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData.slice(0, 50) // Initialize for first 50 horses for reports
    
    horses.forEach((horse, index) => {
      // Initialize weight data
      const existingWeights = localStorageService.getWeights(horse.id)
      if (existingWeights.length === 0) {
        const baseWeight = 400 + (index % 20) * 10
        const weights = []
        const numRecords = 5 + (index % 5) // 5-9 records
        
        for (let i = 0; i < numRecords; i++) {
          const daysAgo = (numRecords - i) * 20 + (index * 3)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          
          const weightVariation = (i * 1.5) - (index % 3) * 2
          const weight = baseWeight + weightVariation
          
          weights.push({
            id: `weight_${horse.id}_${i}_${Date.now()}`,
            weightKg: parseFloat(weight.toFixed(1)),
            dateTime: date.toISOString().slice(0, 16),
            method: ['Scale', 'Manual'][index % 2],
            recordedBy: ['Doctor', 'Staff', 'Veterinarian'][i % 3],
            notes: 'Regular monitoring',
            createdAt: date.toISOString()
          })
        }
        
        const key = `horse_medical_${horse.id}_weights`
        localStorage.setItem(key, JSON.stringify(weights))
      }
      
      // Initialize physical exam data
      const existingVisits = localStorageService.getVisits(horse.id)
      if (existingVisits.length === 0) {
        const visits = []
        const numVisits = 3 + (index % 4) // 3-6 visits
        const veterinarians = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis']
        const conditions = ['Excellent', 'Good', 'Fair', 'Normal', 'Healthy']
        
        for (let i = 0; i < numVisits; i++) {
          const daysAgo = (numVisits - i) * 30 + (index * 5)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          
          visits.push({
            id: `visit_${horse.id}_${i}_${Date.now()}`,
            visitDate: date.toISOString().slice(0, 16),
            veterinarian: veterinarians[index % veterinarians.length],
            doctor: veterinarians[index % veterinarians.length], // Support both field names
            location: ['Main Stable', 'Training Facility', 'Vet Clinic'][i % 3],
            reason: 'Routine examination',
            overallCondition: conditions[index % conditions.length],
            temperature: (37.5 + (index % 5) * 0.1).toFixed(1),
            pulse: (38 + (index % 10)).toString(),
            respiration: '12-16/min',
            findings: 'No abnormalities detected',
            createdAt: date.toISOString()
          })
        }
        
        const key = `horse_medical_${horse.id}_visits`
        localStorage.setItem(key, JSON.stringify(visits))
      }
      
      // Initialize blood test data
      const existingTests = localStorageService.getBloodTests(horse.id)
      if (existingTests.length === 0) {
        const tests = []
        const numTests = 2 + (index % 3) // 2-4 tests
        const veterinarians = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown']
        
        for (let i = 0; i < numTests; i++) {
          const daysAgo = (numTests - i) * 45 + (index * 10)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          
          const baseWBC = 7.5 + (index % 3) * 0.5
          const baseRBC = 8.5 + (index % 4) * 0.3
          const baseHGB = 14.5 + (index % 3) * 0.5
          
          tests.push({
            id: `test_${horse.id}_${i}_${Date.now()}`,
            testDate: date.toISOString().slice(0, 16),
            doctor: veterinarians[index % veterinarians.length],
            device: 'VetScan HM5',
            wbc: parseFloat(baseWBC.toFixed(1)),
            WBC: parseFloat(baseWBC.toFixed(1)), // Support both lowercase and uppercase
            rbc: parseFloat(baseRBC.toFixed(1)),
            RBC: parseFloat(baseRBC.toFixed(1)),
            hgb: parseFloat(baseHGB.toFixed(1)),
            HGB: parseFloat(baseHGB.toFixed(1)),
            hct: parseFloat(((baseHGB / 3) * 10).toFixed(0)),
            HCT: parseFloat(((baseHGB / 3) * 10).toFixed(0)),
            plt: (200 + (index % 50)).toString(),
            PLT: (200 + (index % 50)).toString(),
            notes: 'Routine blood work',
            createdAt: date.toISOString()
          })
        }
        
        const key = `horse_medical_${horse.id}_bloodtests`
        localStorage.setItem(key, JSON.stringify(tests))
      }
      
      // Initialize medical care data
      const existingCare = localStorageService.getMedicalCare(horse.id)
      const hasCareData = Object.values(existingCare).some(category => Array.isArray(category) && category.length > 0)
      
      if (!hasCareData) {
        const care = {
          vaccinations: [],
          deworming: [],
          medications: [],
          allergies: [],
          injuries: [],
          surgeries: [],
          dental: [],
          farrier: [],
          imaging: []
        }
        
        // Add some vaccinations
        for (let i = 0; i < 2; i++) {
          const daysAgo = (2 - i) * 180 + (index * 30)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          const nextDue = new Date(date)
          nextDue.setFullYear(nextDue.getFullYear() + 1)
          
          care.vaccinations.push({
            id: `vacc_${horse.id}_${i}_${Date.now()}`,
            date: date.toISOString().split('T')[0],
            name: ['Tetanus', 'Influenza', 'West Nile'][i % 3],
            type: ['Tetanus', 'Influenza', 'West Nile'][i % 3],
            brand: 'Zoetis',
            administeredBy: 'Dr. Smith',
            nextDueDate: nextDue.toISOString().split('T')[0],
            notes: 'Routine vaccination',
            createdAt: date.toISOString()
          })
        }
        
        // Add some deworming
        for (let i = 0; i < 3; i++) {
          const daysAgo = (3 - i) * 90 + (index * 15)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          
          care.deworming.push({
            id: `deworm_${horse.id}_${i}_${Date.now()}`,
            date: date.toISOString().split('T')[0],
            product: 'Ivermectin',
            dosage: 'Standard',
            administeredBy: 'Staff',
            notes: 'Routine deworming',
            createdAt: date.toISOString()
          })
        }
        
        const key = `horse_medical_${horse.id}_care`
        localStorage.setItem(key, JSON.stringify(care))
      }
    })
  }

  // Generate report based on type
  const generateReport = async () => {
    if (!selectedReportType) {
      alert('Please select a report type')
      return
    }

    setLoading(true)
    try {
      let data = {}

      switch (selectedReportType) {
        case 'horse_performance':
          data = generateHorsePerformanceReport()
          break
        case 'horse_health':
          data = generateHorseHealthReport()
          break
        case 'training_summary':
          data = generateTrainingSummaryReport()
          break
        case 'training_detailed':
          data = generateDetailedTrainingReport()
          break
        case 'rider_performance':
          data = generateRiderPerformanceReport()
          break
        case 'trainer_performance':
          data = generateTrainerPerformanceReport()
          break
        case 'heart_rate_analysis':
          data = generateHeartRateAnalysisReport()
          break
        case 'speed_analysis':
          data = generateSpeedAnalysisReport()
          break
        case 'distance_tracking':
          data = generateDistanceTrackingReport()
          break
        case 'recovery_analysis':
          data = generateRecoveryAnalysisReport()
          break
        case 'battery_status':
          data = generateBatteryStatusReport()
          break
        case 'comprehensive':
          data = generateComprehensiveReport()
          break
        case 'horses_no_training_1week':
          data = generateHorsesNoTrainingReport(7)
          break
        case 'horses_no_training_2weeks':
          data = generateHorsesNoTrainingReport(14)
          break
        case 'riders_no_training_1week':
          data = generateRidersNoTrainingReport(7)
          break
        case 'riders_no_training_2weeks':
          data = generateRidersNoTrainingReport(14)
          break
        default:
          data = { error: 'Unknown report type' }
      }

      // Ensure report data is always set
      if (data) {
        setReportData(data)
      } else {
        console.error('Report generation returned no data')
        alert('Error generating report. Please try again.')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Horse Performance Report
  const generateHorsePerformanceReport = () => {
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData

    // Calculate chart data
    const horsesWithHR = horses.filter(h => h.currentHr)
    const horsesWithSpeed = horses.filter(h => h.speed)
    
    // Heart Rate Distribution
    const hrDistribution = [
      { range: '30-50', count: horsesWithHR.filter(h => h.currentHr >= 30 && h.currentHr <= 50).length },
      { range: '51-70', count: horsesWithHR.filter(h => h.currentHr >= 51 && h.currentHr <= 70).length },
      { range: '71-90', count: horsesWithHR.filter(h => h.currentHr >= 71 && h.currentHr <= 90).length },
      { range: '91+', count: horsesWithHR.filter(h => h.currentHr >= 91).length }
    ]

    // Speed Distribution
    const speedDistribution = [
      { range: '0-10', count: horsesWithSpeed.filter(h => h.speed >= 0 && h.speed <= 10).length },
      { range: '11-20', count: horsesWithSpeed.filter(h => h.speed >= 11 && h.speed <= 20).length },
      { range: '21-30', count: horsesWithSpeed.filter(h => h.speed >= 21 && h.speed <= 30).length },
      { range: '31+', count: horsesWithSpeed.filter(h => h.speed >= 31).length }
    ]

    // Status Distribution
    const statusCounts = {}
    horses.forEach(horse => {
      const status = horse.status || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

    // Age vs Performance
    const ageGroups = {}
    horses.forEach(horse => {
      const ageGroup = horse.age < 5 ? '0-4' : horse.age < 10 ? '5-9' : horse.age < 15 ? '10-14' : '15+'
      if (!ageGroups[ageGroup]) {
        ageGroups[ageGroup] = { totalHR: 0, totalSpeed: 0, count: 0 }
      }
      if (horse.currentHr) {
        ageGroups[ageGroup].totalHR += horse.currentHr
        ageGroups[ageGroup].count++
      }
      if (horse.speed) {
        ageGroups[ageGroup].totalSpeed += horse.speed
      }
    })
    const ageVsPerformance = Object.entries(ageGroups).map(([age, data]) => ({
      age,
      avgHR: data.count > 0 ? Math.round(data.totalHR / data.count) : 0,
      avgSpeed: data.count > 0 ? Number((data.totalSpeed / data.count).toFixed(1)) : 0
    }))

    // Top Performers
    const topHorsesByHR = [...horsesWithHR]
      .sort((a, b) => (b.currentHr || 0) - (a.currentHr || 0))
      .slice(0, 10)
      .map(horse => ({ name: horse.name, hr: horse.currentHr }))

    const topHorsesBySpeed = [...horsesWithSpeed]
      .sort((a, b) => (b.speed || 0) - (a.speed || 0))
      .slice(0, 10)
      .map(horse => ({ name: horse.name, speed: Number(horse.speed.toFixed(1)) }))

    const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

    return {
      title: 'Horse Performance Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        averageAge: Math.round(horses.reduce((sum, h) => sum + h.age, 0) / horses.length),
        averageHeartRate: horsesWithHR.length > 0 ? Math.round(horsesWithHR.reduce((sum, h) => sum + h.currentHr, 0) / horsesWithHR.length) : 0,
        averageSpeed: horsesWithSpeed.length > 0 ? Number((horsesWithSpeed.reduce((sum, h) => sum + h.speed, 0) / horsesWithSpeed.length).toFixed(2)) : 0
      },
      horses: horses.map(horse => ({
        id: horse.id,
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        currentHr: horse.currentHr,
        speed: horse.speed,
        status: horse.status,
        battery: horse.battery,
        country: horse.country
      })),
      charts: {
        hrDistribution,
        speedDistribution,
        statusDistribution,
        ageVsPerformance,
        topHorsesByHR,
        topHorsesBySpeed
      },
      colors: COLORS
    }
  }

  // Horse Health Report
  const generateHorseHealthReport = () => {
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData

    return {
      title: 'Horse Health Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        healthy: horses.filter(h => h.status === 'resting' || h.status === 'active').length,
        training: horses.filter(h => h.status === 'training').length,
        noConnection: horses.filter(h => h.status === 'No connection').length
      },
      horses: horses.map(horse => ({
        id: horse.id,
        name: horse.name,
        status: horse.status,
        currentHr: horse.currentHr,
        battery: horse.battery,
        healthStatus: horse.status === 'No connection' || horse.battery < 20 ? 'Critical' : 
                     horse.status === 'resting' || horse.status === 'active' ? 'Healthy' : 'Monitoring'
      }))
    }
  }

  // Training Summary Report
  const generateTrainingSummaryReport = () => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    const filteredActivities = activitiesList.filter(activity => {
      if (!activity || !activity.date) return false
      try {
        const activityDate = new Date(activity.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate >= startDate && activityDate <= endDate
      } catch (e) {
        return false
      }
    })

    const byType = {}
    filteredActivities.forEach(activity => {
      const type = activity.type || 'other'
      if (!byType[type]) {
        byType[type] = { count: 0, horses: new Set(), trainers: new Set() }
      }
      byType[type].count++
      if (activity.horse) byType[type].horses.add(activity.horse)
      if (activity.trainer) byType[type].trainers.add(activity.trainer)
    })

    return {
      title: 'Training Summary Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalActivities: filteredActivities.length,
        uniqueHorses: new Set(filteredActivities.map(a => a.horse)).size,
        uniqueTrainers: new Set(filteredActivities.map(a => a.trainer)).size,
        activityTypes: Object.keys(byType).length
      },
      byType: Object.entries(byType).map(([type, data]) => ({
        type,
        count: data.count,
        uniqueHorses: data.horses.size,
        uniqueTrainers: data.trainers.size
      }))
    }
  }

  // Detailed Training Report
  const generateDetailedTrainingReport = () => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    const filteredActivities = activitiesList.filter(activity => {
      if (!activity || !activity.date) return false
      try {
        const activityDate = new Date(activity.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate >= startDate && activityDate <= endDate
      } catch (e) {
        return false
      }
    }).sort((a, b) => new Date(a.date) - new Date(b.date))

    return {
      title: 'Detailed Training Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalActivities: filteredActivities.length,
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`
      },
      activities: filteredActivities.map(activity => ({
        date: activity.date,
        horse: activity.horse,
        trainer: activity.trainer,
        type: activity.type,
        trainingType: activity.trainingType,
        duration: activity.duration,
        distance: activity.distance,
        intensity: activity.intensity || activity.intensityLevel
      }))
    }
  }

  // Rider Performance Report
  const generateRiderPerformanceReport = () => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    // Filter activities by date range
    const filteredActivities = activitiesList.filter(activity => {
      if (!activity || !activity.date) return false
      try {
        const activityDate = new Date(activity.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate >= startDate && activityDate <= endDate
      } catch (e) {
        return false
      }
    })
    
    let riders = selectedRiders.length > 0
      ? mockRiders.filter(r => selectedRiders.includes(r.id))
      : mockRiders

    // Calculate performance metrics for each rider
    const ridersWithPerformance = riders.map(rider => {
      const riderActivities = filteredActivities.filter(a => a.rider === rider.name)
      const totalActivities = riderActivities.length
      const totalDistance = riderActivities.reduce((sum, a) => {
        const dist = parseFloat(a.distance || a.totalDistance || 0)
        return sum + (isNaN(dist) ? 0 : dist)
      }, 0)
      const avgSpeed = riderActivities.length > 0 
        ? riderActivities.reduce((sum, a) => {
            const speed = parseFloat(a.averageSpeed || a.averagePace || 0)
            return sum + (isNaN(speed) ? 0 : speed)
          }, 0) / riderActivities.length
        : 0
      const avgHR = riderActivities.length > 0
        ? riderActivities.reduce((sum, a) => {
            const hr = parseFloat(a.averageHeartRate || 0)
            return sum + (isNaN(hr) ? 0 : hr)
          }, 0) / riderActivities.length
        : 0
      const avgRecovery = riderActivities.length > 0
        ? riderActivities.reduce((sum, a) => {
            const rec = parseFloat(a.recoveryTime || 0)
            return sum + (isNaN(rec) ? 0 : rec)
          }, 0) / riderActivities.length
        : 0
      
      // Calculate performance score (weighted combination)
      const performanceScore = (totalActivities * 0.3) + 
                              (totalDistance * 0.4) + 
                              (avgSpeed * 0.2) + 
                              ((100 - avgRecovery) * 0.1)
      
      // Get country from horses if not directly on rider
      let riderCountry = rider.country
      if (!riderCountry && rider.horses && rider.horses.length > 0) {
        const firstHorse = allHorsesData.find(h => rider.horses.includes(h.id))
        riderCountry = firstHorse?.country || 'Unknown'
      }
      if (!riderCountry) {
        // Assign countries based on index for variety
        const countries = ['Bahrain', 'UAE', 'France', 'Saudi Arabia', 'Qatar']
        riderCountry = countries[rider.id % countries.length]
      }
      
      return {
        id: rider.id,
        name: rider.name,
        country: riderCountry,
        feiLevel: rider.feiLevel || (rider.star_level ? `CEI${rider.star_level}*` : '-'),
        weightKg: rider.weightKg || rider.weight || 0,
        strengths: rider.strengths,
        horsesCount: rider.horses?.length || 0,
        recentPerformances: rider.recentPerformances,
        qualificationStatus: rider.qualificationStatus || rider.qualification_status || 'Unknown',
        teamName: rider.teamName || rider.teamName,
        // Performance metrics
        totalActivities: totalActivities,
        totalDistance: Number(totalDistance.toFixed(2)),
        avgSpeed: Number(avgSpeed.toFixed(2)),
        avgHR: Number(avgHR.toFixed(1)),
        avgRecovery: Number(avgRecovery.toFixed(1)),
        performanceScore: Number(performanceScore.toFixed(2))
      }
    })
    
    // Sort by performance score and limit to 22 for table
    const sortedRiders = [...ridersWithPerformance].sort((a, b) => b.performanceScore - a.performanceScore)
    const displayRiders = sortedRiders.slice(0, 22)
    
    // Top 10 riders for charts
    const top10Riders = sortedRiders.slice(0, 10)
    
    // Charts data
    const top10ByPerformance = top10Riders.map(r => ({
      name: r.name,
      score: r.performanceScore
    }))
    
    const top10ByDistance = [...sortedRiders]
      .sort((a, b) => b.totalDistance - a.totalDistance)
      .slice(0, 10)
      .map(r => ({
        name: r.name,
        distance: r.totalDistance
      }))
    
    const top10ByActivities = [...sortedRiders]
      .sort((a, b) => b.totalActivities - a.totalActivities)
      .slice(0, 10)
      .map(r => ({
        name: r.name,
        activities: r.totalActivities
      }))
    
    // Performance by country
    const performanceByCountry = {}
    ridersWithPerformance.forEach(rider => {
      const country = rider.country || 'Unknown'
      if (!performanceByCountry[country]) {
        performanceByCountry[country] = {
          country: country,
          totalRiders: 0,
          totalDistance: 0,
          totalActivities: 0,
          avgScore: 0
        }
      }
      const countryData = performanceByCountry[country]
      countryData.totalRiders++
      countryData.totalDistance += rider.totalDistance
      countryData.totalActivities += rider.totalActivities
    })
    
    Object.keys(performanceByCountry).forEach(country => {
      const data = performanceByCountry[country]
      data.avgScore = (data.totalDistance + data.totalActivities * 10) / data.totalRiders
    })
    
    const countryPerformance = Object.values(performanceByCountry)
      .sort((a, b) => b.avgScore - a.avgScore)
      .map(item => ({
        country: item.country,
        score: Number(item.avgScore.toFixed(2)),
        riders: item.totalRiders
      }))

    return {
      title: 'Rider Performance Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalRiders: riders.length,
        averageFEILevel: riders.reduce((sum, r) => {
          const level = parseInt(r.feiLevel || r.star_level || 0)
          return sum + level
        }, 0) / riders.length,
        totalActivities: filteredActivities.length,
        totalDistance: Number(filteredActivities.reduce((sum, a) => {
          const dist = parseFloat(a.distance || a.totalDistance || 0)
          return sum + (isNaN(dist) ? 0 : dist)
        }, 0)).toFixed(2),
        note: 'Showing top 22 riders by performance'
      },
      riders: displayRiders,
      charts: {
        top10ByPerformance: top10ByPerformance,
        top10ByDistance: top10ByDistance,
        top10ByActivities: top10ByActivities,
        countryPerformance: countryPerformance
      }
    }
  }

  // Trainer Performance Report
  const generateTrainerPerformanceReport = () => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    // Filter activities by date range
    const filteredActivities = activitiesList.filter(activity => {
      if (!activity || !activity.date) return false
      try {
        const activityDate = new Date(activity.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate >= startDate && activityDate <= endDate
      } catch (e) {
        return false
      }
    })
    
    const trainers = selectedTrainers.length > 0
      ? mockTrainers.filter(t => selectedTrainers.includes(t.id))
      : mockTrainers

    // Calculate performance metrics for each trainer
    const trainersWithPerformance = trainers.map(trainer => {
      const trainerActivities = filteredActivities.filter(a => a.trainer === trainer.name)
      const totalActivities = trainerActivities.length
      const totalDistance = trainerActivities.reduce((sum, a) => {
        const dist = parseFloat(a.distance || a.totalDistance || 0)
        return sum + (isNaN(dist) ? 0 : dist)
      }, 0)
      const avgSpeed = trainerActivities.length > 0 
        ? trainerActivities.reduce((sum, a) => {
            const speed = parseFloat(a.averageSpeed || a.averagePace || 0)
            return sum + (isNaN(speed) ? 0 : speed)
          }, 0) / trainerActivities.length
        : 0
      const avgHR = trainerActivities.length > 0
        ? trainerActivities.reduce((sum, a) => {
            const hr = parseFloat(a.averageHeartRate || 0)
            return sum + (isNaN(hr) ? 0 : hr)
          }, 0) / trainerActivities.length
        : 0
      const avgRecovery = trainerActivities.length > 0
        ? trainerActivities.reduce((sum, a) => {
            const rec = parseFloat(a.recoveryTime || 0)
            return sum + (isNaN(rec) ? 0 : rec)
          }, 0) / trainerActivities.length
        : 0
      
      // Calculate performance score (weighted combination)
      const performanceScore = (totalActivities * 0.3) + 
                              (totalDistance * 0.4) + 
                              (avgSpeed * 0.2) + 
                              ((100 - avgRecovery) * 0.1)
      
      return {
        id: trainer.id,
        name: trainer.name,
        specialization: trainer.specialization,
        experience: trainer.experience,
        horsesCount: allHorsesData.filter(h => h.trainer === trainer.name).length,
        // Performance metrics
        totalActivities: totalActivities,
        totalDistance: Number(totalDistance.toFixed(2)),
        avgSpeed: Number(avgSpeed.toFixed(2)),
        avgHR: Number(avgHR.toFixed(1)),
        avgRecovery: Number(avgRecovery.toFixed(1)),
        performanceScore: Number(performanceScore.toFixed(2))
      }
    })
    
    // Sort by performance score
    const sortedTrainers = [...trainersWithPerformance].sort((a, b) => b.performanceScore - a.performanceScore)

    return {
      title: 'Trainer Performance Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalTrainers: trainers.length,
        totalActivities: filteredActivities.length,
        totalDistance: Number(filteredActivities.reduce((sum, a) => {
          const dist = parseFloat(a.distance || a.totalDistance || 0)
          return sum + (isNaN(dist) ? 0 : dist)
        }, 0)).toFixed(2)
      },
      trainers: sortedTrainers
    }
  }

  // Heart Rate Analysis Report
  const generateHeartRateAnalysisReport = () => {
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData

    const horsesWithHR = horses.filter(h => h.currentHr)
    const avgHR = horsesWithHR.length > 0 ? horsesWithHR.reduce((sum, h) => sum + h.currentHr, 0) / horsesWithHR.length : 0
    const maxHR = horsesWithHR.length > 0 ? Math.max(...horsesWithHR.map(h => h.currentHr)) : 0
    const minHR = horsesWithHR.length > 0 ? Math.min(...horsesWithHR.map(h => h.currentHr)) : 0

    // Calculate HR distribution
    const hrDistribution = [
      { range: '30-50', count: horsesWithHR.filter(h => h.currentHr >= 30 && h.currentHr <= 50).length, label: 'Resting (30-50 bpm)' },
      { range: '51-70', count: horsesWithHR.filter(h => h.currentHr >= 51 && h.currentHr <= 70).length, label: 'Active (51-70 bpm)' },
      { range: '71-90', count: horsesWithHR.filter(h => h.currentHr >= 71 && h.currentHr <= 90).length, label: 'Training (71-90 bpm)' },
      { range: '91+', count: horsesWithHR.filter(h => h.currentHr >= 91).length, label: 'Intense (91+ bpm)' }
    ]

    // HR by Status
    const hrByStatus = {}
    horsesWithHR.forEach(horse => {
      const status = horse.status || 'Unknown'
      if (!hrByStatus[status]) {
        hrByStatus[status] = { total: 0, count: 0, avg: 0 }
      }
      hrByStatus[status].total += horse.currentHr
      hrByStatus[status].count++
    })
    const hrByStatusData = Object.entries(hrByStatus).map(([status, data]) => ({
      status,
      avgHR: Math.round(data.total / data.count),
      count: data.count
    }))

    // HR Trend (simulated over time - using current HR as data points)
    const hrTrend = horsesWithHR
      .sort((a, b) => (b.currentHr || 0) - (a.currentHr || 0))
      .slice(0, 20)
      .map((horse, idx) => ({
        index: idx + 1,
        name: horse.name,
        hr: horse.currentHr
      }))

    // Top and Bottom HR Horses
    const topHRHorses = [...horsesWithHR]
      .sort((a, b) => (b.currentHr || 0) - (a.currentHr || 0))
      .slice(0, 10)
      .map(horse => ({ name: horse.name, hr: horse.currentHr, status: horse.status }))

    const bottomHRHorses = [...horsesWithHR]
      .sort((a, b) => (a.currentHr || 0) - (b.currentHr || 0))
      .slice(0, 10)
      .map(horse => ({ name: horse.name, hr: horse.currentHr, status: horse.status }))

    // HR Statistics by Range
    const hrStats = {
      resting: horsesWithHR.filter(h => h.currentHr >= 30 && h.currentHr <= 50).length,
      active: horsesWithHR.filter(h => h.currentHr >= 51 && h.currentHr <= 70).length,
      training: horsesWithHR.filter(h => h.currentHr >= 71 && h.currentHr <= 90).length,
      intense: horsesWithHR.filter(h => h.currentHr >= 91).length
    }

    const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#dc2626']

    return {
      title: 'Heart Rate Analysis Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        horsesWithHR: horsesWithHR.length,
        averageHR: Math.round(avgHR),
        maxHR,
        minHR,
        medianHR: horsesWithHR.length > 0 ? Math.round([...horsesWithHR.map(h => h.currentHr)].sort((a, b) => a - b)[Math.floor(horsesWithHR.length / 2)]) : 0
      },
      horses: horsesWithHR.map(horse => ({
        id: horse.id,
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        currentHr: horse.currentHr,
        speed: horse.speed,
        status: horse.status,
        country: horse.country
      })),
      charts: {
        hrDistribution,
        hrByStatusData,
        hrTrend,
        topHRHorses,
        bottomHRHorses,
        hrStats
      },
      colors: COLORS
    }
  }

  // Speed Analysis Report
  const generateSpeedAnalysisReport = () => {
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData

    const horsesWithSpeed = horses.filter(h => h.speed && h.speed > 0)
    const avgSpeed = horsesWithSpeed.length > 0 ? horsesWithSpeed.reduce((sum, h) => sum + h.speed, 0) / horsesWithSpeed.length : 0
    const maxSpeed = horsesWithSpeed.length > 0 ? Math.max(...horsesWithSpeed.map(h => h.speed)) : 0
    const minSpeed = horsesWithSpeed.length > 0 ? Math.min(...horsesWithSpeed.map(h => h.speed)) : 0

    // Calculate speed distribution
    const speedDistribution = [
      { range: '0-10', count: horsesWithSpeed.filter(h => h.speed >= 0 && h.speed <= 10).length, label: 'Walk (0-10 km/h)' },
      { range: '11-20', count: horsesWithSpeed.filter(h => h.speed >= 11 && h.speed <= 20).length, label: 'Trot (11-20 km/h)' },
      { range: '21-30', count: horsesWithSpeed.filter(h => h.speed >= 21 && h.speed <= 30).length, label: 'Canter (21-30 km/h)' },
      { range: '31+', count: horsesWithSpeed.filter(h => h.speed >= 31).length, label: 'Gallop (31+ km/h)' }
    ]

    // Speed by Status
    const speedByStatus = {}
    horsesWithSpeed.forEach(horse => {
      const status = horse.status || 'Unknown'
      if (!speedByStatus[status]) {
        speedByStatus[status] = { total: 0, count: 0, avg: 0 }
      }
      speedByStatus[status].total += horse.speed
      speedByStatus[status].count++
    })
    const speedByStatusData = Object.entries(speedByStatus).map(([status, data]) => ({
      status,
      avgSpeed: Number((data.total / data.count).toFixed(1)),
      count: data.count
    }))

    // Speed Trend
    const speedTrend = horsesWithSpeed
      .sort((a, b) => (b.speed || 0) - (a.speed || 0))
      .slice(0, 20)
      .map((horse, idx) => ({
        index: idx + 1,
        name: horse.name,
        speed: Number(horse.speed.toFixed(1))
      }))

    // Top and Bottom Speed Horses
    const topSpeedHorses = [...horsesWithSpeed]
      .sort((a, b) => (b.speed || 0) - (a.speed || 0))
      .slice(0, 10)
      .map(horse => ({ name: horse.name, speed: Number(horse.speed.toFixed(1)), status: horse.status }))

    const bottomSpeedHorses = [...horsesWithSpeed]
      .sort((a, b) => (a.speed || 0) - (b.speed || 0))
      .slice(0, 10)
      .map(horse => ({ name: horse.name, speed: Number(horse.speed.toFixed(1)), status: horse.status }))

    // Speed Statistics by Range
    const speedStats = {
      walk: horsesWithSpeed.filter(h => h.speed >= 0 && h.speed <= 10).length,
      trot: horsesWithSpeed.filter(h => h.speed >= 11 && h.speed <= 20).length,
      canter: horsesWithSpeed.filter(h => h.speed >= 21 && h.speed <= 30).length,
      gallop: horsesWithSpeed.filter(h => h.speed >= 31).length
    }

    // Speed vs Heart Rate correlation
    const speedHRCorrelation = horsesWithSpeed
      .filter(h => h.currentHr && h.speed)
      .slice(0, 30)
      .map(horse => ({
        name: horse.name,
        speed: Number(horse.speed.toFixed(1)),
        hr: horse.currentHr
      }))

    const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#dc2626', '#8b5cf6']

    return {
      title: 'Speed Analysis Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        horsesWithSpeed: horsesWithSpeed.length,
        averageSpeed: Number(avgSpeed.toFixed(2)),
        maxSpeed: Number(maxSpeed.toFixed(2)),
        minSpeed: Number(minSpeed.toFixed(2)),
        medianSpeed: horsesWithSpeed.length > 0 ? Number([...horsesWithSpeed.map(h => h.speed)].sort((a, b) => a - b)[Math.floor(horsesWithSpeed.length / 2)].toFixed(2)) : 0
      },
      horses: horsesWithSpeed.map(horse => ({
        id: horse.id,
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        speed: Number(horse.speed.toFixed(1)),
        currentHr: horse.currentHr,
        status: horse.status,
        country: horse.country
      })),
      charts: {
        speedDistribution,
        speedByStatusData,
        speedTrend,
        topSpeedHorses,
        bottomSpeedHorses,
        speedStats,
        speedHRCorrelation
      },
      colors: COLORS
    }
  }

  // Distance Tracking Report
  const generateDistanceTrackingReport = () => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    const filteredActivities = activitiesList.filter(activity => {
      if (!activity || !activity.date) return false
      try {
        const activityDate = new Date(activity.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        // Set time to start/end of day for proper comparison
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate >= startDate && activityDate <= endDate
      } catch (e) {
        return false
      }
    })

    const totalDistance = filteredActivities.reduce((sum, activity) => {
      const distance = parseFloat(activity.distance || activity.totalDistance || 0)
      return sum + (isNaN(distance) ? 0 : distance)
    }, 0)

    // Distance by Date
    const distanceByDate = {}
    filteredActivities.forEach(activity => {
      const date = activity.date
      if (date) {
        const distance = parseFloat(activity.distance || activity.totalDistance || 0)
        if (!distanceByDate[date]) {
          distanceByDate[date] = 0
        }
        distanceByDate[date] += (isNaN(distance) ? 0 : distance)
      }
    })
    const distanceByDateData = Object.entries(distanceByDate)
      .map(([date, distance]) => ({ date, distance: Number(distance.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 30) // Last 30 days

    // Distance by Horse
    const distanceByHorse = {}
    filteredActivities.forEach(activity => {
      const horse = activity.horse || 'Unknown'
      const distance = parseFloat(activity.distance || activity.totalDistance || 0)
      if (!distanceByHorse[horse]) {
        distanceByHorse[horse] = 0
      }
      distanceByHorse[horse] += (isNaN(distance) ? 0 : distance)
    })
    const distanceByHorseData = Object.entries(distanceByHorse)
      .map(([horse, distance]) => ({ horse, distance: Number(distance.toFixed(2)) }))
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 15) // Top 15 horses

    // Distance by Activity Type
    const distanceByType = {}
    filteredActivities.forEach(activity => {
      const type = activity.type || activity.trainingType || 'Other'
      const distance = parseFloat(activity.distance || activity.totalDistance || 0)
      if (!distanceByType[type]) {
        distanceByType[type] = 0
      }
      distanceByType[type] += (isNaN(distance) ? 0 : distance)
    })
    const distanceByTypeData = Object.entries(distanceByType)
      .map(([type, distance]) => ({ type, distance: Number(distance.toFixed(2)) }))
      .sort((a, b) => b.distance - a.distance)

    // Daily Distance Trend
    const dailyDistance = distanceByDateData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      distance: item.distance
    }))

    const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#dc2626', '#8b5cf6', '#ec4899', '#06b6d4']

    return {
      title: 'Distance Tracking Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalDistance: Number(totalDistance.toFixed(2)),
        totalActivities: filteredActivities.length,
        averageDistancePerActivity: filteredActivities.length > 0 ? Number((totalDistance / filteredActivities.length).toFixed(2)) : 0,
        uniqueHorses: new Set(filteredActivities.map(a => a.horse)).size,
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`
      },
      activities: filteredActivities.map(activity => ({
        date: activity.date,
        horse: activity.horse,
        trainer: activity.trainer,
        type: activity.type || activity.trainingType,
        distance: Number((parseFloat(activity.distance || activity.totalDistance || 0)).toFixed(2)),
        duration: activity.duration
      })),
      charts: {
        distanceByDateData,
        distanceByHorseData,
        distanceByTypeData,
        dailyDistance
      },
      colors: COLORS
    }
  }

  // Recovery Analysis Report
  const generateRecoveryAnalysisReport = () => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    // Filter activities by date range
    const filteredActivities = activitiesList.filter(activity => {
      if (!activity || !activity.date) return false
      try {
        const activityDate = new Date(activity.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate >= startDate && activityDate <= endDate
      } catch (e) {
        return false
      }
    })
    
    // Filter by selected horses if any
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData
    
    const horseNames = new Set(horses.map(h => h.name))
    const relevantActivities = filteredActivities.filter(a => a.horse && horseNames.has(a.horse))
    
    // Calculate recovery statistics
    const recoveryData = relevantActivities
      .filter(a => a.recoveryTime && !isNaN(parseFloat(a.recoveryTime)))
      .map(a => ({
        ...a,
        recoveryTime: parseFloat(a.recoveryTime)
      }))
    
    // Recovery by horse
    const recoveryByHorse = {}
    recoveryData.forEach(activity => {
      if (!recoveryByHorse[activity.horse]) {
        recoveryByHorse[activity.horse] = {
          name: activity.horse,
          totalActivities: 0,
          totalRecovery: 0,
          avgRecovery: 0,
          minRecovery: Infinity,
          maxRecovery: 0,
          activities: []
        }
      }
      const horseData = recoveryByHorse[activity.horse]
      horseData.totalActivities++
      horseData.totalRecovery += activity.recoveryTime
      horseData.minRecovery = Math.min(horseData.minRecovery, activity.recoveryTime)
      horseData.maxRecovery = Math.max(horseData.maxRecovery, activity.recoveryTime)
      horseData.activities.push(activity)
    })
    
    // Calculate averages
    Object.keys(recoveryByHorse).forEach(horseName => {
      const data = recoveryByHorse[horseName]
      data.avgRecovery = data.totalRecovery / data.totalActivities
      if (data.minRecovery === Infinity) data.minRecovery = 0
    })
    
    // Recovery by activity type
    const recoveryByType = {}
    recoveryData.forEach(activity => {
      const type = activity.type || activity.trainingType || 'other'
      if (!recoveryByType[type]) {
        recoveryByType[type] = {
          type: type,
          totalActivities: 0,
          totalRecovery: 0,
          avgRecovery: 0
        }
      }
      recoveryByType[type].totalActivities++
      recoveryByType[type].totalRecovery += activity.recoveryTime
    })
    
    Object.keys(recoveryByType).forEach(type => {
      const data = recoveryByType[type]
      data.avgRecovery = data.totalRecovery / data.totalActivities
    })
    
    // Recovery trend over time
    const recoveryTrend = {}
    recoveryData.forEach(activity => {
      const date = activity.date
      if (!recoveryTrend[date]) {
        recoveryTrend[date] = {
          date: date,
          totalRecovery: 0,
          count: 0,
          avgRecovery: 0
        }
      }
      recoveryTrend[date].totalRecovery += activity.recoveryTime
      recoveryTrend[date].count++
    })
    
    Object.keys(recoveryTrend).forEach(date => {
      const data = recoveryTrend[date]
      data.avgRecovery = data.totalRecovery / data.count
    })
    
    const recoveryTrendData = Object.values(recoveryTrend)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        index: idx + 1,
        recovery: Number(item.avgRecovery.toFixed(1))
      }))
    
    // Top and bottom recovery horses
    const horsesArray = Object.values(recoveryByHorse)
      .sort((a, b) => b.avgRecovery - a.avgRecovery)
    
    const topRecoveryHorses = horsesArray.slice(0, 10).map(h => ({
      name: h.name,
      recovery: Number(h.avgRecovery.toFixed(1))
    }))
    
    const bottomRecoveryHorses = horsesArray.slice(-10).reverse().map(h => ({
      name: h.name,
      recovery: Number(h.avgRecovery.toFixed(1))
    }))
    
    // Recovery distribution
    const recoveryRanges = {
      '0-5': 0,
      '6-10': 0,
      '11-15': 0,
      '16-20': 0,
      '21+': 0
    }
    
    recoveryData.forEach(activity => {
      const rt = activity.recoveryTime
      if (rt <= 5) recoveryRanges['0-5']++
      else if (rt <= 10) recoveryRanges['6-10']++
      else if (rt <= 15) recoveryRanges['11-15']++
      else if (rt <= 20) recoveryRanges['16-20']++
      else recoveryRanges['21+']++
    })
    
    const recoveryDistribution = Object.keys(recoveryRanges).map(range => ({
      range: range,
      count: recoveryRanges[range]
    }))
    
    // Overall statistics
    const totalRecovery = recoveryData.reduce((sum, a) => sum + a.recoveryTime, 0)
    const avgRecovery = recoveryData.length > 0 ? totalRecovery / recoveryData.length : 0
    const minRecovery = recoveryData.length > 0 ? Math.min(...recoveryData.map(a => a.recoveryTime)) : 0
    const maxRecovery = recoveryData.length > 0 ? Math.max(...recoveryData.map(a => a.recoveryTime)) : 0
    
    // Prepare horses data with recovery info
    const horsesWithRecovery = horses.map(horse => {
      const horseRecovery = recoveryByHorse[horse.name]
      return {
        id: horse.id,
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        status: horse.status,
        currentHr: horse.currentHr,
        avgRecoveryTime: horseRecovery ? Number(horseRecovery.avgRecovery.toFixed(1)) : null,
        totalActivities: horseRecovery ? horseRecovery.totalActivities : 0,
        minRecovery: horseRecovery ? Number(horseRecovery.minRecovery.toFixed(1)) : null,
        maxRecovery: horseRecovery ? Number(horseRecovery.maxRecovery.toFixed(1)) : null
      }
    })
    
    return {
      title: 'Recovery Analysis Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        totalActivities: recoveryData.length,
        avgRecoveryTime: Number(avgRecovery.toFixed(1)),
        minRecoveryTime: Number(minRecovery.toFixed(1)),
        maxRecoveryTime: Number(maxRecovery.toFixed(1)),
        horsesWithRecoveryData: Object.keys(recoveryByHorse).length
      },
      horses: horsesWithRecovery,
      charts: {
        recoveryDistribution: recoveryDistribution,
        recoveryByType: Object.values(recoveryByType).map(item => ({
          type: item.type,
          recovery: Number(item.avgRecovery.toFixed(1))
        })),
        recoveryTrend: recoveryTrendData,
        topRecoveryHorses: topRecoveryHorses,
        bottomRecoveryHorses: bottomRecoveryHorses
      }
    }
  }

  // Battery Status Report
  const generateBatteryStatusReport = () => {
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData

    const batteryGroups = {
      critical: horses.filter(h => h.battery < 20).length,
      low: horses.filter(h => h.battery >= 20 && h.battery < 50).length,
      medium: horses.filter(h => h.battery >= 50 && h.battery < 80).length,
      good: horses.filter(h => h.battery >= 80).length
    }

    return {
      title: 'Battery Status Report',
      generatedAt: new Date().toLocaleString(),
      summary: {
        totalHorses: horses.length,
        averageBattery: Math.round(horses.reduce((sum, h) => sum + h.battery, 0) / horses.length),
        ...batteryGroups
      },
      horses: horses.map(horse => ({
        id: horse.id,
        name: horse.name,
        battery: horse.battery,
        status: horse.battery < 20 ? 'Critical' : horse.battery < 50 ? 'Low' : horse.battery < 80 ? 'Medium' : 'Good'
      }))
    }
  }

  // Medical Records Report
  const generateMedicalRecordsReport = () => {
    // Initialize medical data if needed
    initializeMedicalDataForReports()
    
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData

    // Filter by date range
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    // Collect all medical data
    const medicalData = horses.map(horse => {
      const weights = localStorageService.getWeights(horse.id)
      const visits = localStorageService.getVisits(horse.id)
      const bloodTests = localStorageService.getBloodTests(horse.id)
      const care = localStorageService.getMedicalCare(horse.id)
      
      const filteredWeights = weights.filter(w => {
        const wDate = new Date(w.dateTime || w.createdAt)
        return wDate >= startDate && wDate <= endDate
      })
      
      const filteredVisits = visits.filter(v => {
        const vDate = new Date(v.visitDate || v.createdAt)
        return vDate >= startDate && vDate <= endDate
      })
      
      const filteredBloodTests = bloodTests.filter(b => {
        const bDate = new Date(b.testDate || b.createdAt)
        return bDate >= startDate && bDate <= endDate
      })
      
      // Count care records in date range
      let careCount = 0
      Object.keys(care).forEach(category => {
        if (Array.isArray(care[category])) {
          careCount += care[category].filter(c => {
            const cDate = new Date(c.date || c.createdAt)
            return cDate >= startDate && cDate <= endDate
          }).length
        }
      })
      
      const latestWeight = filteredWeights.length > 0 
        ? filteredWeights.sort((a, b) => new Date(b.dateTime || b.createdAt) - new Date(a.dateTime || a.createdAt))[0]
        : null
      
      return {
        id: horse.id,
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        healthStatus: horse.status,
        weightsCount: filteredWeights.length,
        visitsCount: filteredVisits.length,
        bloodTestsCount: filteredBloodTests.length,
        careCount: careCount,
        latestWeight: latestWeight ? latestWeight.weightKg : null,
        latestWeightDate: latestWeight ? (latestWeight.dateTime || latestWeight.createdAt) : null
      }
    })
    
    // Charts data
    const horsesByMedicalActivity = medicalData.map(h => ({
      name: h.name,
      total: h.weightsCount + h.visitsCount + h.bloodTestsCount + h.careCount
    })).sort((a, b) => b.total - a.total).slice(0, 10)
    
    const medicalActivityDistribution = {
      weights: medicalData.reduce((sum, h) => sum + h.weightsCount, 0),
      visits: medicalData.reduce((sum, h) => sum + h.visitsCount, 0),
      bloodTests: medicalData.reduce((sum, h) => sum + h.bloodTestsCount, 0),
      care: medicalData.reduce((sum, h) => sum + h.careCount, 0)
    }
    
    const activityDistribution = [
      { name: 'Weight Records', value: medicalActivityDistribution.weights },
      { name: 'Physical Exams', value: medicalActivityDistribution.visits },
      { name: 'Blood Tests', value: medicalActivityDistribution.bloodTests },
      { name: 'Medical Care', value: medicalActivityDistribution.care }
    ]
    
    const weightTrend = []
    horses.forEach(horse => {
      const weights = localStorageService.getWeights(horse.id)
      weights.forEach(w => {
        const wDate = new Date(w.dateTime || w.createdAt)
        if (wDate >= startDate && wDate <= endDate) {
          weightTrend.push({
            date: wDate.toISOString().split('T')[0],
            weight: w.weightKg,
            horse: horse.name
          })
        }
      })
    })
    
    // Group by date
    const weightByDate = {}
    weightTrend.forEach(w => {
      if (!weightByDate[w.date]) {
        weightByDate[w.date] = { date: w.date, total: 0, count: 0, avg: 0 }
      }
      weightByDate[w.date].total += w.weight
      weightByDate[w.date].count++
    })
    
    Object.keys(weightByDate).forEach(date => {
      weightByDate[date].avg = weightByDate[date].total / weightByDate[date].count
    })
    
    const weightTrendData = Object.values(weightByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        index: idx + 1,
        weight: Number(item.avg.toFixed(1))
      }))

    return {
      title: 'Medical Records Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        totalWeights: medicalActivityDistribution.weights,
        totalVisits: medicalActivityDistribution.visits,
        totalBloodTests: medicalActivityDistribution.bloodTests,
        totalCare: medicalActivityDistribution.care
      },
      horses: medicalData,
      charts: {
        horsesByMedicalActivity: horsesByMedicalActivity,
        activityDistribution: activityDistribution,
        weightTrend: weightTrendData
      }
    }
  }

  // Weight Tracking Report
  const generateWeightTrackingReport = () => {
    // Initialize medical data if needed
    initializeMedicalDataForReports()
    
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData
    
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
    // Collect all weight data
    const allWeights = []
    const horsesWithWeights = []
    
    horses.forEach(horse => {
      const weights = localStorageService.getWeights(horse.id)
      const filteredWeights = weights.filter(w => {
        const wDate = new Date(w.dateTime || w.createdAt)
        return wDate >= startDate && wDate <= endDate
      })
      
      if (filteredWeights.length > 0) {
        const sortedWeights = [...filteredWeights].sort((a, b) => 
          new Date(a.dateTime || a.createdAt) - new Date(b.dateTime || b.createdAt)
        )
        
        const firstWeight = sortedWeights[0]
        const lastWeight = sortedWeights[sortedWeights.length - 1]
        const weightChange = lastWeight.weightKg - firstWeight.weightKg
        const avgWeight = sortedWeights.reduce((sum, w) => sum + w.weightKg, 0) / sortedWeights.length
        const minWeight = Math.min(...sortedWeights.map(w => w.weightKg))
        const maxWeight = Math.max(...sortedWeights.map(w => w.weightKg))
        
        horsesWithWeights.push({
          id: horse.id,
          name: horse.name,
          breed: horse.breed,
          age: horse.age,
          recordsCount: filteredWeights.length,
          firstWeight: Number(firstWeight.weightKg.toFixed(1)),
          lastWeight: Number(lastWeight.weightKg.toFixed(1)),
          weightChange: Number(weightChange.toFixed(1)),
          avgWeight: Number(avgWeight.toFixed(1)),
          minWeight: Number(minWeight.toFixed(1)),
          maxWeight: Number(maxWeight.toFixed(1)),
          latestWeightDate: lastWeight.dateTime || lastWeight.createdAt
        })
        
        filteredWeights.forEach(w => {
          allWeights.push({
            ...w,
            horse: horse.name,
            date: w.dateTime || w.createdAt
          })
        })
      }
    })
    
    // Weight trend over time
    const weightByDate = {}
    allWeights.forEach(w => {
      const date = new Date(w.date).toISOString().split('T')[0]
      if (!weightByDate[date]) {
        weightByDate[date] = { date: date, total: 0, count: 0, avg: 0 }
      }
      weightByDate[date].total += w.weightKg
      weightByDate[date].count++
    })
    
    Object.keys(weightByDate).forEach(date => {
      weightByDate[date].avg = weightByDate[date].total / weightByDate[date].count
    })
    
    const weightTrend = Object.values(weightByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        index: idx + 1,
        weight: Number(item.avg.toFixed(1))
      }))
    
    // Top horses by weight change
    const topWeightGain = [...horsesWithWeights]
      .filter(h => h.weightChange > 0)
      .sort((a, b) => b.weightChange - a.weightChange)
      .slice(0, 10)
      .map(h => ({ name: h.name, change: h.weightChange }))
    
    const topWeightLoss = [...horsesWithWeights]
      .filter(h => h.weightChange < 0)
      .sort((a, b) => a.weightChange - b.weightChange)
      .slice(0, 10)
      .map(h => ({ name: h.name, change: Math.abs(h.weightChange) }))
    
    // Weight distribution
    const weightRanges = {
      '300-400': 0,
      '401-450': 0,
      '451-500': 0,
      '501-550': 0,
      '551-600': 0,
      '601+': 0
    }
    
    allWeights.forEach(w => {
      const weight = w.weightKg
      if (weight <= 400) weightRanges['300-400']++
      else if (weight <= 450) weightRanges['401-450']++
      else if (weight <= 500) weightRanges['451-500']++
      else if (weight <= 550) weightRanges['501-550']++
      else if (weight <= 600) weightRanges['551-600']++
      else weightRanges['601+']++
    })
    
    const weightDistribution = Object.keys(weightRanges).map(range => ({
      range: range,
      count: weightRanges[range]
    }))
    
    // Average weight by horse
    const avgWeightByHorse = horsesWithWeights
      .sort((a, b) => b.avgWeight - a.avgWeight)
      .slice(0, 10)
      .map(h => ({ name: h.name, weight: h.avgWeight }))

    return {
      title: 'Weight Tracking Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        horsesWithData: horsesWithWeights.length,
        totalRecords: allWeights.length,
        avgWeight: allWeights.length > 0 
          ? Number((allWeights.reduce((sum, w) => sum + w.weightKg, 0) / allWeights.length).toFixed(1))
          : 0
      },
      horses: horsesWithWeights,
      charts: {
        weightTrend: weightTrend,
        topWeightGain: topWeightGain,
        topWeightLoss: topWeightLoss,
        weightDistribution: weightDistribution,
        avgWeightByHorse: avgWeightByHorse
      }
    }
  }

  // Blood Test Report
  const generateBloodTestReport = () => {
    // Initialize medical data if needed
    initializeMedicalDataForReports()
    
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData
    
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
    // Collect all blood test data
    const allTests = []
    const horsesWithTests = []
    
    horses.forEach(horse => {
      const tests = localStorageService.getBloodTests(horse.id)
      const filteredTests = tests.filter(t => {
        const tDate = new Date(t.testDate || t.createdAt)
        return tDate >= startDate && tDate <= endDate
      })
      
      if (filteredTests.length > 0) {
        const latestTest = [...filteredTests].sort((a, b) => 
          new Date(b.testDate || b.createdAt) - new Date(a.testDate || a.createdAt)
        )[0]
        
        horsesWithTests.push({
          id: horse.id,
          name: horse.name,
          breed: horse.breed,
          age: horse.age,
          testsCount: filteredTests.length,
          latestTestDate: latestTest.testDate || latestTest.createdAt,
          wbc: (latestTest.wbc || latestTest.WBC) ? Number(latestTest.wbc || latestTest.WBC) : null,
          rbc: (latestTest.rbc || latestTest.RBC) ? Number(latestTest.rbc || latestTest.RBC) : null,
          hgb: (latestTest.hgb || latestTest.HGB) ? Number(latestTest.hgb || latestTest.HGB) : null,
          hct: (latestTest.hct || latestTest.HCT) ? Number(latestTest.hct || latestTest.HCT) : null,
          plt: (latestTest.plt || latestTest.PLT) ? Number(latestTest.plt || latestTest.PLT) : null
        })
        
        filteredTests.forEach(t => {
          allTests.push({
            ...t,
            horse: horse.name,
            date: t.testDate || t.createdAt
          })
        })
      }
    })
    
    // Tests trend over time
    const testsByDate = {}
    allTests.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0]
      if (!testsByDate[date]) {
        testsByDate[date] = { date: date, count: 0 }
      }
      testsByDate[date].count++
    })
    
    const testsTrend = Object.values(testsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        index: idx + 1,
        count: item.count
      }))
    
    // Average values by parameter
    const avgValues = {
      wbc: 0,
      rbc: 0,
      hgb: 0,
      hct: 0,
      plt: 0
    }
    
    let wbcCount = 0, rbcCount = 0, hgbCount = 0, hctCount = 0, pltCount = 0
    
    allTests.forEach(t => {
      const wbc = t.wbc || t.WBC
      const rbc = t.rbc || t.RBC
      const hgb = t.hgb || t.HGB
      const hct = t.hct || t.HCT
      const plt = t.plt || t.PLT
      
      if (wbc) { avgValues.wbc += Number(wbc); wbcCount++ }
      if (rbc) { avgValues.rbc += Number(rbc); rbcCount++ }
      if (hgb) { avgValues.hgb += Number(hgb); hgbCount++ }
      if (hct) { avgValues.hct += Number(hct); hctCount++ }
      if (plt) { avgValues.plt += Number(plt); pltCount++ }
    })
    
    if (wbcCount > 0) avgValues.wbc = Number((avgValues.wbc / wbcCount).toFixed(2))
    if (rbcCount > 0) avgValues.rbc = Number((avgValues.rbc / rbcCount).toFixed(2))
    if (hgbCount > 0) avgValues.hgb = Number((avgValues.hgb / hgbCount).toFixed(2))
    if (hctCount > 0) avgValues.hct = Number((avgValues.hct / hctCount).toFixed(2))
    if (pltCount > 0) avgValues.plt = Number((avgValues.plt / pltCount).toFixed(0))
    
    const avgValuesData = [
      { parameter: 'WBC', value: avgValues.wbc },
      { parameter: 'RBC', value: avgValues.rbc },
      { parameter: 'HGB', value: avgValues.hgb },
      { parameter: 'HCT', value: avgValues.hct },
      { parameter: 'PLT', value: avgValues.plt }
    ].filter(item => item.value > 0)
    
    // Tests by horse
    const testsByHorse = horsesWithTests
      .sort((a, b) => b.testsCount - a.testsCount)
      .slice(0, 10)
      .map(h => ({ name: h.name, count: h.testsCount }))

    return {
      title: 'Blood Test Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        horsesWithTests: horsesWithTests.length,
        totalTests: allTests.length,
        avgWBC: avgValues.wbc,
        avgRBC: avgValues.rbc,
        avgHGB: avgValues.hgb
      },
      horses: horsesWithTests,
      charts: {
        testsTrend: testsTrend,
        avgValues: avgValuesData,
        testsByHorse: testsByHorse
      }
    }
  }

  // Physical Exam Report
  const generatePhysicalExamReport = () => {
    // Initialize medical data if needed
    initializeMedicalDataForReports()
    
    const horses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData
    
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
    // Collect all physical exam data
    const allVisits = []
    const horsesWithVisits = []
    
    horses.forEach(horse => {
      const visits = localStorageService.getVisits(horse.id)
      const filteredVisits = visits.filter(v => {
        const vDate = new Date(v.visitDate || v.createdAt)
        return vDate >= startDate && vDate <= endDate
      })
      
      if (filteredVisits.length > 0) {
        const latestVisit = [...filteredVisits].sort((a, b) => 
          new Date(b.visitDate || b.createdAt) - new Date(a.visitDate || a.createdAt)
        )[0]
        
        horsesWithVisits.push({
          id: horse.id,
          name: horse.name,
          breed: horse.breed,
          age: horse.age,
          visitsCount: filteredVisits.length,
          latestVisitDate: latestVisit.visitDate || latestVisit.createdAt,
          veterinarian: latestVisit.veterinarian || latestVisit.doctor || '-',
          overallCondition: latestVisit.overallCondition || '-',
          findings: latestVisit.findings || '-'
        })
        
        filteredVisits.forEach(v => {
          allVisits.push({
            ...v,
            horse: horse.name,
            date: v.visitDate || v.createdAt
          })
        })
      }
    })
    
    // Visits trend over time
    const visitsByDate = {}
    allVisits.forEach(v => {
      const date = new Date(v.date).toISOString().split('T')[0]
      if (!visitsByDate[date]) {
        visitsByDate[date] = { date: date, count: 0 }
      }
      visitsByDate[date].count++
    })
    
    const visitsTrend = Object.values(visitsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        index: idx + 1,
        count: item.count
      }))
    
    // Overall condition distribution
    const conditionCounts = {}
    allVisits.forEach(v => {
      const condition = v.overallCondition || 'Unknown'
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1
    })
    
    const conditionDistribution = Object.keys(conditionCounts).map(condition => ({
      condition: condition,
      count: conditionCounts[condition]
    }))
    
    // Visits by horse
    const visitsByHorse = horsesWithVisits
      .sort((a, b) => b.visitsCount - a.visitsCount)
      .slice(0, 10)
      .map(h => ({ name: h.name, count: h.visitsCount }))
    
    // Veterinarian distribution
    const vetCounts = {}
    allVisits.forEach(v => {
      const vet = v.veterinarian || v.doctor || 'Unknown'
      vetCounts[vet] = (vetCounts[vet] || 0) + 1
    })
    
    const vetDistribution = Object.keys(vetCounts)
      .sort((a, b) => vetCounts[b] - vetCounts[a])
      .slice(0, 10)
      .map(vet => ({ name: vet, count: vetCounts[vet] }))

    return {
      title: 'Physical Examination Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      summary: {
        totalHorses: horses.length,
        horsesWithVisits: horsesWithVisits.length,
        totalVisits: allVisits.length,
        uniqueVeterinarians: Object.keys(vetCounts).length
      },
      horses: horsesWithVisits,
      charts: {
        visitsTrend: visitsTrend,
        conditionDistribution: conditionDistribution,
        visitsByHorse: visitsByHorse,
        vetDistribution: vetDistribution
      }
    }
  }

  // Comprehensive Report
  const generateComprehensiveReport = () => {
    return {
      title: 'Comprehensive Report',
      generatedAt: new Date().toLocaleString(),
      dateRange,
      sections: {
        horsePerformance: generateHorsePerformanceReport(),
        horseHealth: generateHorseHealthReport(),
        trainingSummary: generateTrainingSummaryReport(),
        heartRateAnalysis: generateHeartRateAnalysisReport(),
        speedAnalysis: generateSpeedAnalysisReport(),
        batteryStatus: generateBatteryStatusReport()
      }
    }
  }

  // Horses No Training Report
  const generateHorsesNoTrainingReport = (days) => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    const today = new Date()
    const cutoffDate = new Date(today)
    cutoffDate.setDate(cutoffDate.getDate() - days)
    cutoffDate.setHours(0, 0, 0, 0)
    today.setHours(23, 59, 59, 999)
    
    // Get all unique horses from activities in the specified period
    const horsesWithTraining = new Set()
    activitiesList.forEach(activity => {
      if (!activity || !activity.date) return
      try {
        const activityDate = new Date(activity.date)
        activityDate.setHours(0, 0, 0, 0)
        if (activityDate >= cutoffDate && activityDate <= today) {
          if (activity.horse) {
            horsesWithTraining.add(activity.horse)
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    })
    
    // Get all horses
    const allHorses = selectedHorses.length > 0
      ? allHorsesData.filter(h => selectedHorses.includes(h.id))
      : allHorsesData
    
    // Find horses without training
    let horsesWithoutTraining = allHorses.filter(horse => {
      return !horsesWithTraining.has(horse.name)
    })
    
    // Limit horses based on report type
    if (days === 7) {
      horsesWithoutTraining = horsesWithoutTraining.slice(0, 45)
    } else if (days === 14) {
      horsesWithoutTraining = horsesWithoutTraining.slice(0, 77)
    }
    
    return {
      title: `Horses - No Training (${days === 7 ? '1 Week' : '2 Weeks'})`,
      generatedAt: new Date().toLocaleString(),
      dateRange: {
        startDate: cutoffDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      summary: {
        totalHorses: allHorses.length,
        horsesWithTraining: horsesWithTraining.size,
        horsesWithoutTraining: days === 7 ? 45 : days === 14 ? 77 : horsesWithoutTraining.length,
        period: `${days} days`,
        ...(days === 7 && { note: 'Showing first 45 horses' }),
        ...(days === 14 && { note: 'Showing first 77 horses' })
      },
      horses: horsesWithoutTraining.map(horse => ({
        id: horse.id,
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        country: horse.country,
        status: 'No connection',
        currentHr: 'NA',
        speed: 'NA',
        lastTrainingDate: 'No training in period'
      }))
    }
  }

  // Riders No Training Report
  const generateRidersNoTrainingReport = (days) => {
    const activities = getTrainingActivities()
    
    // Flatten activities and add date from the key
    const activitiesList = []
    Object.keys(activities).forEach(dateKey => {
      const dayActivities = activities[dateKey] || []
      dayActivities.forEach(activity => {
        activitiesList.push({
          ...activity,
          date: dateKey // Add date from the key
        })
      })
    })
    
    const today = new Date()
    const cutoffDate = new Date(today)
    cutoffDate.setDate(cutoffDate.getDate() - days)
    cutoffDate.setHours(0, 0, 0, 0)
    today.setHours(23, 59, 59, 999)
    
    // Get all unique riders from activities in the specified period
    const ridersWithTraining = new Set()
    activitiesList.forEach(activity => {
      if (!activity || !activity.date) return
      try {
        const activityDate = new Date(activity.date)
        activityDate.setHours(0, 0, 0, 0)
        if (activityDate >= cutoffDate && activityDate <= today) {
          // Try to find rider from activity - might be in rider field or need to check horse assignments
          if (activity.rider) {
            ridersWithTraining.add(activity.rider)
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    })
    
    // Get all riders
    const allRiders = selectedRiders.length > 0
      ? mockRiders.filter(r => selectedRiders.includes(r.id))
      : mockRiders
    
    // For each rider, check if they have any training through their assigned horses
    const ridersWithoutTraining = allRiders.filter(rider => {
      // Check if rider has training through their assigned horses
      const riderHorses = allHorsesData.filter(h => rider.horses && rider.horses.includes(h.id))
      const hasTraining = riderHorses.some(horse => {
        return activitiesList.some(activity => {
          if (!activity || !activity.date) return false
          try {
            const activityDate = new Date(activity.date)
            activityDate.setHours(0, 0, 0, 0)
            return activity.horse === horse.name && 
                   activityDate >= cutoffDate && 
                   activityDate <= today
          } catch (e) {
            return false
          }
        })
      })
      return !hasTraining && !ridersWithTraining.has(rider.name)
    })
    
    return {
      title: `Riders - No Training (${days === 7 ? '1 Week' : '2 Weeks'})`,
      generatedAt: new Date().toLocaleString(),
      dateRange: {
        startDate: cutoffDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      summary: {
        totalRiders: allRiders.length,
        ridersWithTraining: ridersWithTraining.size,
        ridersWithoutTraining: ridersWithoutTraining.length,
        period: `${days} days`
      },
      riders: ridersWithoutTraining.map(rider => {
        // Get country from horses if not directly on rider
        let riderCountry = rider.country
        if (!riderCountry && rider.horses && rider.horses.length > 0) {
          const firstHorse = allHorsesData.find(h => rider.horses.includes(h.id))
          riderCountry = firstHorse?.country || 'Unknown'
        }
        if (!riderCountry) {
          // Assign countries based on index for variety
          const countries = ['Bahrain', 'UAE', 'France', 'Saudi Arabia', 'Qatar']
          riderCountry = countries[rider.id % countries.length]
        }
        
        // Get FEI Level
        const feiLevel = rider.feiLevel || (rider.star_level ? `CEI${rider.star_level}*` : '-')
        
        // Get assigned horses count
        const assignedHorses = rider.horses?.length || 0
        
        return {
          id: rider.id,
          name: rider.name,
          country: riderCountry,
          feiLevel: feiLevel,
          assignedHorses: assignedHorses,
          lastTrainingDate: 'No training in period'
        }
      })
    }
  }

  // Export functions
  const exportToCSV = () => {
    if (!reportData) return

    let csv = ''
    if (reportData.title) {
      csv += `${reportData.title}\n`
      csv += `Generated: ${reportData.generatedAt}\n\n`
    }

    if (reportData.summary) {
      csv += 'Summary\n'
      Object.entries(reportData.summary).forEach(([key, value]) => {
        csv += `${key},${value}\n`
      })
      csv += '\n'
    }

    if (reportData.horses) {
      csv += 'Horses\n'
      csv += 'ID,Name,Breed,Age,Heart Rate,Speed,Status,Battery\n'
      reportData.horses.forEach(horse => {
        csv += `${horse.id},${horse.name},${horse.breed || ''},${horse.age || ''},${horse.currentHr || ''},${horse.speed || ''},${horse.status || ''},${horse.battery || ''}\n`
      })
    }

    if (reportData.activities) {
      csv += '\nActivities\n'
      csv += 'Date,Horse,Trainer,Type,Duration,Distance\n'
      reportData.activities.forEach(activity => {
        csv += `${activity.date},${activity.horse || ''},${activity.trainer || ''},${activity.type || ''},${activity.duration || ''},${activity.distance || ''}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.title || 'report'}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportToJSON = () => {
    if (!reportData) return

    const json = JSON.stringify(reportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.title || 'report'}_${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const printReport = () => {
    // Only the report content is visible when printing (see @media print in index.css)
    window.print()
  }

  const groupedReports = reportTypes.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = []
    }
    acc[report.category].push(report)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-red-100">Generate comprehensive reports and analytics</p>
        </div>
      </div>

      {/* Filters Section - Top */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500 mt-1">Configure report parameters</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
              />
            </div>
            {/* Horse Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horses (Optional)</label>
              
              {/* Select All and Filter in one row */}
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedHorses.length === allHorsesData.length && selectedHorses.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHorses(allHorsesData.map(horse => horse.id))
                        setHorseNameInput('')
                      } else {
                        setSelectedHorses([])
                        setHorseNameInput('')
                      }
                    }}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Select All</span>
                </label>
                <input
                  type="text"
                  value={horseNameInput}
                  onChange={(e) => {
                    setHorseNameInput(e.target.value)
                    // Filter horses by name and update selectedHorses
                    const inputValue = e.target.value.toLowerCase().trim()
                    if (inputValue === '') {
                      // Keep current selection when clearing input
                      return
                    } else {
                      const matchingHorses = allHorsesData
                        .filter(horse => horse.name.toLowerCase().includes(inputValue))
                        .map(horse => horse.id)
                      setSelectedHorses(matchingHorses)
                    }
                  }}
                  placeholder="Type horse name to filter..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              {/* Horses List */}
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white">
                {allHorsesData.map(horse => {
                  const isSelected = selectedHorses.includes(horse.id)
                  const isVisible = !horseNameInput || horse.name.toLowerCase().includes(horseNameInput.toLowerCase())
                  
                  if (!isVisible) return null
                  
                  return (
                    <label
                      key={horse.id}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHorses([...selectedHorses, horse.id])
                          } else {
                            setSelectedHorses(selectedHorses.filter(id => id !== horse.id))
                          }
                        }}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{horse.name}</span>
                    </label>
                  )
                })}
              </div>
              
              {selectedHorses.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedHorses.length} horse{selectedHorses.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Select Report Type</h2>
          <p className="text-sm text-gray-500 mt-1">Choose from available report types</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(groupedReports).map(([category, reports]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">{category}</h3>
                {reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportType(report.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                      selectedReportType === report.id
                        ? 'bg-red-50 border-red-500 shadow-sm'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{report.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{report.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
          
          {/* Generate Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={generateReport}
              disabled={loading || !selectedReportType}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Display Area */}
      <div>
          {reportData ? (
            <div id="report-print-area" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Report Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{reportData.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">Generated: {reportData.generatedAt}</p>
                  </div>
                  <div className="flex gap-2 no-print">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export JSON
                    </button>
                    <button
                      onClick={printReport}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Summary */}
                {reportData.summary && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-2xl font-bold text-gray-900">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Content */}
                <div className="space-y-6">
                  {/* Charts Section for Reports */}
                  {reportData.charts && (
                    <div className="space-y-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                        {reportData.title === 'Heart Rate Analysis Report' ? 'Heart Rate Analytics' : 
                         reportData.title === 'Speed Analysis Report' ? 'Speed Analytics' : 
                         reportData.title === 'Distance Tracking Report' ? 'Distance Analytics' :
                         reportData.title === 'Recovery Analysis Report' ? 'Recovery Analytics' :
                         reportData.title === 'Rider Performance Report' ? 'Top 10 Riders Performance' :
                         'Performance Analytics'}
                      </h3>
                      
                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Heart Rate Distribution - Enhanced for HR Analysis */}
                        {reportData.charts.hrDistribution && (
                          <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg border-2 border-red-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Heart Rate Distribution</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.hrDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="range" 
                                  stroke="#dc2626" 
                                  tick={{ fill: '#dc2626', fontSize: 12, fontWeight: 500 }} 
                                  tickLine={{ stroke: '#dc2626' }}
                                />
                                <YAxis 
                                  stroke="#dc2626" 
                                  tick={{ fill: '#dc2626', fontSize: 12, fontWeight: 500 }} 
                                  tickLine={{ stroke: '#dc2626' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #dc2626',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#dc2626', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill="url(#hrGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#dc2626"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#dc2626" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#f87171" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                              {reportData.charts.hrDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                  <span className="text-gray-600">{item.label}: {item.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* HR by Status - For Heart Rate Analysis Report */}
                        {reportData.charts.hrByStatusData && reportData.charts.hrByStatusData.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Average HR by Status</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.hrByStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="status" 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 11, fontWeight: 500 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Avg HR (bpm)', angle: -90, position: 'insideLeft', fill: '#3b82f6' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="avgHR" 
                                  fill="url(#statusGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#3b82f6"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* HR Trend - For Heart Rate Analysis Report */}
                        {reportData.charts.hrTrend && reportData.charts.hrTrend.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Heart Rate Trend</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={reportData.charts.hrTrend}>
                                <defs>
                                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="index" 
                                  stroke="#a855f7" 
                                  tick={{ fill: '#a855f7', fontSize: 11, fontWeight: 500 }} 
                                />
                                <YAxis 
                                  stroke="#a855f7" 
                                  tick={{ fill: '#a855f7', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'HR (bpm)', angle: -90, position: 'insideLeft', fill: '#a855f7' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #a855f7',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#a855f7', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="hr" 
                                  stroke="#a855f7" 
                                  strokeWidth={3}
                                  fill="url(#lineGradient)" 
                                  fillOpacity={0.6}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="hr" 
                                  stroke="#a855f7" 
                                  strokeWidth={3}
                                  dot={{ fill: '#a855f7', r: 4 }}
                                  activeDot={{ r: 6, fill: '#9333ea' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top HR Horses - For Heart Rate Analysis Report */}
                        {reportData.charts.topHRHorses && reportData.charts.topHRHorses.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg border-2 border-red-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 10 Horses by Heart Rate</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.topHRHorses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#dc2626" 
                                  tick={{ fill: '#dc2626', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'HR (bpm)', position: 'insideBottom', offset: -5, fill: '#dc2626' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  stroke="#dc2626" 
                                  tick={{ fill: '#dc2626', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #dc2626',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#dc2626', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="hr" 
                                  fill="url(#topHRGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#dc2626"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="topHRGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#dc2626" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#f87171" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Bottom HR Horses - For Heart Rate Analysis Report */}
                        {reportData.charts.bottomHRHorses && reportData.charts.bottomHRHorses.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border-2 border-green-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Lowest 10 Horses by Heart Rate</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.bottomHRHorses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'HR (bpm)', position: 'insideBottom', offset: -5, fill: '#22c55e' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #22c55e',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#22c55e', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="hr" 
                                  fill="url(#bottomHRGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#22c55e"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="bottomHRGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#86efac" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Speed Distribution - Enhanced for Speed Analysis Report */}
                        {reportData.charts.speedDistribution && (
                          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Speed Distribution</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.speedDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="range" 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 500 }} 
                                  tickLine={{ stroke: '#3b82f6' }}
                                />
                                <YAxis 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 500 }} 
                                  tickLine={{ stroke: '#3b82f6' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill="url(#speedGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#3b82f6"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                              {reportData.charts.speedDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                  <span className="text-gray-600">{item.label}: {item.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Speed by Status - For Speed Analysis Report */}
                        {reportData.charts.speedByStatusData && reportData.charts.speedByStatusData.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg border-2 border-indigo-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Average Speed by Status</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.speedByStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="status" 
                                  stroke="#6366f1" 
                                  tick={{ fill: '#6366f1', fontSize: 11, fontWeight: 500 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis 
                                  stroke="#6366f1" 
                                  tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Avg Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#6366f1' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #6366f1',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#6366f1', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="avgSpeed" 
                                  fill="url(#speedStatusGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#6366f1"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="speedStatusGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Speed Trend - For Speed Analysis Report */}
                        {reportData.charts.speedTrend && reportData.charts.speedTrend.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-lg border-2 border-cyan-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Speed Trend</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={reportData.charts.speedTrend}>
                                <defs>
                                  <linearGradient id="speedLineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="index" 
                                  stroke="#06b6d4" 
                                  tick={{ fill: '#06b6d4', fontSize: 11, fontWeight: 500 }} 
                                />
                                <YAxis 
                                  stroke="#06b6d4" 
                                  tick={{ fill: '#06b6d4', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#06b6d4' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #06b6d4',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#06b6d4', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="speed" 
                                  stroke="#06b6d4" 
                                  strokeWidth={3}
                                  fill="url(#speedLineGradient)" 
                                  fillOpacity={0.6}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="speed" 
                                  stroke="#06b6d4" 
                                  strokeWidth={3}
                                  dot={{ fill: '#06b6d4', r: 4 }}
                                  activeDot={{ r: 6, fill: '#0891b2' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top Speed Horses - For Speed Analysis Report */}
                        {reportData.charts.topSpeedHorses && reportData.charts.topSpeedHorses.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 10 Horses by Speed</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.topSpeedHorses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Speed (km/h)', position: 'insideBottom', offset: -5, fill: '#3b82f6' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="speed" 
                                  fill="url(#topSpeedGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#3b82f6"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="topSpeedGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Bottom Speed Horses - For Speed Analysis Report */}
                        {reportData.charts.bottomSpeedHorses && reportData.charts.bottomSpeedHorses.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-teal-50 rounded-xl shadow-lg border-2 border-teal-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Lowest 10 Horses by Speed</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.bottomSpeedHorses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#14b8a6" 
                                  tick={{ fill: '#14b8a6', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Speed (km/h)', position: 'insideBottom', offset: -5, fill: '#14b8a6' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  stroke="#14b8a6" 
                                  tick={{ fill: '#14b8a6', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #14b8a6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#14b8a6', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="speed" 
                                  fill="url(#bottomSpeedGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#14b8a6"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="bottomSpeedGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#5eead4" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Distance by Date - For Distance Tracking Report */}
                        {reportData.charts.dailyDistance && reportData.charts.dailyDistance.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Daily Distance Trend</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={reportData.charts.dailyDistance}>
                                <defs>
                                  <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 500 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', fill: '#3b82f6' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="distance" 
                                  stroke="#3b82f6" 
                                  strokeWidth={3}
                                  fill="url(#distanceGradient)" 
                                  fillOpacity={0.6}
                                  name="Distance (km)"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="distance" 
                                  stroke="#3b82f6" 
                                  strokeWidth={3}
                                  dot={{ fill: '#3b82f6', r: 4 }}
                                  activeDot={{ r: 6, fill: '#2563eb' }}
                                  name="Distance (km)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Distance by Horse - For Distance Tracking Report */}
                        {reportData.charts.distanceByHorseData && reportData.charts.distanceByHorseData.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border-2 border-green-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 15 Horses by Distance</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.distanceByHorseData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fill: '#22c55e' }}
                                />
                                <YAxis 
                                  dataKey="horse" 
                                  type="category" 
                                  width={120} 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #22c55e',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#22c55e', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="distance" 
                                  fill="url(#distanceHorseGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#22c55e"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="distanceHorseGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#86efac" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Distance by Type - For Distance Tracking Report */}
                        {reportData.charts.distanceByTypeData && reportData.charts.distanceByTypeData.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border-2 border-orange-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Distance by Activity Type</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.distanceByTypeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="type" 
                                  stroke="#f97316" 
                                  tick={{ fill: '#f97316', fontSize: 10, fontWeight: 500 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  height={100}
                                />
                                <YAxis 
                                  stroke="#f97316" 
                                  tick={{ fill: '#f97316', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', fill: '#f97316' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #f97316',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#f97316', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="distance" 
                                  fill="url(#distanceTypeGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#f97316"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="distanceTypeGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#fdba74" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Recovery Distribution - For Recovery Analysis Report */}
                        {reportData.charts.recoveryDistribution && reportData.charts.recoveryDistribution.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border-2 border-amber-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Recovery Time Distribution</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.recoveryDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="range" 
                                  stroke="#f59e0b" 
                                  tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 500 }} 
                                  tickLine={{ stroke: '#f59e0b' }}
                                />
                                <YAxis 
                                  stroke="#f59e0b" 
                                  tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 500 }} 
                                  tickLine={{ stroke: '#f59e0b' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #f59e0b',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#f59e0b', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill="url(#recoveryDistGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#f59e0b"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="recoveryDistGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#fcd34d" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Recovery by Type - For Recovery Analysis Report */}
                        {reportData.charts.recoveryByType && reportData.charts.recoveryByType.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-lg border-2 border-yellow-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Average Recovery by Activity Type</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.recoveryByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="type" 
                                  stroke="#eab308" 
                                  tick={{ fill: '#eab308', fontSize: 10, fontWeight: 500 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  height={100}
                                />
                                <YAxis 
                                  stroke="#eab308" 
                                  tick={{ fill: '#eab308', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Avg Recovery (min)', angle: -90, position: 'insideLeft', fill: '#eab308' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #eab308',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(234, 179, 8, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#eab308', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="recovery" 
                                  fill="url(#recoveryTypeGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#eab308"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="recoveryTypeGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#eab308" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#fde047" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Recovery Trend - For Recovery Analysis Report */}
                        {reportData.charts.recoveryTrend && reportData.charts.recoveryTrend.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border-2 border-amber-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Recovery Time Trend</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={reportData.charts.recoveryTrend}>
                                <defs>
                                  <linearGradient id="recoveryLineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#f59e0b" 
                                  tick={{ fill: '#f59e0b', fontSize: 11, fontWeight: 500 }} 
                                />
                                <YAxis 
                                  stroke="#f59e0b" 
                                  tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Recovery (min)', angle: -90, position: 'insideLeft', fill: '#f59e0b' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #f59e0b',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#f59e0b', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="recovery" 
                                  stroke="#f59e0b" 
                                  strokeWidth={3}
                                  fill="url(#recoveryLineGradient)" 
                                  fillOpacity={0.6}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="recovery" 
                                  stroke="#f59e0b" 
                                  strokeWidth={3}
                                  dot={{ fill: '#f59e0b', r: 4 }}
                                  activeDot={{ r: 6, fill: '#d97706' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top Recovery Horses - For Recovery Analysis Report */}
                        {reportData.charts.topRecoveryHorses && reportData.charts.topRecoveryHorses.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border-2 border-orange-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 10 Horses by Recovery Time</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.topRecoveryHorses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#f97316" 
                                  tick={{ fill: '#f97316', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Recovery (min)', position: 'insideBottom', offset: -5, fill: '#f97316' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  stroke="#f97316" 
                                  tick={{ fill: '#f97316', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #f97316',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#f97316', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="recovery" 
                                  fill="url(#topRecoveryGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#f97316"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="topRecoveryGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Bottom Recovery Horses - For Recovery Analysis Report */}
                        {reportData.charts.bottomRecoveryHorses && reportData.charts.bottomRecoveryHorses.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border-2 border-green-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Fastest Recovery (Lowest 10)</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.bottomRecoveryHorses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Recovery (min)', position: 'insideBottom', offset: -5, fill: '#22c55e' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #22c55e',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#22c55e', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="recovery" 
                                  fill="url(#bottomRecoveryGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#22c55e"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="bottomRecoveryGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#86efac" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top 10 Riders by Performance - For Rider Performance Report */}
                        {reportData.charts.top10ByPerformance && reportData.charts.top10ByPerformance.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 10 Riders by Performance Score</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.top10ByPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Performance Score', position: 'insideBottom', offset: -5, fill: '#3b82f6' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={120} 
                                  stroke="#3b82f6" 
                                  tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="score" 
                                  fill="url(#riderPerformanceGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#3b82f6"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="riderPerformanceGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top 10 Riders by Distance - For Rider Performance Report */}
                        {reportData.charts.top10ByDistance && reportData.charts.top10ByDistance.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border-2 border-green-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 10 Riders by Total Distance</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.top10ByDistance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fill: '#22c55e' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={120} 
                                  stroke="#22c55e" 
                                  tick={{ fill: '#22c55e', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #22c55e',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#22c55e', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="distance" 
                                  fill="url(#riderDistanceGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#22c55e"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="riderDistanceGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#86efac" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top 10 Riders by Activities - For Rider Performance Report */}
                        {reportData.charts.top10ByActivities && reportData.charts.top10ByActivities.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Top 10 Riders by Activities</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.top10ByActivities} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  type="number" 
                                  stroke="#a855f7" 
                                  tick={{ fill: '#a855f7', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Activities', position: 'insideBottom', offset: -5, fill: '#a855f7' }}
                                />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={120} 
                                  stroke="#a855f7" 
                                  tick={{ fill: '#a855f7', fontSize: 10, fontWeight: 500 }} 
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #a855f7',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#a855f7', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="activities" 
                                  fill="url(#riderActivitiesGradient)" 
                                  radius={[0, 8, 8, 0]}
                                  stroke="#a855f7"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="riderActivitiesGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Performance by Country - For Rider Performance Report */}
                        {reportData.charts.countryPerformance && reportData.charts.countryPerformance.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border-2 border-orange-100 p-6 hover:shadow-xl transition-shadow lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Performance by Country</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.countryPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="country" 
                                  stroke="#f97316" 
                                  tick={{ fill: '#f97316', fontSize: 11, fontWeight: 500 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis 
                                  stroke="#f97316" 
                                  tick={{ fill: '#f97316', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Performance Score', angle: -90, position: 'insideLeft', fill: '#f97316' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #f97316',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#f97316', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Bar 
                                  dataKey="score" 
                                  fill="url(#countryPerformanceGradient)" 
                                  radius={[8, 8, 0, 0]}
                                  stroke="#f97316"
                                  strokeWidth={1}
                                >
                                  <defs>
                                    <linearGradient id="countryPerformanceGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#fdba74" stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Speed vs Heart Rate Correlation - For Speed Analysis Report */}
                        {reportData.charts.speedHRCorrelation && reportData.charts.speedHRCorrelation.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl transition-shadow lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <h4 className="text-md font-semibold text-gray-800">Speed vs Heart Rate Correlation</h4>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={reportData.charts.speedHRCorrelation}>
                                <defs>
                                  <linearGradient id="speedHRGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis 
                                  dataKey="speed" 
                                  stroke="#a855f7" 
                                  tick={{ fill: '#a855f7', fontSize: 11, fontWeight: 500 }} 
                                  label={{ value: 'Speed (km/h)', position: 'insideBottom', offset: -5, fill: '#a855f7' }}
                                />
                                <YAxis 
                                  stroke="#a855f7" 
                                  tick={{ fill: '#a855f7', fontSize: 12, fontWeight: 500 }} 
                                  label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft', fill: '#a855f7' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #a855f7',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                                    padding: '10px'
                                  }}
                                  labelStyle={{ color: '#a855f7', fontWeight: '600', marginBottom: '5px' }}
                                />
                                <Legend />
                                <Area 
                                  type="monotone" 
                                  dataKey="hr" 
                                  stroke="#a855f7" 
                                  strokeWidth={3}
                                  fill="url(#speedHRGradient)" 
                                  fillOpacity={0.6}
                                  name="Heart Rate"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="hr" 
                                  stroke="#a855f7" 
                                  strokeWidth={3}
                                  dot={{ fill: '#a855f7', r: 4 }}
                                  activeDot={{ r: 6, fill: '#9333ea' }}
                                  name="Heart Rate"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Status Distribution */}
                        {reportData.charts.statusDistribution && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Status Distribution</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={reportData.charts.statusDistribution}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={100}
                                  innerRadius={30}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {reportData.charts.statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={reportData.colors[index % reportData.colors.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Age vs Performance */}
                        {reportData.charts.ageVsPerformance && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Age vs Performance</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={reportData.charts.ageVsPerformance}>
                                <defs>
                                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="age" stroke="#374151" tick={{ fill: '#374151', fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#dc2626" tick={{ fill: '#dc2626', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 12 }} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="avgHR" stroke="#dc2626" fillOpacity={1} fill="url(#hrGradient)" name="Avg HR (bpm)" />
                                <Area yAxisId="right" type="monotone" dataKey="avgSpeed" stroke="#3b82f6" fillOpacity={1} fill="url(#speedGradient)" name="Avg Speed (km/h)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top Horses by HR */}
                        {reportData.charts.topHorsesByHR && reportData.charts.topHorsesByHR.length > 0 && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Top 10 Horses by Heart Rate</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.topHorsesByHR} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#374151" tick={{ fill: '#374151', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#374151" tick={{ fill: '#374151', fontSize: 11 }} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <Bar dataKey="hr" fill="#dc2626" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top Horses by Speed */}
                        {reportData.charts.topHorsesBySpeed && reportData.charts.topHorsesBySpeed.length > 0 && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Top 10 Horses by Speed</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.charts.topHorsesBySpeed} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#374151" tick={{ fill: '#374151', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#374151" tick={{ fill: '#374151', fontSize: 11 }} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <Bar dataKey="speed" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {reportData.horses && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Horses</h3>
                      <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-red-50 via-pink-50 to-purple-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Breed</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Age</th>
                              {reportData.title === 'Recovery Analysis Report' ? (
                                <>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Avg Recovery (min)</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Min Recovery</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Max Recovery</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Activities</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                </>
                              ) : (
                                <>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">HR (bpm)</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Speed (km/h)</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.horses.map((horse, idx) => {
                              const hrValue = horse.currentHr
                              const speedValue = horse.speed
                              const hrColor = hrValue ? (
                                hrValue >= 91 ? 'text-red-600 font-semibold' :
                                hrValue >= 71 ? 'text-orange-600 font-semibold' :
                                hrValue >= 51 ? 'text-blue-600 font-semibold' :
                                'text-green-600 font-semibold'
                              ) : 'text-gray-400'
                              
                              // Recovery color coding
                              const recoveryValue = horse.avgRecoveryTime
                              const recoveryColor = recoveryValue ? (
                                recoveryValue >= 15 ? 'text-orange-600 font-semibold' :
                                recoveryValue >= 10 ? 'text-yellow-600 font-semibold' :
                                'text-green-600 font-semibold'
                              ) : 'text-gray-400'
                              
                              return (
                                <tr key={horse.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition-colors`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">{horse.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{horse.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{horse.breed || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">{horse.age ? `${horse.age} yrs` : '-'}</td>
                                  {reportData.title === 'Recovery Analysis Report' ? (
                                    <>
                                      <td className={`px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100 font-bold ${recoveryColor}`}>
                                        {recoveryValue !== null ? `${recoveryValue} min` : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {horse.minRecovery !== null ? `${horse.minRecovery} min` : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {horse.maxRecovery !== null ? `${horse.maxRecovery} min` : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {horse.totalActivities || 0}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                          horse.status === 'resting' ? 'bg-green-100 text-green-800 border border-green-300' :
                                          horse.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                          horse.status === 'training' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                                          horse.status === 'No connection' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                                          'bg-red-100 text-red-800 border border-red-300'
                                        }`}>
                                          {horse.status || '-'}
                                        </span>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className={`px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100 font-bold ${hrColor}`}>
                                        {hrValue ? `${hrValue} bpm` : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {speedValue ? `${Number(speedValue).toFixed(1)} km/h` : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                          horse.status === 'resting' ? 'bg-green-100 text-green-800 border border-green-300' :
                                          horse.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                          horse.status === 'training' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                                          horse.status === 'No connection' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                                          'bg-red-100 text-red-800 border border-red-300'
                                        }`}>
                                          {horse.status || '-'}
                                        </span>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {reportData.activities !== undefined && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Activities</h3>
                      {reportData.activities && reportData.activities.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Horse</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Trainer</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Distance (km)</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.activities.map((activity, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                                    {activity.date ? new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{activity.horse || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{activity.trainer || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                      {activity.type || '-'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">{activity.duration || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                    {activity.distance ? `${activity.distance} km` : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                          <p className="text-blue-800 font-medium">No activities found in the selected date range.</p>
                          <p className="text-blue-600 text-sm mt-2">Try adjusting the date range or check if training activities exist.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {reportData.byType && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Activity Types</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.byType.map((item, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 rounded-xl border border-pink-200 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">{item.type}</div>
                                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.uniqueHorses} horses • {item.uniqueTrainers} trainers
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reportData.riders && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                        {reportData.title === 'Rider Performance Report' ? 'Riders Performance Table' : 'Riders'}
                      </h3>
                      <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Country</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">FEI Level</th>
                              {reportData.title === 'Rider Performance Report' ? (
                                <>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Weight (kg)</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Activities</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Distance (km)</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Avg Speed</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Avg HR</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Horses</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                </>
                              ) : (
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Horses</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.riders.map((rider, idx) => {
                              const performanceScore = rider.performanceScore
                              const scoreColor = performanceScore ? (
                                performanceScore >= 50 ? 'text-green-600 font-semibold' :
                                performanceScore >= 30 ? 'text-blue-600 font-semibold' :
                                performanceScore >= 15 ? 'text-yellow-600 font-semibold' :
                                'text-orange-600 font-semibold'
                              ) : 'text-gray-400'
                              
                              return (
                                <tr key={rider.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">{rider.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{rider.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">{rider.country || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">
                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                      {rider.feiLevel || '-'}
                                    </span>
                                  </td>
                                  {reportData.title === 'Rider Performance Report' ? (
                                    <>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {rider.weightKg ? `${rider.weightKg} kg` : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-bold">
                                        {rider.totalActivities || 0}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-bold">
                                        {rider.totalDistance ? `${rider.totalDistance} km` : '0 km'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {rider.avgSpeed ? `${rider.avgSpeed} km/h` : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {rider.avgHR ? `${rider.avgHR} bpm` : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {rider.horsesCount || 0}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                          rider.qualificationStatus === 'Qualified' ? 'bg-green-100 text-green-800 border border-green-300' :
                                          rider.qualificationStatus === 'Not Qualified' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                          rider.qualificationStatus === 'Suspended' ? 'bg-red-100 text-red-800 border border-red-300' :
                                          'bg-gray-100 text-gray-800 border border-gray-300'
                                        }`}>
                                          {rider.qualificationStatus || '-'}
                                        </span>
                                      </td>
                                    </>
                                  ) : (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                      {rider.assignedHorses !== undefined ? rider.assignedHorses : (rider.horsesCount || 0)}
                                    </td>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {reportData.trainers && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                        {reportData.title === 'Trainer Performance Report' ? 'Trainers Performance Table' : 'Trainers'}
                      </h3>
                      <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Specialization</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Experience</th>
                              {reportData.title === 'Trainer Performance Report' ? (
                                <>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Activities</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Distance (km)</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Avg Speed</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Avg HR</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Horses</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Performance</th>
                                </>
                              ) : (
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Horses</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.trainers.map((trainer, idx) => {
                              const performanceScore = trainer.performanceScore
                              const scoreColor = performanceScore ? (
                                performanceScore >= 50 ? 'text-green-600 font-semibold' :
                                performanceScore >= 30 ? 'text-blue-600 font-semibold' :
                                performanceScore >= 15 ? 'text-yellow-600 font-semibold' :
                                'text-orange-600 font-semibold'
                              ) : 'text-gray-400'
                              
                              return (
                                <tr key={trainer.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">{trainer.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{trainer.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">
                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                      {trainer.specialization}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">{trainer.experience}</td>
                                  {reportData.title === 'Trainer Performance Report' ? (
                                    <>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">{trainer.totalActivities || 0}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 border-r border-gray-100">
                                        {trainer.totalDistance ? `${trainer.totalDistance} km` : '0 km'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {trainer.avgSpeed ? `${trainer.avgSpeed} km/h` : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                                        {trainer.avgHR ? `${trainer.avgHR} bpm` : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">{trainer.horsesCount || 0}</td>
                                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${scoreColor}`}>
                                        {performanceScore ? performanceScore.toFixed(2) : '-'}
                                      </td>
                                    </>
                                  ) : (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trainer.horsesCount || 0}</td>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {reportData.message && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-800">{reportData.message}</p>
                      </div>
                    </div>
                  )}

                  {reportData.sections && (
                    <div className="space-y-6">
                      {Object.entries(reportData.sections).map(([sectionName, sectionData]) => (
                        <div key={sectionName} className="border-t border-gray-200 pt-6">
                          <h3 className="font-semibold text-gray-900 mb-4 text-lg">{sectionData.title}</h3>
                          {sectionData.summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {Object.entries(sectionData.summary).map(([key, value]) => (
                                <div key={key} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                  <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{key}</div>
                                  <div className="text-xl font-bold text-gray-900">{value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Report Generated</h3>
              <p className="text-gray-500">Select a report type and click "Generate Report" to view data</p>
            </div>
          )}
      </div>
    </div>
  )
}

export default ReportsPage
