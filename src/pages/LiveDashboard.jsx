import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { generateLiveData } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { useLiveData } from '../context/LiveDataContext'
import UpgradeModal from '../components/UpgradeModal'

const colors = ['#dc2626', '#ef4444', '#f87171', '#991b1b', '#b91c1c', '#dc2626', '#fca5a5', '#fee2e2']

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

  const PIE_COLORS = ['#dc2626', '#ef4444', '#f87171', '#991b1b', '#b91c1c', '#fca5a5', '#fee2e2', '#dc2626']

  const stats = getCombinedStats()
  const heartRateHistory = getCombinedHeartRateHistory()
  const mapCenter = getMapCenter()

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user?.name}</h1>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No horses selected</p>
          <Link to="/dashboard/horses" className="text-red-600 hover:text-red-800">
            Select horses to view dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {t('dashboard.welcome')}, {user?.name}
          {horsesData.length === 0 ? (
            <span className="text-lg text-gray-600 ml-2">
              (All Horses - {allHorsesData.length} total)
            </span>
          ) : horsesData.length > 1 ? (
            <span className="text-lg text-gray-600 ml-2">
              ({horsesData.length} selected horses)
            </span>
          ) : null}
        </h1>
        <Link
          to="/dashboard/horses"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {horsesData.length === 0 ? 'Select Horses' : 'Change Selection'}
        </Link>
      </div>

      {/* Selected Horses List */}
      {horsesData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-2">
            {horsesData.map(({ horse, liveData }, idx) => (
              <div
                key={horse.id}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
              >
                {horse.name} (HR: <span className={getHRColor(horse.currentHr, horse.speed, horse.status)}>{horse.currentHr || 'N/A'}</span> bpm)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.currentHr')}</div>
          {stats.currentHr === null || stats.currentHr === undefined ? (
            <div className="text-3xl font-bold text-gray-400">N/A</div>
          ) : (
            <>
              <div className={`text-3xl font-bold ${getHRColor(stats.currentHr, stats.speed, stats.status)}`}>
                {stats.currentHr} bpm
              </div>
              {(horsesData.length === 0 || horsesData.length > 1) && (
                <div className="text-xs text-gray-500 mt-1">
                  {horsesData.length === 0 ? 'All Horses Average' : 'Average'}
                </div>
              )}
            </>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.maxHr')}</div>
          <div className="text-3xl font-bold text-red-600">{stats.maxHr} bpm</div>
          {(horsesData.length === 0 || horsesData.length > 1) && (
            <div className="text-xs text-gray-500 mt-1">
              {horsesData.length === 0 ? 'All Horses Maximum' : 'Maximum'}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.avgHr')}</div>
          <div className="text-3xl font-bold text-green-600">{stats.avgHr} bpm</div>
          {horsesData.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">Average</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.speed')}</div>
          {stats.speed === null || stats.speed === undefined || stats.status === 'resting' ? (
            <div className="text-3xl font-bold text-gray-400">N/A</div>
          ) : (
            <div className="text-3xl font-bold text-purple-600">{stats.speed.toFixed(1)} km/h</div>
          )}
          {(horsesData.length === 0 || horsesData.length > 1) && stats.speed !== null && (
            <div className="text-xs text-gray-500 mt-1">
              {horsesData.length === 0 ? 'All Horses Average' : 'Average'}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.distance')}</div>
          <div className="text-3xl font-bold text-red-600">{stats.distance.toFixed(1)} km</div>
          {(horsesData.length === 0 || horsesData.length > 1) && (
            <div className="text-xs text-gray-500 mt-1">
              {horsesData.length === 0 ? 'All Horses Total' : 'Total'}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.recovery')}</div>
          <div className="text-3xl font-bold text-orange-600">{stats.recoveryTime} min</div>
          {horsesData.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">Average</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.battery')}</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.battery}%</div>
          {horsesData.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">Average</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('dashboard.esim')}</div>
          <div className="text-3xl font-bold text-teal-600">{stats.esimData}%</div>
          {horsesData.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">Average</div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Heart Rate Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={heartRateHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {horsesData.length === 0 ? (
                <Line
                  type="monotone"
                  dataKey="avgHR"
                  name="Average Heart Rate (All Horses)"
                  stroke={colors[0]}
                  strokeWidth={2}
                />
              ) : (
                horsesData.map(({ liveData }, idx) => (
                  <Line
                    key={liveData.horseId}
                    type="monotone"
                    dataKey={`hr_${liveData.horseId}`}
                    name={liveData.horseName}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Speed vs Heart Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="speed" name="Speed" unit=" km/h" />
              <YAxis dataKey="hr" name="Heart Rate" unit=" bpm" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              {horsesData.length === 0 ? (
                <Scatter
                  name="All Horses (Sample)"
                  data={allHorsesData.slice(0, 50).map(horse => ({
                    speed: horse.speed || 0,
                    hr: horse.currentHr || 0
                  })).filter(d => d.speed > 0 && d.hr > 0)}
                  fill={colors[0]}
                />
              ) : (
                getHorsesForCharts().map(({ liveData }, idx) => (
                  <Scatter
                    key={liveData.horseId}
                    name={liveData.horseName}
                    data={liveData.speedHistory}
                    fill={colors[idx % colors.length]}
                  />
                ))
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recovery Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {horsesData.length === 0 ? (
                <Line
                  type="monotone"
                  data={Array.from({ length: 20 }, (_, i) => ({
                    day: i + 1,
                    time: Math.round(stats.recoveryTime + (Math.random() * 5 - 2.5))
                  }))}
                  dataKey="time"
                  name="Average Recovery Time (All Horses)"
                  stroke={colors[0]}
                  strokeWidth={2}
                />
              ) : (
                getHorsesForCharts().slice(0, 10).map(({ liveData }, idx) => (
                  <Line
                    key={liveData.horseId}
                    type="monotone"
                    data={liveData.recoveryHistory}
                    dataKey="time"
                    name={liveData.horseName}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">stable location</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <MapContainer
              center={mapCenter}
              zoom={horsesData.length === 0 ? 5 : horsesData.length > 1 ? 10 : 13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {horsesData.length === 0 ? (
                // Show sample routes for all horses view (limited to 20 for performance)
                allHorsesData.slice(0, 20).map((horse, idx) => {
                  const sampleRoute = Array.from({ length: 10 }, (_, i) => [
                    (horse.location?.lat || 40.7128) + (Math.random() * 0.01 - 0.005),
                    (horse.location?.lng || -74.0060) + (Math.random() * 0.01 - 0.005)
                  ])
                  return (
                    <Polyline
                      key={horse.id}
                      positions={sampleRoute}
                      color={colors[idx % colors.length]}
                      weight={1}
                      opacity={0.3}
                    />
                  )
                })
              ) : (
                getHorsesForCharts().map(({ liveData }, idx) => (
                  <React.Fragment key={liveData.horseId}>
                    <Polyline
                      positions={liveData.route}
                      color={colors[idx % colors.length]}
                      weight={3}
                      opacity={1}
                    />
                    {liveData.route.length > 0 && (
                      <>
                        <Marker position={liveData.route[0]}>
                          <Popup>
                            <strong>{liveData.horseName}</strong><br />
                            Start
                          </Popup>
                        </Marker>
                        <Marker position={liveData.route[liveData.route.length - 1]}>
                          <Popup>
                            <strong>{liveData.horseName}</strong><br />
                            End
                          </Popup>
                        </Marker>
                      </>
                    )}
                  </React.Fragment>
                ))
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Additional Statistics and Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Horse Statistics & Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breed Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Breeds</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breedDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Horses by Country</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {countryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Battery Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Battery Level Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batteryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average HR by Breed */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Average Heart Rate by Breed</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hrByBreed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgHR" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Speed by Breed */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Average Speed by Breed</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speedByBreed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgSpeed" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feed Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Feed Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feedTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feedTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Age vs Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Age vs Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ageVsPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="avgHR" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} name="Avg HR (bpm)" />
                <Area yAxisId="right" type="monotone" dataKey="avgSpeed" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Avg Speed (km/h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Health Status Overview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Health Status Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthMetrics.map((entry, index) => {
                    const healthColors = ['#10b981', '#f59e0b', '#ef4444']
                    return <Cell key={`cell-${index}`} fill={healthColors[index]} />
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
