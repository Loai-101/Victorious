import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { generateLiveData } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { useLiveData } from '../context/LiveDataContext'
import UpgradeModal from '../components/UpgradeModal'

// Vibrant gradient colors for charts
const colors = [
  'url(#gradient1)', 'url(#gradient2)', 'url(#gradient3)', 'url(#gradient4)',
  'url(#gradient5)', 'url(#gradient6)', 'url(#gradient7)', 'url(#gradient8)'
]

const solidColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'
]

const pieColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe',
  '#fd79a8', '#fdcb6e', '#e17055', '#00b894', '#00cec9', '#0984e3', '#6c5ce7', '#a29bfe'
]

const LiveDashboard = () => {
  const { t } = useTranslation()
  const { user } = useApp()
  const { horsesData: allHorsesData } = useLiveData()
  const [searchParams] = useSearchParams()
  const [selectedHorseIds, setSelectedHorseIds] = useState([])
  const [horsesData, setHorsesData] = useState([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    // Get horse IDs from URL
    const horseIdsParam = searchParams.get('horses')
    if (horseIdsParam) {
      const ids = horseIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
      setSelectedHorseIds(ids)
      
      // Load data for selected horses from live data
      const selectedHorses = allHorsesData.filter(h => ids.includes(h.id))
      const data = selectedHorses.map(horse => ({
        horse,
        liveData: generateLiveData(horse)
      }))
      setHorsesData(data)
    } else {
      // No selection - show all horses (empty array means all horses)
      setSelectedHorseIds([])
      setHorsesData([])
    }
  }, [searchParams, allHorsesData])

  useEffect(() => {
    // Update with live data every 2 seconds
    const interval = setInterval(() => {
      setHorsesData(prev => prev.map(({ horse, liveData }) => {
        const updatedHorse = allHorsesData.find(h => h.id === horse.id) || horse
        return {
          horse: updatedHorse,
          liveData: {
            ...liveData,
            currentHr: updatedHorse.currentHr,
            speed: updatedHorse.speed,
            distance: liveData.distance + 0.1
          }
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [allHorsesData])

  const getCombinedStats = () => {
    // If no horses selected, calculate stats from ALL horses
    const horsesToUse = horsesData.length > 0 
      ? horsesData 
      : allHorsesData.map(horse => ({
          horse,
          liveData: generateLiveData(horse)
        }))
    
    if (horsesToUse.length === 0) return null
    
    if (horsesToUse.length === 1) {
      const horse = horsesToUse[0].horse
      return {
        ...horsesToUse[0].liveData,
        currentHr: horse.currentHr,
        speed: horse.speed,
        status: horse.status
      }
    }

    // Combine stats for multiple horses (or all horses)
    const horsesWithSpeed = horsesToUse.filter(d => d.horse.speed !== null && d.horse.speed !== undefined)
    const horsesWithHR = horsesToUse.filter(d => d.horse.currentHr !== null && d.horse.currentHr !== undefined)
    
    const combined = {
      currentHr: horsesWithHR.length > 0
        ? Math.round(horsesWithHR.reduce((sum, d) => sum + d.horse.currentHr, 0) / horsesWithHR.length)
        : null,
      maxHr: Math.max(...horsesToUse.map(d => d.liveData.maxHr)),
      avgHr: Math.round(horsesToUse.reduce((sum, d) => sum + d.liveData.avgHr, 0) / horsesToUse.length),
      speed: horsesWithSpeed.length > 0 
        ? horsesWithSpeed.reduce((sum, d) => sum + d.horse.speed, 0) / horsesWithSpeed.length 
        : null,
      distance: horsesToUse.reduce((sum, d) => sum + d.liveData.distance, 0),
      recoveryTime: Math.round(horsesToUse.reduce((sum, d) => sum + d.liveData.recoveryTime, 0) / horsesToUse.length),
      battery: Math.round(horsesToUse.reduce((sum, d) => sum + d.horse.battery, 0) / horsesToUse.length),
      esimData: Math.round(horsesToUse.reduce((sum, d) => sum + d.horse.esimData, 0) / horsesToUse.length),
      status: horsesToUse[0].horse.status
    }
    return combined
  }

  const getHRColor = (hr, speed, status) => {
    if (status === 'No connection' || hr === null) {
      return 'text-gray-400' // Gray for No connection
    }
    
    switch (status) {
      case 'resting':
        return 'text-green-600' // Green for resting (30-43 HR)
      case 'active':
        return 'text-red-600' // Red for active (45-55 HR)
      case 'training':
        return 'text-orange-600' // Orange for training (60-95 HR)
      case 'racing':
        return 'text-red-600' // Red for racing (95-120 HR)
      default:
        return 'text-gray-600'
    }
  }

  const getCombinedHeartRateHistory = () => {
    // If no horses selected, use all horses
    const horsesToUse = horsesData.length > 0 
      ? horsesData 
      : allHorsesData.map(horse => ({
          horse,
          liveData: generateLiveData(horse)
        }))
    
    if (horsesToUse.length === 0) return []
    
    // For all horses, show average HR instead of individual lines
    if (horsesData.length === 0) {
      // Calculate average HR across all horses
      const maxLength = Math.max(...horsesToUse.map(d => d.liveData.heartRateHistory.length))
      return Array.from({ length: maxLength }, (_, i) => {
        const validHRs = horsesToUse
          .map(d => d.liveData.heartRateHistory[i]?.hr)
          .filter(hr => hr !== null && hr !== undefined)
        
        const avgHR = validHRs.length > 0
          ? Math.round(validHRs.reduce((sum, hr) => sum + hr, 0) / validHRs.length)
          : null
        
        return {
          time: i,
          avgHR: avgHR
        }
      })
    }
    
    // For selected horses, show individual lines
    const maxLength = Math.max(...horsesToUse.map(d => d.liveData.heartRateHistory.length))
    return Array.from({ length: maxLength }, (_, i) => {
      const dataPoint = { time: i }
      horsesToUse.forEach(({ liveData }, idx) => {
        if (liveData.heartRateHistory[i]) {
          dataPoint[`hr_${liveData.horseId}`] = liveData.heartRateHistory[i].hr
          dataPoint[`name_${liveData.horseId}`] = liveData.horseName
        }
      })
      return dataPoint
    })
  }

  const getMapCenter = () => {
    // If no horses selected, use all horses
    const horsesToUse = horsesData.length > 0 
      ? horsesData 
      : allHorsesData.map(horse => ({
          horse,
          liveData: generateLiveData(horse)
        }))
    
    if (horsesToUse.length === 0) return [40.7128, -74.0060]
    if (horsesToUse.length === 1) {
      return horsesToUse[0].liveData.location || [40.7128, -74.0060]
    }
    // Center of all locations
    const lats = horsesToUse.map(d => d.liveData.location?.[0] || 40.7128)
    const lngs = horsesToUse.map(d => d.liveData.location?.[1] || -74.0060)
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ]
  }
  
  const getHorsesForCharts = () => {
    // If no horses selected, return empty array (we'll use direct horse data for stats)
    // Only generate live data for selected horses
    return horsesData
  }

  // Get horses for statistics (direct data, no live data generation)
  const getHorsesForStats = () => {
    return horsesData.length > 0 
      ? horsesData.map(d => d.horse)
      : allHorsesData
  }

  // Helper functions for new statistics - use direct horse data (no live data generation)
  // Memoized to prevent recalculation on every render
  const ageDistribution = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const ageGroups = {}
    horsesToUse.forEach((horse) => {
      const age = horse.age
      const group = age < 5 ? '0-4' : age < 10 ? '5-9' : age < 15 ? '10-14' : '15+'
      ageGroups[group] = (ageGroups[group] || 0) + 1
    })
    return Object.entries(ageGroups).map(([name, value]) => ({ name, value }))
  }, [horsesData.length, allHorsesData.length])

  const statusDistribution = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const statusCounts = {}
    horsesToUse.forEach((horse) => {
      const status = horse.status || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [horsesData.length, allHorsesData.length])

  const breedDistribution = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const breedCounts = {}
    horsesToUse.forEach((horse) => {
      const breed = horse.breed || 'Unknown'
      breedCounts[breed] = (breedCounts[breed] || 0) + 1
    })
    return Object.entries(breedCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 breeds
  }, [horsesData.length, allHorsesData.length])

  const countryDistribution = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const countryCounts = {}
    horsesToUse.forEach((horse) => {
      const country = horse.country || 'Unknown'
      countryCounts[country] = (countryCounts[country] || 0) + 1
    })
    return Object.entries(countryCounts).map(([name, value]) => ({ name, value }))
  }, [horsesData.length, allHorsesData.length])

  const batteryDistribution = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const batteryGroups = { '0-20%': 0, '21-40%': 0, '41-60%': 0, '61-80%': 0, '81-100%': 0 }
    horsesToUse.forEach((horse) => {
      const battery = horse.battery || 0
      if (battery <= 20) batteryGroups['0-20%']++
      else if (battery <= 40) batteryGroups['21-40%']++
      else if (battery <= 60) batteryGroups['41-60%']++
      else if (battery <= 80) batteryGroups['61-80%']++
      else batteryGroups['81-100%']++
    })
    return Object.entries(batteryGroups).map(([name, value]) => ({ name, value }))
  }, [horsesData.length, allHorsesData.length])

  const hrByBreed = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const breedHR = {}
    horsesToUse.forEach((horse) => {
      const breed = horse.breed || 'Unknown'
      if (!breedHR[breed]) {
        breedHR[breed] = { total: 0, count: 0, avgHR: 0 }
      }
      if (horse.currentHr !== null && horse.currentHr !== undefined) {
        breedHR[breed].total += horse.currentHr
        breedHR[breed].count++
      }
    })
    return Object.entries(breedHR)
      .map(([name, data]) => ({ 
        name, 
        avgHR: data.count > 0 ? Math.round(data.total / data.count) : 0 
      }))
      .filter(item => item.avgHR > 0)
      .sort((a, b) => b.avgHR - a.avgHR)
      .slice(0, 10)
  }, [horsesData.length, allHorsesData.length])

  const speedByBreed = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const breedSpeed = {}
    horsesToUse.forEach((horse) => {
      const breed = horse.breed || 'Unknown'
      if (!breedSpeed[breed]) {
        breedSpeed[breed] = { total: 0, count: 0, avgSpeed: 0 }
      }
      if (horse.speed !== null && horse.speed !== undefined) {
        breedSpeed[breed].total += horse.speed
        breedSpeed[breed].count++
      }
    })
    return Object.entries(breedSpeed)
      .map(([name, data]) => ({ 
        name, 
        avgSpeed: data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0 
      }))
      .filter(item => item.avgSpeed > 0)
      .sort((a, b) => b.avgSpeed - a.avgSpeed)
      .slice(0, 10)
  }, [horsesData.length, allHorsesData.length])

  const feedTypeDistribution = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const feedCounts = {}
    horsesToUse.forEach((horse) => {
      const feed = horse.feedType || 'Unknown'
      feedCounts[feed] = (feedCounts[feed] || 0) + 1
    })
    return Object.entries(feedCounts).map(([name, value]) => ({ name, value }))
  }, [horsesData.length, allHorsesData.length])

  const ageVsPerformance = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    const agePerformance = {}
    horsesToUse.forEach((horse) => {
      const age = horse.age
      if (!agePerformance[age]) {
        agePerformance[age] = { totalHR: 0, totalSpeed: 0, count: 0, avgHR: 0, avgSpeed: 0 }
      }
      if (horse.currentHr !== null) {
        agePerformance[age].totalHR += horse.currentHr
        agePerformance[age].count++
      }
      if (horse.speed !== null) {
        agePerformance[age].totalSpeed += horse.speed
      }
    })
    return Object.entries(agePerformance)
      .map(([age, data]) => ({
        age: parseInt(age),
        avgHR: data.count > 0 ? Math.round(data.totalHR / data.count) : 0,
        avgSpeed: data.count > 0 ? Number((data.totalSpeed / data.count).toFixed(1)) : 0
      }))
      .filter(item => item.avgHR > 0)
      .sort((a, b) => a.age - b.age)
  }, [horsesData.length, allHorsesData.length])

  const healthMetrics = useMemo(() => {
    const horsesToUse = getHorsesForStats()
    let healthy = 0
    let monitoring = 0
    let critical = 0
    
    horsesToUse.forEach((horse) => {
      const hr = horse.currentHr
      const battery = horse.battery
      const status = horse.status
      
      if (status === 'No connection' || battery < 20) {
        critical++
      } else if (status === 'resting' || status === 'active' || (hr && hr >= 30 && hr <= 55)) {
        healthy++
      } else {
        monitoring++
      }
    })
    
    return [
      { name: 'Healthy', value: healthy },
      { name: 'Monitoring', value: monitoring },
      { name: 'Critical', value: critical }
    ]
  }, [horsesData.length, allHorsesData.length])

  const PIE_COLORS = pieColors

  const stats = getCombinedStats()
  const heartRateHistory = getCombinedHeartRateHistory()
  const mapCenter = getMapCenter()

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user?.name}</h1>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">{t('dashboard.noHorsesSelected')}</p>
          <Link to="/dashboard/horses" className="text-red-600 hover:text-red-800">
            {t('dashboard.selectHorsesToView')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {t('dashboard.welcome')}, {user?.name}
          {horsesData.length === 0 ? (
            <span className="text-lg text-gray-600 ml-2">
              ({t('dashboard.allHorses')} - {allHorsesData.length} {t('dashboard.total')})
            </span>
          ) : horsesData.length > 1 ? (
            <span className="text-lg text-gray-600 ml-2">
              ({horsesData.length} {t('dashboard.selectedHorses')})
            </span>
          ) : null}
        </h1>
        <Link
          to="/dashboard/horses"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {horsesData.length === 0 ? t('dashboard.selectHorses') : t('dashboard.changeSelection')}
        </Link>
      </div>

      {/* Selected Horses List */}
      {horsesData.length > 0 && (
        <div className="card-3d bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 p-4 rounded-xl shadow-lg border border-pink-200">
          <div className="flex flex-wrap gap-3">
            {horsesData.map(({ horse, liveData }, idx) => (
              <div
                key={horse.id}
                className="px-4 py-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {horse.name} ({t('dashboard.currentHr')}: <span className="font-bold">{horse.currentHr || t('common.na')}</span> {t('routeMap.bpm')})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gradient Definitions for SVG */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#ee5a6f" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ecdc4" />
            <stop offset="100%" stopColor="#44a08d" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#45b7d1" />
            <stop offset="100%" stopColor="#96c93d" />
          </linearGradient>
          <linearGradient id="gradient4" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f9ca24" />
            <stop offset="100%" stopColor="#f0932b" />
          </linearGradient>
          <linearGradient id="gradient5" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0932b" />
            <stop offset="100%" stopColor="#eb4d4b" />
          </linearGradient>
          <linearGradient id="gradient6" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="100%" stopColor="#a29bfe" />
          </linearGradient>
          <linearGradient id="gradient7" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fd79a8" />
            <stop offset="100%" stopColor="#fdcb6e" />
          </linearGradient>
          <linearGradient id="gradient8" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00b894" />
            <stop offset="100%" stopColor="#00cec9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stats Cards with 3D Effects - Red Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-3d bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.currentHr')}</div>
          {stats.currentHr === null || stats.currentHr === undefined ? (
            <div className="text-4xl font-bold opacity-75">{t('common.na')}</div>
          ) : (
            <>
              <div className="text-4xl font-bold text-white">
                {stats.currentHr} <span className="text-2xl">bpm</span>
              </div>
              {(horsesData.length === 0 || horsesData.length > 1) && (
                <div className="text-xs opacity-80 mt-2">
                  {horsesData.length === 0 ? t('dashboard.allHorsesAverage') : t('dashboard.average')}
                </div>
              )}
            </>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.maxHr')}</div>
          <div className="text-4xl font-bold">{stats.maxHr} <span className="text-2xl">bpm</span></div>
          {(horsesData.length === 0 || horsesData.length > 1) && (
            <div className="text-xs opacity-80 mt-2">
              {horsesData.length === 0 ? t('dashboard.allHorsesMaximum') : t('dashboard.maximum')}
            </div>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.avgHr')}</div>
          <div className="text-4xl font-bold">{stats.avgHr} <span className="text-2xl">bpm</span></div>
          {horsesData.length > 1 && (
            <div className="text-xs opacity-80 mt-2">Average</div>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.speed')}</div>
          {stats.speed === null || stats.speed === undefined || stats.status === 'resting' ? (
            <div className="text-4xl font-bold opacity-75">{t('common.na')}</div>
          ) : (
            <div className="text-4xl font-bold">{stats.speed.toFixed(1)} <span className="text-2xl">km/h</span></div>
          )}
          {(horsesData.length === 0 || horsesData.length > 1) && stats.speed !== null && (
            <div className="text-xs opacity-80 mt-2">
              {horsesData.length === 0 ? t('dashboard.allHorsesAverage') : t('dashboard.average')}
            </div>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.distance')}</div>
          <div className="text-4xl font-bold">{stats.distance.toFixed(1)} <span className="text-2xl">km</span></div>
          {(horsesData.length === 0 || horsesData.length > 1) && (
            <div className="text-xs opacity-80 mt-2">
              {horsesData.length === 0 ? t('dashboard.allHorsesTotal') : t('dashboard.total')}
            </div>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.recovery')}</div>
          <div className="text-4xl font-bold">{stats.recoveryTime} <span className="text-2xl">min</span></div>
          {horsesData.length > 1 && (
            <div className="text-xs opacity-80 mt-2">Average</div>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.battery')}</div>
          <div className="text-4xl font-bold">{stats.battery}%</div>
          {horsesData.length > 1 && (
            <div className="text-xs opacity-80 mt-2">Average</div>
          )}
        </div>
        <div className="card-3d bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 rounded-xl text-white transform transition-all duration-300">
          <div className="text-sm opacity-90 mb-2 font-medium">{t('dashboard.esim')}</div>
          <div className="text-4xl font-bold">{stats.esimData}%</div>
          {horsesData.length > 1 && (
            <div className="text-xs opacity-80 mt-2">Average</div>
          )}
        </div>
      </div>

      {/* Performance Charts - Professional Style */}
      <div className="space-y-8">
        {/* Heart Rate Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Heart Rate Over Time</h2>
          <div className="chart-glow">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={heartRateHistory} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#374151"
                  tick={{ fill: '#374151', fontSize: 11 }}
                  tickLine={{ stroke: '#374151' }}
                  label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#374151', style: { fontSize: '12px' } }}
                />
                <YAxis 
                  stroke="#374151"
                  tick={{ fill: '#374151', fontSize: 11 }}
                  tickLine={{ stroke: '#374151' }}
                  label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft', fill: '#374151', style: { fontSize: '12px' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                {horsesData.length === 0 ? (
                  <Line
                    type="monotone"
                    dataKey="avgHR"
                    name={t('dashboard.allHorsesAverage')}
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#dc2626' }}
                  />
                ) : (
                  horsesData.map(({ liveData }, idx) => {
                    const color = solidColors[idx % solidColors.length]
                    return (
                      <Line
                        key={liveData.horseId}
                        type="monotone"
                        dataKey={`hr_${liveData.horseId}`}
                        name={liveData.horseName}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: color }}
                      />
                    )
                  })
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speed vs Heart Rate - Dual Y-Axis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Speed vs Heart Rate</h2>
          <div className="chart-glow">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart 
                data={horsesData.length === 0 
                  ? allHorsesData.slice(0, 30).map((horse, idx) => ({
                      time: idx,
                      speed: horse.speed || 0,
                      hr: horse.currentHr || 0
                    })).filter(d => d.speed > 0 && d.hr > 0)
                  : getHorsesForCharts().flatMap(({ liveData }) => 
                      liveData.speedHistory.map((point, idx) => ({
                        time: idx,
                        speed: point.speed,
                        hr: point.hr
                      }))
                    )
                }
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#374151"
                  tick={{ fill: '#374151', fontSize: 11 }}
                  tickLine={{ stroke: '#374151' }}
                  label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#374151', style: { fontSize: '12px' } }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#3b82f6"
                  tick={{ fill: '#3b82f6', fontSize: 11 }}
                  tickLine={{ stroke: '#3b82f6' }}
                  label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#3b82f6', style: { fontSize: '12px' } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#dc2626"
                  tick={{ fill: '#dc2626', fontSize: 11 }}
                  tickLine={{ stroke: '#dc2626' }}
                  label={{ value: 'Heart Rate (bpm)', angle: 90, position: 'insideRight', fill: '#dc2626', style: { fontSize: '12px' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                <Line 
                  yAxisId="left"
                  type="monotone"
                  dataKey="speed"
                  name="Speed (km/h)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone"
                  dataKey="hr"
                  name="Heart Rate (bpm)"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#dc2626' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-black">Recovery Time</h2>
          <div className="chart-glow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={horsesData.length === 0 
                  ? Array.from({ length: 20 }, (_, i) => ({
                      day: i + 1,
                      time: Math.round(stats.recoveryTime + (Math.random() * 5 - 2.5))
                    }))
                  : getHorsesForCharts()[0]?.liveData.recoveryHistory || []
                }
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f9ca24" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#f9ca24" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f9ca24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#6b7280' }}
                  label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#6b7280' }}
                  label={{ value: 'Recovery Time (min)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '10px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '5px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="line"
                />
                {horsesData.length === 0 ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="time"
                      stroke="none"
                      fill="url(#recoveryGradient)"
                      fillOpacity={0.6}
                    />
                    <Line
                      type="monotone"
                      dataKey="time"
                      name={t('dashboard.allHorsesAverage')}
                      stroke="#f9ca24"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#f9ca24', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </>
                ) : (
                  getHorsesForCharts().slice(0, 10).map(({ liveData }, idx) => {
                    const color = solidColors[idx % solidColors.length]
                    return (
                      <Line
                        key={liveData.horseId}
                        type="monotone"
                        data={liveData.recoveryHistory}
                        dataKey="time"
                        name={liveData.horseName}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                      />
                    )
                  })
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Additional Statistics and Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Horse Statistics & Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Age Distribution</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistribution} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                    label={{ value: 'Number of Horses', angle: -90, position: 'insideLeft', fill: '#374151', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#6c5ce7" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Status Distribution</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={25}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={1.5}
                    paddingAngle={1}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breed Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Breeds</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={breedDistribution} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#45b7d1" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Country Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Horses by Country</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={25}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={1.5}
                    paddingAngle={1}
                  >
                    {countryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Battery Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Battery Level Distribution</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batteryDistribution} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                    label={{ value: 'Number of Horses', angle: -90, position: 'insideLeft', fill: '#374151', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#f9ca24" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average HR by Breed */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Average Heart Rate by Breed</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hrByBreed} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                    label={{ value: 'Average Heart Rate (bpm)', angle: -90, position: 'insideLeft', fill: '#374151', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="avgHR" 
                    fill="#dc2626" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Speed by Breed */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Average Speed by Breed</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={speedByBreed} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                    label={{ value: 'Average Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#374151', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="avgSpeed" 
                    fill="#4ecdc4" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feed Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Feed Type Distribution</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feedTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={25}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={1.5}
                    paddingAngle={1}
                  >
                    {feedTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age vs Performance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Age vs Performance</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ageVsPerformance} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="hrAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="speedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#4ecdc4" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="age" 
                    stroke="#374151"
                    tick={{ fill: '#374151', fontSize: 11 }}
                    tickLine={{ stroke: '#374151' }}
                    label={{ value: 'Age (years)', position: 'insideBottom', offset: -10, fill: '#374151', style: { fontSize: '12px' } }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#dc2626"
                    tick={{ fill: '#dc2626', fontSize: 11 }}
                    tickLine={{ stroke: '#dc2626' }}
                    label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft', fill: '#dc2626', style: { fontSize: '12px' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#4ecdc4"
                    tick={{ fill: '#4ecdc4', fontSize: 11 }}
                    tickLine={{ stroke: '#4ecdc4' }}
                    label={{ value: 'Speed (km/h)', angle: 90, position: 'insideRight', fill: '#4ecdc4', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="avgHR" stackId="1" stroke="#dc2626" fill="url(#hrAreaGradient)" strokeWidth={2} name="Avg HR (bpm)" />
                  <Area yAxisId="right" type="monotone" dataKey="avgSpeed" stackId="2" stroke="#4ecdc4" fill="url(#speedAreaGradient)" strokeWidth={2} name="Avg Speed (km/h)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Status Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Health Status Overview</h3>
            <div className="chart-glow">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={25}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={1.5}
                    paddingAngle={1}
                  >
                    {healthMetrics.map((entry, index) => {
                      const healthColors = ['#10b981', '#f59e0b', '#ef4444']
                      return <Cell key={`cell-${index}`} fill={healthColors[index]} />
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user?.subscription}
      />
    </div>
  )
}

export default LiveDashboard
