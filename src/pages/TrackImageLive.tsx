import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Track data - should match TracksList
const TRACKS_DATA: Record<string, any> = {
  'bahrain-zallaq-main-40km': {
    id: 'bahrain-zallaq-main-40km',
    name: 'Main Track 40km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'main',
    distance: '40km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769421967/WhatsApp_Image_2026-01-26_at_1.05.37_PM_tkqgrf.jpg'
  },
  'bahrain-zallaq-main-80km': {
    id: 'bahrain-zallaq-main-80km',
    name: 'Main Track 80km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'main',
    distance: '80km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422153/WhatsApp_Image_2026-01-26_at_1.07.55_PM_dtygap.jpg'
  },
  'bahrain-zallaq-main-100km': {
    id: 'bahrain-zallaq-main-100km',
    name: 'Main Track 100km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'main',
    distance: '100km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422221/WhatsApp_Image_2026-01-26_at_1.09.42_PM_dk424p.jpg'
  },
  'bahrain-zallaq-main-120km': {
    id: 'bahrain-zallaq-main-120km',
    name: 'Main Track 120km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'main',
    distance: '120km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769419515/WhatsApp_Image_2026-01-26_at_12.19.33_PM_vyujie.jpg'
  },
  'bahrain-zallaq-training-10km': {
    id: 'bahrain-zallaq-training-10km',
    name: 'Training Track 10km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'training',
    distance: '10km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422526/WhatsApp_Image_2026-01-26_at_1.14.38_PM_kp77k6.jpg'
  },
  'bahrain-zallaq-training-20km': {
    id: 'bahrain-zallaq-training-20km',
    name: 'Training Track 20km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'training',
    distance: '20km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422597/WhatsApp_Image_2026-01-26_at_1.16.07_PM_xjadkf.jpg'
  },
  'bahrain-zallaq-training-40km': {
    id: 'bahrain-zallaq-training-40km',
    name: 'Training Track 40km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'training',
    distance: '40km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422644/WhatsApp_Image_2026-01-26_at_1.16.48_PM_na9fou.jpg'
  },
  'bahrain-zallaq-training-60km': {
    id: 'bahrain-zallaq-training-60km',
    name: 'Training Track 60km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'training',
    distance: '60km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769423110/WhatsApp_Image_2026-01-26_at_1.24.52_PM_kuwxrd.jpg'
  },
  'bahrain-zallaq-training-80km': {
    id: 'bahrain-zallaq-training-80km',
    name: 'Training Track 80km',
    country: 'Bahrain',
    location: 'Zallaq',
    type: 'training',
    distance: '80km',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769421967/WhatsApp_Image_2026-01-26_at_1.05.37_PM_tkqgrf.jpg'
  },
  'uae-al-wathba-abu-dhabi': {
    id: 'uae-al-wathba-abu-dhabi',
    name: 'Al Wathba',
    country: 'UAE',
    location: 'Abu Dhabi',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425207/WhatsApp_Image_2026-01-26_at_1.59.34_PM_vl5hog.jpg'
  },
  'uae-meydan-racecourse-dubai': {
    id: 'uae-meydan-racecourse-dubai',
    name: 'Meydan Racecourse',
    country: 'UAE',
    location: 'Dubai',
    type: 'main',
    distance: 'Racecourse',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.36.07_PM_nsdvzd.jpg'
  },
  'uae-al-marmoom-reserve-dubai': {
    id: 'uae-al-marmoom-reserve-dubai',
    name: 'Al Marmoom Reserve',
    country: 'UAE',
    location: 'Dubai',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425697/WhatsApp_Image_2026-01-26_at_2.07.29_PM_ycovud.jpg'
  },
  'uae-al-wagan-abu-dhabi': {
    id: 'uae-al-wagan-abu-dhabi',
    name: 'Al Wagan',
    country: 'UAE',
    location: 'Abu Dhabi',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425813/WhatsApp_Image_2026-01-26_at_2.09.52_PM_mg9j44.jpg'
  },
  'uae-al-ruwais-endurance-abu-dhabi': {
    id: 'uae-al-ruwais-endurance-abu-dhabi',
    name: 'Al Ruwais Endurance Track',
    country: 'UAE',
    location: 'Abu Dhabi Region',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425939/WhatsApp_Image_2026-01-26_at_2.10.57_PM_n1pxuk.jpg'
  },
  'uae-khayrat-endurance-sharjah': {
    id: 'uae-khayrat-endurance-sharjah',
    name: 'Khayrat Endurance Track',
    country: 'UAE',
    location: 'Sharjah Region',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425994/WhatsApp_Image_2026-01-26_at_2.12.42_PM_pxdcva.jpg'
  },
  'ksa-al-ula-endurance': {
    id: 'ksa-al-ula-endurance',
    name: 'Al Ula Endurance Track',
    country: 'KSA',
    location: 'Al Ula',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425939/WhatsApp_Image_2026-01-26_at_2.10.57_PM_n1pxuk.jpg'
  },
  'ksa-neom-endurance-routes': {
    id: 'ksa-neom-endurance-routes',
    name: 'NEOM Endurance Routes',
    country: 'KSA',
    location: 'NEOM',
    type: 'main',
    distance: 'Endurance Routes',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425994/WhatsApp_Image_2026-01-26_at_2.12.42_PM_pxdcva.jpg'
  },
  'ksa-kaec-endurance-course': {
    id: 'ksa-kaec-endurance-course',
    name: 'King Abdullah Economic City (KAEC) Endurance Course',
    country: 'KSA',
    location: 'King Abdullah Economic City',
    type: 'main',
    distance: 'Endurance Course',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425813/WhatsApp_Image_2026-01-26_at_2.09.52_PM_mg9j44.jpg'
  },
  'ksa-riyadh-desert-endurance': {
    id: 'ksa-riyadh-desert-endurance',
    name: 'Riyadh Desert Endurance Tracks',
    country: 'KSA',
    location: 'Riyadh',
    type: 'main',
    distance: 'Endurance Tracks',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769423073/WhatsApp_Image_2026-01-26_at_1.16.48_PM_cclvxe.jpg'
  },
  'ksa-tabuk-desert-endurance': {
    id: 'ksa-tabuk-desert-endurance',
    name: 'Tabuk Desert Endurance Routes',
    country: 'KSA',
    location: 'Tabuk',
    type: 'main',
    distance: 'Endurance Routes',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425939/WhatsApp_Image_2026-01-26_at_2.10.57_PM_n1pxuk.jpg'
  },
  'ksa-jeddah-endurance-red-sea': {
    id: 'ksa-jeddah-endurance-red-sea',
    name: 'Jeddah Endurance Riding Areas (Red Sea Coast)',
    country: 'KSA',
    location: 'Jeddah',
    type: 'main',
    distance: 'Endurance Riding Areas',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425994/WhatsApp_Image_2026-01-26_at_2.12.42_PM_pxdcva.jpg'
  },
  'ksa-eastern-province-desert-endurance': {
    id: 'ksa-eastern-province-desert-endurance',
    name: 'Eastern Province Desert Endurance Tracks',
    country: 'KSA',
    location: 'Eastern Province',
    type: 'main',
    distance: 'Endurance Tracks',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425207/WhatsApp_Image_2026-01-26_at_1.59.34_PM_vl5hog.jpg'
  },
  'france-fontainebleau-endurance-venue': {
    id: 'france-fontainebleau-endurance-venue',
    name: 'Fontainebleau Endurance Venue',
    country: 'France',
    location: 'Fontainebleau',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
  },
  'france-saumur-endurance-training-area': {
    id: 'france-saumur-endurance-training-area',
    name: 'Saumur Endurance Training Area',
    country: 'France',
    location: 'Saumur',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
  },
  'italy-pisa-san-rossore-endurance-village': {
    id: 'italy-pisa-san-rossore-endurance-village',
    name: 'Pisa – San Rossore Endurance Village',
    country: 'Italy',
    location: 'Pisa',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
  },
  'spain-jerez-de-la-frontera-endurance-routes': {
    id: 'spain-jerez-de-la-frontera-endurance-routes',
    name: 'Jerez de la Frontera Endurance Routes',
    country: 'Spain',
    location: 'Jerez de la Frontera',
    type: 'main',
    distance: 'Endurance Routes',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
  },
  'hungary-babolna-endurance-village': {
    id: 'hungary-babolna-endurance-village',
    name: 'Bábolna Endurance Village',
    country: 'Hungary',
    location: 'Bábolna',
    type: 'main',
    distance: 'Endurance Track',
    imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
  }
}

// Color groups
const COLOR_GROUPS = {
  blue: '#2563eb',
  yellow: '#ca8a04',
  red: '#dc2626'
}

// Predefined paths (normalized coordinates 0-1)
const bluePath: { x: number; y: number }[] = [
  { x: 0.12, y: 0.15 }, { x: 0.12, y: 0.20 }, { x: 0.13, y: 0.25 },
  { x: 0.15, y: 0.30 }, { x: 0.18, y: 0.35 }, { x: 0.22, y: 0.38 },
  { x: 0.28, y: 0.40 }, { x: 0.35, y: 0.42 }, { x: 0.42, y: 0.43 },
  { x: 0.50, y: 0.44 }, { x: 0.58, y: 0.45 }, { x: 0.65, y: 0.48 },
  { x: 0.70, y: 0.52 }, { x: 0.72, y: 0.58 }, { x: 0.72, y: 0.65 },
  { x: 0.70, y: 0.72 }, { x: 0.65, y: 0.78 }, { x: 0.58, y: 0.82 },
  { x: 0.50, y: 0.84 }, { x: 0.42, y: 0.85 }, { x: 0.35, y: 0.86 },
  { x: 0.28, y: 0.88 }, { x: 0.22, y: 0.90 }, { x: 0.18, y: 0.88 },
  { x: 0.15, y: 0.85 }, { x: 0.13, y: 0.80 }, { x: 0.12, y: 0.75 },
  { x: 0.12, y: 0.70 }, { x: 0.12, y: 0.65 }, { x: 0.12, y: 0.60 },
  { x: 0.12, y: 0.55 }, { x: 0.12, y: 0.50 }, { x: 0.12, y: 0.45 },
  { x: 0.12, y: 0.40 }, { x: 0.12, y: 0.35 }, { x: 0.12, y: 0.30 },
  { x: 0.12, y: 0.25 }, { x: 0.12, y: 0.20 }, { x: 0.12, y: 0.15 }
]

const yellowPath: { x: number; y: number }[] = [
  { x: 0.35, y: 0.20 }, { x: 0.36, y: 0.25 }, { x: 0.37, y: 0.30 },
  { x: 0.38, y: 0.35 }, { x: 0.40, y: 0.40 }, { x: 0.42, y: 0.45 },
  { x: 0.45, y: 0.50 }, { x: 0.48, y: 0.55 }, { x: 0.52, y: 0.60 },
  { x: 0.56, y: 0.65 }, { x: 0.60, y: 0.70 }, { x: 0.64, y: 0.75 },
  { x: 0.68, y: 0.80 }, { x: 0.70, y: 0.82 }, { x: 0.72, y: 0.84 },
  { x: 0.74, y: 0.85 }, { x: 0.76, y: 0.84 }, { x: 0.78, y: 0.82 },
  { x: 0.80, y: 0.78 }, { x: 0.82, y: 0.72 }, { x: 0.82, y: 0.65 },
  { x: 0.80, y: 0.58 }, { x: 0.76, y: 0.52 }, { x: 0.70, y: 0.48 },
  { x: 0.64, y: 0.45 }, { x: 0.58, y: 0.42 }, { x: 0.52, y: 0.40 },
  { x: 0.46, y: 0.38 }, { x: 0.40, y: 0.35 }, { x: 0.37, y: 0.30 },
  { x: 0.35, y: 0.25 }, { x: 0.35, y: 0.20 }
]

const redPath: { x: number; y: number }[] = [
  { x: 0.50, y: 0.25 }, { x: 0.51, y: 0.30 }, { x: 0.52, y: 0.35 },
  { x: 0.54, y: 0.40 }, { x: 0.56, y: 0.45 }, { x: 0.58, y: 0.50 },
  { x: 0.60, y: 0.55 }, { x: 0.62, y: 0.60 }, { x: 0.64, y: 0.65 },
  { x: 0.66, y: 0.70 }, { x: 0.68, y: 0.75 }, { x: 0.70, y: 0.78 },
  { x: 0.72, y: 0.80 }, { x: 0.74, y: 0.81 }, { x: 0.76, y: 0.80 },
  { x: 0.78, y: 0.78 }, { x: 0.80, y: 0.74 }, { x: 0.81, y: 0.68 },
  { x: 0.80, y: 0.62 }, { x: 0.78, y: 0.56 }, { x: 0.74, y: 0.52 },
  { x: 0.70, y: 0.48 }, { x: 0.66, y: 0.45 }, { x: 0.62, y: 0.42 },
  { x: 0.58, y: 0.40 }, { x: 0.54, y: 0.38 }, { x: 0.52, y: 0.35 },
  { x: 0.51, y: 0.30 }, { x: 0.50, y: 0.25 }
]

// Horse data type
type Horse = {
  id: string
  name: string
  riderName: string
  colorGroup: 'blue' | 'yellow' | 'red'
  path: { x: number; y: number }[]
  pathIndex: number
  speedKmh: number
  heartRateBpm: number
  isPopupOpen: boolean
}

// Determine gait based on speed
const getGait = (speedKmh: number): { name: string; color: string; bgColor: string; borderColor: string } => {
  if (speedKmh < 8) {
    return { name: 'Walk', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' }
  } else if (speedKmh < 20) {
    return { name: 'Trot', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' }
  } else {
    return { name: 'Canter', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' }
  }
}

// Calculate track completion percentage
const getTrackCompletion = (pathIndex: number, pathLength: number): number => {
  return Math.round((pathIndex / pathLength) * 100)
}

const TrackImageLive = () => {
  const { t } = useTranslation()
  const { trackId } = useParams<{ trackId?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [updateCounter, setUpdateCounter] = useState(0) // Force re-render counter
  
  // Get track data from location state, trackId lookup, or default
  const track = (location.state as any)?.track || 
    (trackId && TRACKS_DATA[trackId]) ||
    {
      id: trackId || 'default',
      name: 'Track',
      imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769419515/WhatsApp_Image_2026-01-26_at_12.19.33_PM_vyujie.jpg',
      country: 'Bahrain',
      location: 'Zallaq'
    }
  
  // Initialize 6 horses (2 per color)
  const [horses, setHorses] = useState<Horse[]>(() => {
    const horseNames = [
      { name: 'Ticonderoga', rider: 'Ahmed Ali' },
      { name: 'Thunder', rider: 'Mohammed Hassan' },
      { name: 'Lightning', rider: 'Fatima Al-Mansoori' },
      { name: 'Storm', rider: 'Khalid Al-Khalifa' },
      { name: 'Blaze', rider: 'Sarah Al-Dosari' },
      { name: 'Phoenix', rider: 'Omar Al-Sabah' }
    ]
    
    return [
      {
        id: 'blue-1',
        name: horseNames[0].name,
        riderName: horseNames[0].rider,
        colorGroup: 'blue' as const,
        path: bluePath,
        pathIndex: 0,
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      },
      {
        id: 'blue-2',
        name: horseNames[1].name,
        riderName: horseNames[1].rider,
        colorGroup: 'blue' as const,
        path: bluePath,
        pathIndex: Math.floor(bluePath.length / 2),
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      },
      {
        id: 'yellow-1',
        name: horseNames[2].name,
        riderName: horseNames[2].rider,
        colorGroup: 'yellow' as const,
        path: yellowPath,
        pathIndex: 0,
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      },
      {
        id: 'yellow-2',
        name: horseNames[3].name,
        riderName: horseNames[3].rider,
        colorGroup: 'yellow' as const,
        path: yellowPath,
        pathIndex: Math.floor(yellowPath.length / 2),
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      },
      {
        id: 'red-1',
        name: horseNames[4].name,
        riderName: horseNames[4].rider,
        colorGroup: 'red' as const,
        path: redPath,
        pathIndex: 0,
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      },
      {
        id: 'red-2',
        name: horseNames[5].name,
        riderName: horseNames[5].rider,
        colorGroup: 'red' as const,
        path: redPath,
        pathIndex: Math.floor(redPath.length / 2),
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      }
    ]
  })
  
  // Update container size on resize and image load
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        })
      }
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    
    const img = new Image()
    img.onload = updateSize
    img.src = track.imageUrl
    
    return () => window.removeEventListener('resize', updateSize)
  }, [track.imageUrl])
  
  // Live tracking animation - updates speed and heart rate every 2 seconds
  useEffect(() => {
    if (!isTracking || isPaused) return
    
    // Update metrics every 2 seconds with noticeable up/down variations
    const metricsInterval = setInterval(() => {
      setHorses(prevHorses => {
        return prevHorses.map(horse => {
          // Speed: vary between 12-28 km/h with larger changes (up to ±5 km/h)
          const speedVariation = (Math.random() - 0.5) * 10 // Larger variation for visible changes
          const newSpeed = Math.max(12, Math.min(28, horse.speedKmh + speedVariation))
          
          // Heart Rate: vary between 55-85 bpm with larger changes (up to ±8 bpm)
          const hrVariation = Math.floor((Math.random() - 0.5) * 16) // Larger variation for visible changes
          const newHeartRate = Math.max(55, Math.min(85, horse.heartRateBpm + hrVariation))
          
          return {
            ...horse,
            speedKmh: newSpeed,
            heartRateBpm: newHeartRate
          }
        })
      })
      // Force re-render by updating counter
      setUpdateCounter(prev => prev + 1)
    }, 2000) // Update every 2 seconds
    
    // Update position less frequently (every 3 seconds) to keep movement smooth
    const positionInterval = setInterval(() => {
      setHorses(prevHorses => {
        return prevHorses.map(horse => {
          const path = horse.path
          const currentIndex = horse.pathIndex
          const validCurrentIndex = Math.max(0, Math.min(currentIndex, path.length - 1))
          const nextIndex = (validCurrentIndex + 1) % path.length
          
          return {
            ...horse,
            pathIndex: nextIndex
          }
        })
      })
    }, 3000) // Update position every 3 seconds
    
    return () => {
      clearInterval(metricsInterval)
      clearInterval(positionInterval)
    }
  }, [isTracking, isPaused])
  
  const handleStart = () => {
    setIsTracking(true)
    setIsPaused(false)
  }
  
  const handlePause = () => {
    setIsPaused(!isPaused)
  }
  
  const handleReset = () => {
    setIsTracking(false)
    setIsPaused(false)
    setHorses(prevHorses => prevHorses.map(horse => {
      const midPoint = Math.floor(horse.path.length / 2)
      const startIndex = horse.id.includes('-2') ? midPoint : 0
      const validIndex = Math.max(0, Math.min(startIndex, horse.path.length - 1))
      return {
        ...horse,
        pathIndex: validIndex,
        speedKmh: 15 + Math.random() * 10,
        heartRateBpm: 55 + Math.floor(Math.random() * 25),
        isPopupOpen: false
      }
    }))
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Track Info */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/track-live')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tracks
            </button>
            <div className="h-6 w-px bg-white/30"></div>
            <div>
              <h2 className="text-2xl font-bold">{track.name}</h2>
              <p className="text-sm text-red-100">{track.location}, {track.country}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Controls Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleStart}
              disabled={isTracking && !isPaused}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start Tracking
            </button>
            <button
              onClick={handlePause}
              disabled={!isTracking}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {isPaused ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pause
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014 13a1 1 0 110 2 7.002 7.002 0 01-6.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Track Image Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ minHeight: '500px', backgroundColor: '#f9fafb' }}
          >
            <img
              src={track.imageUrl}
              alt={track.name}
              className="absolute inset-0 w-full h-full"
              style={{ 
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              onLoad={() => {
                if (containerRef.current) {
                  setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                  })
                }
              }}
            />
          </div>
        </div>

        {/* Horses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Horses on Track</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rider</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Speed (km/h)</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Gait</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Heart Rate (bpm)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Track Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {horses.map(horse => {
                    const gait = getGait(horse.speedKmh)
                    const completion = getTrackCompletion(horse.pathIndex, horse.path.length)
                    
                    return (
                      <tr key={`${horse.id}-${updateCounter}`} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{horse.name}</td>
                        <td className="py-4 px-4 text-gray-600">{horse.riderName}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center gap-2 font-semibold text-green-600 transition-all duration-300">
                            {isTracking && !isPaused && (
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            )}
                            {horse.speedKmh.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${gait.bgColor} ${gait.color} border ${gait.borderColor}`}>
                            {gait.name}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center gap-2 font-semibold text-red-600 transition-all duration-300">
                            {isTracking && !isPaused && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                            {horse.heartRateBpm}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 transition-all duration-500 ease-out"
                                style={{ width: `${completion}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                              {completion}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackImageLive
