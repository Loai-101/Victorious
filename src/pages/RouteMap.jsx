import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLiveData } from '../context/LiveDataContext'
import { mockHorses } from '../data/mockData'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom horse icon
const createHorseIcon = (color = 'red') => {
  return L.divIcon({
    className: 'horse-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

// Country locations for routes
const countryLocations = {
  'Bahrain': [26.0667, 50.5577],
  'UAE': [24.4539, 54.3773],
  'France': [48.8566, 2.3522],
  'Saudi Arabia': [24.7136, 46.6753],
  'Kuwait': [29.3759, 47.9774],
  'Oman': [23.5859, 58.4059],
  'Qatar': [25.2854, 51.5310],
  'Jordan': [31.9539, 35.9106]
}

// Helper function to calculate distance in km between two lat/lng points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Generate route points for a given distance (circular route)
const generateRoutePoints = (centerLat, centerLng, distanceKm, numPoints = 50) => {
  // Calculate radius in degrees (approximate: 1 degree ≈ 111 km)
  const radiusDegrees = distanceKm / (2 * Math.PI * 111) // For circular route
  
  return Array.from({ length: numPoints }, (_, i) => {
    const angle = (i / numPoints) * Math.PI * 2
    return [
      centerLat + Math.cos(angle) * radiusDegrees,
      centerLng + Math.sin(angle) * radiusDegrees
    ]
  })
}

const RouteMap = () => {
  const { t } = useTranslation()
  const { horsesData } = useLiveData()
  const [selectedRoutes, setSelectedRoutes] = useState([])
  const [horsePositions, setHorsePositions] = useState({})

  // Predefined routes with different lengths in different countries
  const predefinedRoutes = useMemo(() => {
    const routeLengths = [4, 6, 10, 20, 40, 60, 80, 100, 120]
    const countries = Object.keys(countryLocations)
    const routeColors = ['#dc2626', '#ef4444', '#f87171', '#991b1b', '#b91c1c', '#7f1d1d', '#dc2626', '#ef4444', '#f87171']
    
    return routeLengths.map((length, index) => {
      const country = countries[index % countries.length]
      const [centerLat, centerLng] = countryLocations[country]
      
      // Adjust center slightly for each route to avoid overlap
      const offsetLat = centerLat + (index % 3 - 1) * 0.1
      const offsetLng = centerLng + (Math.floor(index / 3) % 3 - 1) * 0.1
      
      // Generate more points for longer routes
      const numPoints = Math.max(30, Math.min(100, length * 2))
      const routePoints = generateRoutePoints(offsetLat, offsetLng, length, numPoints)
      
      // Assign 7-15 horses to this route - prioritize active horses
      const activeHorses = horsesData.filter(h => h.status !== 'No connection' && h.status !== 'resting')
      const availableHorses = activeHorses.length > 0 ? activeHorses : horsesData
      
      // Random number between 7 and 15 horses per route
      const numHorses = 7 + (index % 9) // This gives 7-15 horses (7 + 0-8)
      const assignedHorses = []
      
      for (let i = 0; i < numHorses; i++) {
        const horseIndex = (index * numHorses + i) % availableHorses.length
        assignedHorses.push(availableHorses[horseIndex])
      }
      
      return {
        id: `route-${length}km`,
        name: `${length} km Route`,
        distance: length,
        country: country,
        color: routeColors[index % routeColors.length],
        points: routePoints,
        horses: assignedHorses,
        center: [offsetLat, offsetLng]
      }
    })
  }, [horsesData])

  // Initialize horse positions at start of routes (only for routes with horses)
  useEffect(() => {
    const initialPositions = {}
    predefinedRoutes.forEach(route => {
      if (route.points && route.points.length > 0 && route.horses && route.horses.length > 0) {
        // Initialize positions for all horses on this route
        route.horses.forEach((horse, horseIndex) => {
          const positionKey = `${route.id}-${horse.id}`
          // Start each horse at a different point on the route to spread them out
          const startIndex = Math.floor((horseIndex / route.horses.length) * route.points.length)
          initialPositions[positionKey] = {
            position: route.points[startIndex],
            currentIndex: startIndex,
            routeId: route.id,
            horseId: horse.id
          }
        })
      }
    })
    setHorsePositions(initialPositions)
  }, [predefinedRoutes])

  // Animate horses moving along routes
  useEffect(() => {
    if (predefinedRoutes.length === 0) return

    // Start animation immediately
    const updatePositions = () => {
      setHorsePositions(prev => {
        const updated = { ...prev }
        
        predefinedRoutes.forEach(route => {
          if (!route.horses || route.horses.length === 0 || !route.points || route.points.length === 0) return
          
          // Update positions for all horses on this route
          route.horses.forEach(horse => {
            const positionKey = `${route.id}-${horse.id}`
            
            // Initialize if not exists
            if (!updated[positionKey] || typeof updated[positionKey].currentIndex !== 'number') {
              const startIndex = Math.floor((route.horses.indexOf(horse) / route.horses.length) * route.points.length)
              updated[positionKey] = {
                position: route.points[startIndex],
                currentIndex: startIndex,
                routeId: route.id,
                horseId: horse.id
              }
              return
            }
            
            const current = updated[positionKey]
            if (typeof current.currentIndex !== 'number') {
              const startIndex = Math.floor((route.horses.indexOf(horse) / route.horses.length) * route.points.length)
              updated[positionKey] = {
                position: route.points[startIndex],
                currentIndex: startIndex,
                routeId: route.id,
                horseId: horse.id
              }
              return
            }
          
            // Move horse to next point (each horse moves at slightly different speed based on their index)
            const speedMultiplier = 1 + (route.horses.indexOf(horse) % 3) * 0.1 // Slight variation in speed
            let nextIndex = Math.floor((current.currentIndex + speedMultiplier) % route.points.length)
            
            updated[positionKey] = {
              position: route.points[nextIndex],
              currentIndex: nextIndex,
              routeId: route.id,
              horseId: horse.id
            }
          })
        })
        
        return updated
      })
    }

    // Run immediately, then set interval
    updatePositions()
    const interval = setInterval(updatePositions, 2000) // Move every 2 seconds

    return () => clearInterval(interval)
  }, [predefinedRoutes])

  // Calculate map center and bounds
  const mapCenter = useMemo(() => {
    if (predefinedRoutes.length === 0) return [26.0667, 50.5577] // Default to Bahrain
    
    const allPoints = predefinedRoutes.flatMap(r => r.points)
    if (allPoints.length === 0) return [26.0667, 50.5577]
    
    const lats = allPoints.map(p => p[0])
    const lngs = allPoints.map(p => p[1])
    
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ]
  }, [predefinedRoutes])

  const toggleRoute = (routeId) => {
    setSelectedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    )
  }

  const visibleRoutes = selectedRoutes.length > 0 
    ? predefinedRoutes.filter(r => selectedRoutes.includes(r.id))
    : predefinedRoutes

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('routeMap.title')}</h1>
        <div className="text-sm text-gray-600">
          {predefinedRoutes.length} {t('routeMap.routes')} | {predefinedRoutes.reduce((sum, r) => sum + (r.horses?.length || 0), 0)} {t('routeMap.totalHorses')} | {Object.keys(horsePositions).length} {t('routeMap.horsesMoving')}
        </div>
      </div>

      {/* Route Selection Panel */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">{t('routeMap.selectRoutesToDisplay')}</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedRoutes([])}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedRoutes.length === 0
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('routeMap.showAllRoutes')}
          </button>
          {predefinedRoutes.map(route => (
            <button
              key={route.id}
              onClick={() => toggleRoute(route.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedRoutes.includes(route.id) || selectedRoutes.length === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              {route.name} ({route.country})
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Draw routes */}
          {visibleRoutes.map(route => (
            <React.Fragment key={route.id}>
              {/* Route polyline */}
              <Polyline
                positions={route.points}
                pathOptions={{
                  color: route.color,
                  weight: 4,
                  opacity: 0.7
                }}
              />
              
              {/* Start marker */}
              {route.points.length > 0 && (
                <Marker
                  position={route.points[0]}
                  icon={L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{route.name}</div>
                      <div>{t('routeMap.country')}: {route.country}</div>
                      <div>{t('routeMap.distance')}: {route.distance} km</div>
                      {route.horses && <div>{t('routeMap.totalHorsesOnRoute')}: {route.horses.length}</div>}
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Center marker with route info */}
              <CircleMarker
                center={route.center}
                radius={8}
                pathOptions={{
                  fillColor: route.color,
                  fillOpacity: 0.8,
                  color: 'white',
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-red-600">{route.name}</div>
                    <div>{t('routeMap.country')}: {route.country}</div>
                    <div>{t('routeMap.distance')}: {route.distance} km</div>
                    {route.horses && (
                      <>
                        <div>{t('routeMap.totalHorsesOnRoute')}: {route.horses.length}</div>
                        <div>{t('routeMap.activeHorses')}: {route.horses.filter(h => h.status !== 'No connection').length}</div>
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
              
              {/* Moving horse markers (all horses on this route) */}
              {route.horses && route.horses.map(horse => {
                const positionKey = `${route.id}-${horse.id}`
                const position = horsePositions[positionKey]
                
                if (!position) return null
                
                return (
                  <Marker
                    key={`horse-${route.id}-${horse.id}-${position.currentIndex}`}
                    position={position.position}
                    icon={createHorseIcon(route.color)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold text-red-600">{horse.name}</div>
                        <div>{t('routeMap.route')}: {route.name}</div>
                        <div>{t('routeMap.country')}: {route.country}</div>
                        <div>{t('routeMap.status')}: {horse.status}</div>
                        <div>{t('routeMap.hr')}: {horse.currentHr || t('common.na')} {t('routeMap.bpm')}</div>
                        <div>{t('routeMap.speed')}: {horse.speed ? `${horse.speed.toFixed(1)} ${t('routeMap.kmh')}` : t('common.na')}</div>
                        <div>{t('routeMap.progress')}: {Math.round((position.currentIndex / route.points.length) * 100)}%</div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Route Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRoutes.map(route => {
          // Calculate average progress for all horses on this route
          const activeHorses = route.horses?.filter(h => h.status !== 'No connection' && h.status !== 'resting') || []
          let avgProgress = 0
          
          if (activeHorses.length > 0 && route.points && route.points.length > 0) {
            const totalProgress = activeHorses.reduce((sum, horse) => {
              const positionKey = `${route.id}-${horse.id}`
              const position = horsePositions[positionKey]
              if (position && typeof position.currentIndex === 'number') {
                return sum + (position.currentIndex / route.points.length) * 100
              }
              return sum
            }, 0)
            avgProgress = Math.round(totalProgress / activeHorses.length)
          }
          
          const isActive = activeHorses.length > 0
          
          return (
            <div key={route.id} className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderLeftColor: route.color }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{route.name}</h3>
                  <p className="text-sm text-gray-500">{route.country}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('routeMap.distance')}:</span>
                  <span className="font-semibold text-red-600">{route.distance} km</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('routeMap.country')}:</span>
                  <span className="font-medium">{route.country}</span>
                </div>
                
                {route.horses && route.horses.length > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('routeMap.totalHorsesOnRoute')}:</span>
                      <span className="font-medium text-red-600">{route.horses.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('routeMap.activeHorses')}:</span>
                      <span className="font-medium text-green-600">{activeHorses.length}</span>
                    </div>
                    
                    {/* Show Route Progress only for active routes */}
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 font-medium">{t('routeMap.avgRouteProgress')}:</span>
                          <span className="font-semibold text-red-600">{avgProgress}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${avgProgress}%`,
                              backgroundColor: route.color
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* List of horses on this route */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 mb-2">{t('routeMap.horsesOnRoute')}:</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {route.horses.slice(0, 10).map(horse => {
                          const positionKey = `${route.id}-${horse.id}`
                          const position = horsePositions[positionKey]
                          const horseProgress = position && route.points && route.points.length > 0
                            ? Math.round((position.currentIndex / route.points.length) * 100)
                            : 0
                          
                          return (
                            <div key={horse.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 truncate">{horse.name}</span>
                              <span className="text-gray-500 ml-2">{horseProgress}%</span>
                            </div>
                          )
                        })}
                        {route.horses.length > 10 && (
                          <div className="text-xs text-gray-500">+{route.horses.length - 10} {t('routeMap.more')}</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-2">
                    {t('routeMap.noHorsesAssigned')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RouteMap
