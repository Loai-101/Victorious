import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Track data structure
type Track = {
  id: string
  name: string
  country: string
  location: string
  type: 'main' | 'training'
  distance: string
  imageUrl: string
}

// Country tracks data
const COUNTRY_TRACKS: Record<string, { country: string; tracks: Track[] }> = {
  bahrain: {
    country: 'Bahrain',
    tracks: [
      // Main tracks
      {
        id: 'bahrain-zallaq-main-40km',
        name: 'Main Track 40km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'main',
        distance: '40km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769421967/WhatsApp_Image_2026-01-26_at_1.05.37_PM_tkqgrf.jpg'
      },
      {
        id: 'bahrain-zallaq-main-80km',
        name: 'Main Track 80km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'main',
        distance: '80km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422153/WhatsApp_Image_2026-01-26_at_1.07.55_PM_dtygap.jpg'
      },
      {
        id: 'bahrain-zallaq-main-100km',
        name: 'Main Track 100km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'main',
        distance: '100km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422221/WhatsApp_Image_2026-01-26_at_1.09.42_PM_dk424p.jpg'
      },
      {
        id: 'bahrain-zallaq-main-120km',
        name: 'Main Track 120km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'main',
        distance: '120km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769419515/WhatsApp_Image_2026-01-26_at_12.19.33_PM_vyujie.jpg'
      },
      // Training tracks
      {
        id: 'bahrain-zallaq-training-10km',
        name: 'Training Track 10km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'training',
        distance: '10km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422526/WhatsApp_Image_2026-01-26_at_1.14.38_PM_kp77k6.jpg'
      },
      {
        id: 'bahrain-zallaq-training-20km',
        name: 'Training Track 20km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'training',
        distance: '20km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422597/WhatsApp_Image_2026-01-26_at_1.16.07_PM_xjadkf.jpg'
      },
      {
        id: 'bahrain-zallaq-training-40km',
        name: 'Training Track 40km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'training',
        distance: '40km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769422644/WhatsApp_Image_2026-01-26_at_1.16.48_PM_na9fou.jpg'
      },
      {
        id: 'bahrain-zallaq-training-60km',
        name: 'Training Track 60km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'training',
        distance: '60km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769423110/WhatsApp_Image_2026-01-26_at_1.24.52_PM_kuwxrd.jpg'
      },
      {
        id: 'bahrain-zallaq-training-80km',
        name: 'Training Track 80km',
        country: 'Bahrain',
        location: 'Zallaq',
        type: 'training',
        distance: '80km',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769421967/WhatsApp_Image_2026-01-26_at_1.05.37_PM_tkqgrf.jpg'
      }
    ]
  },
  uae: {
    country: 'UAE',
    tracks: [
      // Main tracks
      {
        id: 'uae-al-wathba-abu-dhabi',
        name: 'Al Wathba',
        country: 'UAE',
        location: 'Abu Dhabi',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425207/WhatsApp_Image_2026-01-26_at_1.59.34_PM_vl5hog.jpg'
      },
      {
        id: 'uae-meydan-racecourse-dubai',
        name: 'Meydan Racecourse',
        country: 'UAE',
        location: 'Dubai',
        type: 'main',
        distance: 'Racecourse',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.36.07_PM_nsdvzd.jpg'
      },
      {
        id: 'uae-al-marmoom-reserve-dubai',
        name: 'Al Marmoom Reserve',
        country: 'UAE',
        location: 'Dubai',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425697/WhatsApp_Image_2026-01-26_at_2.07.29_PM_ycovud.jpg'
      },
      {
        id: 'uae-al-wagan-abu-dhabi',
        name: 'Al Wagan',
        country: 'UAE',
        location: 'Abu Dhabi',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425813/WhatsApp_Image_2026-01-26_at_2.09.52_PM_mg9j44.jpg'
      },
      {
        id: 'uae-al-ruwais-endurance-abu-dhabi',
        name: 'Al Ruwais Endurance Track',
        country: 'UAE',
        location: 'Abu Dhabi Region',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425939/WhatsApp_Image_2026-01-26_at_2.10.57_PM_n1pxuk.jpg'
      },
      {
        id: 'uae-khayrat-endurance-sharjah',
        name: 'Khayrat Endurance Track',
        country: 'UAE',
        location: 'Sharjah Region',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425994/WhatsApp_Image_2026-01-26_at_2.12.42_PM_pxdcva.jpg'
      }
    ]
  },
  ksa: {
    country: 'KSA',
    tracks: [
      // Main tracks
      {
        id: 'ksa-al-ula-endurance',
        name: 'Al Ula Endurance Track',
        country: 'KSA',
        location: 'Al Ula',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425939/WhatsApp_Image_2026-01-26_at_2.10.57_PM_n1pxuk.jpg'
      },
      {
        id: 'ksa-neom-endurance-routes',
        name: 'NEOM Endurance Routes',
        country: 'KSA',
        location: 'NEOM',
        type: 'main',
        distance: 'Endurance Routes',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425994/WhatsApp_Image_2026-01-26_at_2.12.42_PM_pxdcva.jpg'
      },
      {
        id: 'ksa-kaec-endurance-course',
        name: 'King Abdullah Economic City (KAEC) Endurance Course',
        country: 'KSA',
        location: 'King Abdullah Economic City',
        type: 'main',
        distance: 'Endurance Course',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425813/WhatsApp_Image_2026-01-26_at_2.09.52_PM_mg9j44.jpg'
      },
      {
        id: 'ksa-riyadh-desert-endurance',
        name: 'Riyadh Desert Endurance Tracks',
        country: 'KSA',
        location: 'Riyadh',
        type: 'main',
        distance: 'Endurance Tracks',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769423073/WhatsApp_Image_2026-01-26_at_1.16.48_PM_cclvxe.jpg'
      },
      {
        id: 'ksa-tabuk-desert-endurance',
        name: 'Tabuk Desert Endurance Routes',
        country: 'KSA',
        location: 'Tabuk',
        type: 'main',
        distance: 'Endurance Routes',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425939/WhatsApp_Image_2026-01-26_at_2.10.57_PM_n1pxuk.jpg'
      },
      {
        id: 'ksa-jeddah-endurance-red-sea',
        name: 'Jeddah Endurance Riding Areas (Red Sea Coast)',
        country: 'KSA',
        location: 'Jeddah',
        type: 'main',
        distance: 'Endurance Riding Areas',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425994/WhatsApp_Image_2026-01-26_at_2.12.42_PM_pxdcva.jpg'
      },
      {
        id: 'ksa-eastern-province-desert-endurance',
        name: 'Eastern Province Desert Endurance Tracks',
        country: 'KSA',
        location: 'Eastern Province',
        type: 'main',
        distance: 'Endurance Tracks',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769425207/WhatsApp_Image_2026-01-26_at_1.59.34_PM_vl5hog.jpg'
      }
    ]
  },
  france: {
    country: 'France',
    tracks: [
      {
        id: 'france-fontainebleau-endurance-venue',
        name: 'Fontainebleau Endurance Venue',
        country: 'France',
        location: 'Fontainebleau',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
      },
      {
        id: 'france-saumur-endurance-training-area',
        name: 'Saumur Endurance Training Area',
        country: 'France',
        location: 'Saumur',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
      }
    ]
  },
  italy: {
    country: 'Italy',
    tracks: [
      {
        id: 'italy-pisa-san-rossore-endurance-village',
        name: 'Pisa – San Rossore Endurance Village',
        country: 'Italy',
        location: 'Pisa',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
      }
    ]
  },
  spain: {
    country: 'Spain',
    tracks: [
      {
        id: 'spain-jerez-de-la-frontera-endurance-routes',
        name: 'Jerez de la Frontera Endurance Routes',
        country: 'Spain',
        location: 'Jerez de la Frontera',
        type: 'main',
        distance: 'Endurance Routes',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
      }
    ]
  },
  hungary: {
    country: 'Hungary',
    tracks: [
      {
        id: 'hungary-babolna-endurance-village',
        name: 'Bábolna Endurance Village',
        country: 'Hungary',
        location: 'Bábolna',
        type: 'main',
        distance: 'Endurance Track',
        imageUrl: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1769420843/WhatsApp_Image_2026-01-26_at_12.35.30_PM_jabtkr.jpg'
      }
    ]
  },
  portugal: {
    country: 'Portugal',
    tracks: [
      // Portugal tracks will be added when images are provided
    ]
  }
}

// Country Cards Component
const CountryCard = ({ country, flag, onClick }: { country: string; flag: string; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all hover:border-red-500 hover:-translate-y-1"
    >
      <div className="flex items-center gap-4">
        <div className="text-5xl">{flag}</div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{country}</h3>
          <p className="text-sm text-gray-500 mt-1">Click to view tracks</p>
        </div>
      </div>
      <div className="mt-4 flex items-center text-red-600 font-medium text-sm">
        <span>View Tracks</span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}

// Country Tracks Modal Component
const CountryTracksModal = ({ 
  isOpen, 
  onClose, 
  country, 
  tracks, 
  onTrackSelect 
}: { 
  isOpen: boolean
  onClose: () => void
  country: string
  tracks: Track[]
  onTrackSelect: (track: Track) => void
}) => {
  if (!isOpen) return null

  const mainTracks = tracks.filter(t => t.type === 'main')
  const trainingTracks = tracks.filter(t => t.type === 'training')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">{country} Tracks</h3>
            <p className="text-sm text-red-100 mt-1">{tracks.length} tracks available</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tracks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tracks available for {country} yet.</p>
            </div>
          ) : (
            <>
              {/* Main Tracks Section */}
              {mainTracks.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded"></span>
                Main Tracks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mainTracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => onTrackSelect(track)}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-500 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{track.location}</div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3">{track.name}</h5>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">{track.distance}</span>
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training Tracks Section */}
          {trainingTracks.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Training Tracks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {trainingTracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => onTrackSelect(track)}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{track.location}</div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3">{track.name}</h5>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{track.distance}</span>
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const TracksList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [activeTracks, setActiveTracks] = useState<Set<string>>(new Set())
  const [trackActivity, setTrackActivity] = useState<Record<string, { horses: number; avgSpeed: number; avgHeartRate: number }>>({})

  const countries = [
    { id: 'bahrain', name: 'Bahrain', flag: '🇧🇭' },
    { id: 'uae', name: 'UAE', flag: '🇦🇪' },
    { id: 'ksa', name: 'KSA', flag: '🇸🇦' },
    { id: 'france', name: 'France', flag: '🇫🇷' },
    { id: 'italy', name: 'Italy', flag: '🇮🇹' },
    { id: 'spain', name: 'Spain', flag: '🇪🇸' },
    { id: 'hungary', name: 'Hungary', flag: '🇭🇺' },
    { id: 'portugal', name: 'Portugal', flag: '🇵🇹' }
  ]

  // Calculate statistics
  const stats = useMemo(() => {
    const allTracks: Track[] = []
    Object.values(COUNTRY_TRACKS).forEach(countryData => {
      allTracks.push(...countryData.tracks)
    })

    const countriesWithTracks = Object.values(COUNTRY_TRACKS).filter(c => c.tracks.length > 0).length
    const activeTracksCount = activeTracks.size
    const totalHorses = Object.values(trackActivity).reduce((sum, activity) => sum + activity.horses, 0)

    return {
      totalTracks: allTracks.length,
      activeTracks: activeTracksCount,
      countriesWithTracks,
      totalHorses,
      mainTracks: allTracks.filter(t => t.type === 'main').length,
      trainingTracks: allTracks.filter(t => t.type === 'training').length
    }
  }, [activeTracks, trackActivity])

  // Simulate track activity updates
  useEffect(() => {
    const allTracks: Track[] = []
    Object.values(COUNTRY_TRACKS).forEach(countryData => {
      allTracks.push(...countryData.tracks)
    })

    // Randomly activate some tracks (30-50% of tracks)
    const activateRandomTracks = () => {
      const numActive = Math.floor(allTracks.length * (0.3 + Math.random() * 0.2))
      const shuffled = [...allTracks].sort(() => 0.5 - Math.random())
      const newActiveTracks = new Set(shuffled.slice(0, numActive).map(t => t.id))
      setActiveTracks(newActiveTracks)

      // Generate activity data for active tracks
      const newActivity: Record<string, { horses: number; avgSpeed: number; avgHeartRate: number }> = {}
      newActiveTracks.forEach(trackId => {
        newActivity[trackId] = {
          horses: Math.floor(Math.random() * 8) + 2, // 2-10 horses
          avgSpeed: Math.round((15 + Math.random() * 13) * 10) / 10, // 15-28 km/h
          avgHeartRate: Math.floor(55 + Math.random() * 30) // 55-85 bpm
        }
      })
      setTrackActivity(newActivity)
    }

    activateRandomTracks()
    const interval = setInterval(activateRandomTracks, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Get active tracks with activity data
  const activeTracksList = useMemo(() => {
    const allTracks: Track[] = []
    Object.values(COUNTRY_TRACKS).forEach(countryData => {
      allTracks.push(...countryData.tracks)
    })

    return allTracks
      .filter(track => activeTracks.has(track.id))
      .map(track => ({
        ...track,
        activity: trackActivity[track.id] || { horses: 0, avgSpeed: 0, avgHeartRate: 0 }
      }))
      .sort((a, b) => b.activity.horses - a.activity.horses) // Sort by number of horses
  }, [activeTracks, trackActivity])

  const handleCountryClick = (countryId: string) => {
    setSelectedCountry(countryId)
  }

  const handleTrackSelect = (track: Track) => {
    // Navigate to track detail page with track data
    navigate(`/dashboard/track-live/${track.id}`, { 
      state: { track } 
    })
    setSelectedCountry(null) // Close modal
  }

  const selectedCountryData = selectedCountry ? COUNTRY_TRACKS[selectedCountry] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold mb-2">Track Live Dashboard</h1>
          <p className="text-red-100">Monitor track activity and select tracks to view live tracking</p>
        </div>
      </div>

      <div className="space-y-6">
          {/* Dashboard Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tracks Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Tracks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTracks}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.mainTracks} main • {stats.trainingTracks} training</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Tracks Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Tracks</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeTracks}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-gray-400">Live tracking</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Horses Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Horses on Tracks</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalHorses}</p>
                  <p className="text-xs text-gray-400 mt-1">Across all active tracks</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Countries Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Countries</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.countriesWithTracks}</p>
                  <p className="text-xs text-gray-400 mt-1">With available tracks</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Tracks Section */}
          {activeTracksList.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <h2 className="text-xl font-bold text-gray-900">Active Tracks</h2>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {activeTracksList.length} active
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeTracksList.map(track => (
                    <div
                      key={track.id}
                      onClick={() => handleTrackSelect(track)}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{track.location}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{track.name}</h3>
                          <p className="text-sm text-gray-600">{track.country}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          LIVE
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Horses</p>
                          <p className="text-lg font-bold text-gray-900">{track.activity.horses}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Avg Speed</p>
                          <p className="text-lg font-bold text-green-600">{track.activity.avgSpeed} km/h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Avg HR</p>
                          <p className="text-lg font-bold text-red-600">{track.activity.avgHeartRate} bpm</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          {track.distance}
                        </span>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Tracks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">All Tracks by Country</h2>
              <p className="text-sm text-gray-500 mt-1">Select a country to view all available tracks</p>
            </div>
            <div className="p-6">
              {/* Country Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {countries.map(country => (
                  <CountryCard
                    key={country.id}
                    country={country.name}
                    flag={country.flag}
                    onClick={() => handleCountryClick(country.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Country Tracks Modal */}
          {selectedCountryData && (
            <CountryTracksModal
              isOpen={!!selectedCountry}
              onClose={() => setSelectedCountry(null)}
              country={selectedCountryData.country}
              tracks={selectedCountryData.tracks}
              onTrackSelect={handleTrackSelect}
            />
          )}
        </div>
      </div>
  )
}

export default TracksList
