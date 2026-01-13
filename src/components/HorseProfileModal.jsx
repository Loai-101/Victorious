import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'

const DEFAULT_HORSE_IMAGE = 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg'

// Move getStatusBadge outside component - it's a pure function that doesn't need component scope
const getStatusBadge = (status) => {
  // Ensure status is a string
  const statusStr = String(status || '')
  const statusLower = statusStr.toLowerCase()
  if (statusLower.includes('active') || statusLower.includes('fit') || statusLower.includes('clear') || statusLower.includes('valid') || statusLower === 'yes') {
    return 'bg-green-100 text-green-800'
  }
  if (statusLower.includes('inactive') || statusLower.includes('pending')) {
    return 'bg-yellow-100 text-yellow-800'
  }
  return 'bg-gray-100 text-gray-800'
}

const HorseProfileModal = ({ isOpen, onClose, horse }) => {
  // Initialize with default - will be set from snapshot in useEffect
  const [horseImage, setHorseImage] = useState(DEFAULT_HORSE_IMAGE)
  const [openSections, setOpenSections] = useState({
    identification: false,
    ownership: false,
    veterinary: false,
    competition: false,
    performance: false,
    feeding: false,
    device: false,
    documents: false,
    metadata: false
  })
  const [fixedHorseDetails, setFixedHorseDetails] = useState(null)
  const fileInputRef = useRef(null)
  const lastHorseIdRef = useRef(null)
  const profileCacheRef = useRef(new Map()) // Cache profiles per horse ID
  const horseSnapshotRef = useRef(null) // Store complete snapshot of horse data - never changes

  // Capture ALL horse data and pre-calculate ALL details when modal opens to keep it fixed
  // Store in state so React knows it's fixed and won't recalculate
  // Use cache to ensure same horse always shows same data
  // COMPLETELY DISCONNECTED from live data updates
  useEffect(() => {
    // Only run when modal opens/closes or horse ID actually changes - NOT when sections toggle
    if (!isOpen || !horse) {
      if (!isOpen) {
        // Reset when modal closes (but keep cache for next time)
        setFixedHorseDetails(null)
        lastHorseIdRef.current = null
        horseSnapshotRef.current = null // Clear snapshot
        setOpenSections({
          identification: false,
          ownership: false,
          veterinary: false,
          competition: false,
          performance: false,
          feeding: false,
          device: false,
          documents: false,
          metadata: false
        })
      }
      return
    }

    const currentHorseId = horse.id
    
    // If we already have data for this horse ID, don't do anything (data is already fixed)
    if (lastHorseIdRef.current === currentHorseId && fixedHorseDetails && horseSnapshotRef.current) {
      return // Data already captured and fixed for this horse - completely isolated
    }
    
    // Check cache first - if we have this horse's profile cached, use it (don't recalculate)
    if (profileCacheRef.current.has(currentHorseId)) {
      const cachedProfile = profileCacheRef.current.get(currentHorseId)
      setFixedHorseDetails(cachedProfile)
      // Use cached snapshot if available, otherwise create one from current horse (but only once)
      if (!horseSnapshotRef.current || horseSnapshotRef.current.id !== currentHorseId) {
        // Create a deep snapshot of the horse data - this is the LAST time we read from live horse prop
        horseSnapshotRef.current = JSON.parse(JSON.stringify(horse))
      }
      setHorseImage(horseSnapshotRef.current?.profileImage || DEFAULT_HORSE_IMAGE)
      lastHorseIdRef.current = currentHorseId
      return // Exit early - use cached data, don't recalculate
    }
    
    // Only capture data if this is a new horse (horse ID changed) and not in cache
    if (lastHorseIdRef.current !== currentHorseId) {
        // Create a COMPLETE DEEP SNAPSHOT of horse data - this is the LAST time we read from live horse prop
        // After this, we NEVER read from the live horse prop again - only use the snapshot
        horseSnapshotRef.current = JSON.parse(JSON.stringify(horse))
        
        setHorseImage(horseSnapshotRef.current?.profileImage || DEFAULT_HORSE_IMAGE)
        
        // Capture a complete snapshot and pre-calculate ALL values ONCE
        // Use the snapshot data - NEVER read from live horse prop after this point
        const snapshot = horseSnapshotRef.current
        const profile = snapshot.profile || {}
        const pastRaces = snapshot.pastRaces || 6
        
        // Use actual profile values (already unique per horse from mockData)
        const successfulCompletions = profile.successfulCompletions ?? Math.floor(pastRaces * 0.83)
        const eliminations = profile.eliminations ?? Math.ceil(pastRaces * 0.17)
        
        // Capture live data values at this moment (fixed for this horse) - FROM SNAPSHOT, NOT LIVE PROP
        const avgHr = snapshot.avgHr ?? 78
        const maxHr = snapshot.maxHr ?? 168
        const speed = snapshot.speed ?? 19.2
        const battery = snapshot.battery ?? 82
        const status = snapshot.status
        const feedChangeDate = snapshot.feedChangeDate ? new Date(snapshot.feedChangeDate).toISOString().split('T')[0] : '2026-01-01'
        
        // Pre-calculate ALL horseDetails values once using UNIQUE profile data for this specific horse
        // Pre-format ALL strings so they're static and never recalculated
        // Each horse has unique profile data from mockData, so we use it directly (no fallbacks that make them the same)
        // USE SNAPSHOT DATA - NEVER READ FROM LIVE HORSE PROP
        const ageYears = `${snapshot.age} years`
        const ceiStarLevelFormatted = `${profile.ceiStarLevel || snapshot.stars || 2}★`
        const maxDistanceFormatted = `${profile.maxDistanceCompleted || snapshot.distanceCovered || 120} km`
        const eliminationsFormatted = `${eliminations} (Metabolic)`
        const requiredRestFormatted = `${profile.requiredRestPeriod || 14} days`
        const avgHrFormatted = `${avgHr} bpm`
        const maxHrFormatted = `${maxHr} bpm`
        const recovery5minFormatted = `${profile.recoveryTime5min || 64} bpm`
        const recovery10minFormatted = `${profile.recoveryTime10min || 58} bpm`
        const avgSpeedFormatted = `${speed.toFixed(1)} km/h`
        const maxSpeedFormatted = `${profile.maxSpeed || '28.4'} km/h`
        const batteryFormatted = `${battery}%`
        
        // Create horseDetails using ONLY snapshot data - completely disconnected from live updates
        const horseDetails = {
          feiHorseId: profile.feiHorseId || String(10000000 + snapshot.id),
          feiPassportNumber: profile.feiPassportNumber || `P${String(snapshot.id).padStart(7, '0')}`,
          horseName: snapshot.name,
          uelnNumber: profile.uelnNumber || `05600${String(snapshot.id).padStart(9, '0')}`,
          dateOfBirth: profile.dateOfBirth || '2016-03-12',
          age: snapshot.age,
          ageFormatted: ageYears,
          gender: profile.gender || 'Mare',
          breed: snapshot.breed,
          color: profile.color || 'Grey',
          countryOfBirth: profile.countryOfBirth || snapshot.country || 'FR',
          ownerName: profile.ownerName || 'Victorious Team',
          ownerFeiId: profile.ownerFeiId || '10270512',
          nationalFederation: profile.nationalFederation || 'Bahrain (BRN)',
          registrationStatus: profile.registrationStatus || 'Active',
          registrationValidFrom: profile.registrationValidFrom || '2024-01-01',
          registrationValidTo: profile.registrationValidTo || '2025-12-31',
          lastVetInspectionDate: profile.lastVetInspectionDate || '2026-01-10',
          veterinaryStatus: profile.veterinaryStatus || 'Fit',
          heartHealthStatus: profile.heartHealthStatus || 'Normal',
          lamenessStatus: profile.lamenessStatus || 'Clear',
          medicationControlStatus: profile.medicationControlStatus || 'Clear',
          antiDopingStatus: profile.antiDopingStatus || 'Clear',
          influenzaVaccination: profile.influenzaVaccination || 'Valid',
          medicalNotes: profile.medicalNotes || 'No issues',
          discipline: profile.discipline || 'Endurance',
          ceiStarLevel: profile.ceiStarLevel || snapshot.stars || 2,
          ceiStarLevelFormatted: ceiStarLevelFormatted,
          maxDistanceCompleted: profile.maxDistanceCompleted || snapshot.distanceCovered || 120,
          maxDistanceFormatted: maxDistanceFormatted,
          totalFeiRides: profile.totalFeiRides || pastRaces,
          successfulCompletions: successfulCompletions,
          eliminations: eliminations,
          eliminationsFormatted: eliminationsFormatted,
          lastCompetitionDate: profile.lastCompetitionDate || '2026-01-17',
          requiredRestPeriod: profile.requiredRestPeriod || 14,
          requiredRestFormatted: requiredRestFormatted,
          averageHeartRate: avgHr,
          averageHeartRateFormatted: avgHrFormatted,
          maxHeartRate: maxHr,
          maxHeartRateFormatted: maxHrFormatted,
          recoveryTime5min: profile.recoveryTime5min || 64,
          recoveryTime5minFormatted: recovery5minFormatted,
          recoveryTime10min: profile.recoveryTime10min || 58,
          recoveryTime10minFormatted: recovery10minFormatted,
          averageSpeed: String(speed.toFixed(1)),
          averageSpeedFormatted: avgSpeedFormatted,
          maxSpeed: profile.maxSpeed || '28.4',
          maxSpeedFormatted: maxSpeedFormatted,
          enduranceIndex: profile.enduranceIndex || 'Good',
          feedType: snapshot.feedType || 'High',
          lastFeedChangeDate: feedChangeDate,
          trainingLevel: profile.trainingLevel || 'Advanced',
          trainingLoadStatus: profile.trainingLoadStatus || 'Optimal',
          trainerName: profile.trainerName || 'Ali Hussein Salman',
          stableName: profile.stableName || 'A1 Stable',
          heartRateDeviceId: profile.heartRateDeviceId || `HR-ESP32-${String(snapshot.id).padStart(4, '0')}`,
          deviceStatus: status === 'No connection' ? 'Inactive' : 'Active',
          batteryLevel: battery,
          batteryLevelFormatted: batteryFormatted,
          esimStatus: status === 'No connection' ? 'Inactive' : 'Active',
          lastDataSync: profile.lastDataSync || '2026-01-17 08:42',
          profileVerified: profile.profileVerified || 'Yes',
          verifiedBy: profile.verifiedBy || 'Admin',
          createdAt: profile.createdAt || '2025-12-01',
          updatedAt: profile.updatedAt || '2026-01-17',
          notes: profile.notes || 'Ready for CEI3*'
        }
        
        // Cache this profile for this horse ID so it never changes
        profileCacheRef.current.set(currentHorseId, horseDetails)
        setFixedHorseDetails(horseDetails)
        lastHorseIdRef.current = currentHorseId
      }
  }, [isOpen, horse?.id]) // Only depend on isOpen and horse.id - fixedHorseDetails is managed internally, never depends on live horse prop changes

  // Use fixed horseDetails from state - memoized to prevent recalculation
  // This ensures the reference stays the same even when component re-renders
  const horseDetails = useMemo(() => {
    return fixedHorseDetails
  }, [fixedHorseDetails])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setHorseImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Stable toggle function - never changes, only updates state
  const toggleSection = useCallback((sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }, [])

  // Memoize Section component BEFORE early return - must be called in same order every render
  // This ensures sections are completely isolated from each other
  // Each section only re-renders when its own isOpen state changes
  const Section = useMemo(() => {
    return memo(({ sectionKey, title, children, color = 'blue', isOpen: sectionIsOpen, onToggle }) => {
      const colorClasses = {
        blue: 'bg-red-50 hover:bg-red-100 border-red-200',
        green: 'bg-red-50 hover:bg-red-100 border-red-200',
        purple: 'bg-red-50 hover:bg-red-100 border-red-200',
        orange: 'bg-red-50 hover:bg-red-100 border-red-200',
        indigo: 'bg-red-50 hover:bg-red-100 border-red-200'
      }
      
      const handleToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(sectionKey)
      }
    
    return (
      <div className="mb-3 border-2 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full px-6 py-4 ${colorClasses[color]} flex justify-between items-center transition-all duration-200`}
        >
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <span className={`text-gray-600 transform transition-transform duration-200 text-xl ${sectionIsOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {sectionIsOpen && (
          <div className="bg-white p-6 space-y-2 animate-fadeIn">
            {children}
          </div>
        )}
      </div>
    )
    }, (prevProps, nextProps) => {
      // Only re-render if this specific section's open state changed or props changed
      // Return true if props are equal (skip re-render), false if different (re-render)
      // Children comparison is skipped - children are static data, never change
      return prevProps.sectionKey === nextProps.sectionKey &&
             prevProps.title === nextProps.title &&
             prevProps.color === nextProps.color &&
             prevProps.isOpen === nextProps.isOpen &&
             prevProps.onToggle === nextProps.onToggle
      // Note: We don't compare children because they are static InfoRow components with fixed data
    })
  }, [toggleSection]) // Only recreate if toggleSection changes (which it never does)
  
  Section.displayName = 'Section'

  // Memoize InfoRow BEFORE early return - must be called in same order every render
  // Values are completely static, never recalculated
  const InfoRow = useMemo(() => memo(({ label, value, isStatus = false }) => {
    // Pre-calculate badge class - this is a pure function call, no side effects
    const badgeClass = isStatus ? getStatusBadge(value) : ''
    
    return (
      <div className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
        <span className="text-gray-700 font-medium text-sm">{label}</span>
        {isStatus ? (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
            {value}
          </span>
        ) : (
          <span className="text-gray-900 font-semibold text-sm">{value}</span>
        )}
      </div>
    )
  }, (prevProps, nextProps) => {
    // Custom comparison - only re-render if label or value actually changed
    // Return true if props are equal (skip re-render), false if different (re-render)
    // Values are static strings/numbers, never change after initial render
    return prevProps.label === nextProps.label && 
           String(prevProps.value) === String(nextProps.value) && 
           prevProps.isStatus === nextProps.isStatus
  }), []) // Empty deps - InfoRow never changes, it's a pure component
  
  InfoRow.displayName = 'InfoRow'

  // Early return AFTER all hooks - hooks must be called in same order every render
  if (!isOpen || !horseDetails) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden">
              <img
                src={horseImage || DEFAULT_HORSE_IMAGE}
                alt={horseDetails.horseName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{horseDetails.horseName}</h2>
              <p className="text-red-100 text-sm mt-1">Complete Profile Information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Horse Image Upload Circle - Centered */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-4 border-red-200 overflow-hidden bg-gradient-to-br from-red-100 to-red-100 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer relative"
              >
                <img
                  src={horseImage || DEFAULT_HORSE_IMAGE}
                  alt={horseDetails.horseName}
                  className="w-full h-full object-cover"
                />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {horseImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-red-700 shadow-xl hover:scale-110 transition-transform text-xl font-light"
                  title="Change Image"
                >
                  +
                </button>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <Section sectionKey="identification" title="Horse Identification" color="blue" isOpen={openSections.identification} onToggle={toggleSection}>
              <InfoRow label="FEI Horse ID" value={horseDetails.feiHorseId} />
              <InfoRow label="FEI Passport Number" value={horseDetails.feiPassportNumber} />
              <InfoRow label="Horse Name" value={horseDetails.horseName} />
              <InfoRow label="UELN Number" value={horseDetails.uelnNumber} />
              <InfoRow label="Date of Birth" value={horseDetails.dateOfBirth} />
              <InfoRow label="Age" value={horseDetails.ageFormatted} />
              <InfoRow label="Gender" value={horseDetails.gender} />
              <InfoRow label="Breed" value={horseDetails.breed} />
              <InfoRow label="Color" value={horseDetails.color} />
              <InfoRow label="Country of Birth" value={horseDetails.countryOfBirth} />
            </Section>

            <Section sectionKey="ownership" title="Ownership & Registration" color="green" isOpen={openSections.ownership} onToggle={toggleSection}>
              <InfoRow label="Owner Name" value={horseDetails.ownerName} />
              <InfoRow label="Owner FEI ID" value={horseDetails.ownerFeiId} />
              <InfoRow label="National Federation" value={horseDetails.nationalFederation} />
              <InfoRow label="Registration Status" value={horseDetails.registrationStatus} isStatus />
              <InfoRow label="Registration Valid From" value={horseDetails.registrationValidFrom} />
              <InfoRow label="Registration Valid To" value={horseDetails.registrationValidTo} />
            </Section>

            <Section sectionKey="veterinary" title="Veterinary & Medical" color="purple" isOpen={openSections.veterinary} onToggle={toggleSection}>
              <InfoRow label="Last Vet Inspection Date" value={horseDetails.lastVetInspectionDate} />
              <InfoRow label="Veterinary Status" value={horseDetails.veterinaryStatus} isStatus />
              <InfoRow label="Heart Health Status" value={horseDetails.heartHealthStatus} isStatus />
              <InfoRow label="Lameness Status" value={horseDetails.lamenessStatus} isStatus />
              <InfoRow label="Medication Control Status" value={horseDetails.medicationControlStatus} isStatus />
              <InfoRow label="Anti-Doping Status" value={horseDetails.antiDopingStatus} isStatus />
              <InfoRow label="Influenza Vaccination" value={horseDetails.influenzaVaccination} isStatus />
              <InfoRow label="Medical Notes" value={horseDetails.medicalNotes} />
            </Section>

            <Section sectionKey="competition" title="Competition & Qualification" color="orange" isOpen={openSections.competition} onToggle={toggleSection}>
              <InfoRow label="Discipline" value={horseDetails.discipline} />
              <InfoRow label="CEI Star Level" value={horseDetails.ceiStarLevelFormatted} />
              <InfoRow label="Max Distance Completed (km)" value={horseDetails.maxDistanceFormatted} />
              <InfoRow label="Total FEI Rides" value={horseDetails.totalFeiRides} />
              <InfoRow label="Successful Completions" value={horseDetails.successfulCompletions} />
              <InfoRow label="Eliminations" value={horseDetails.eliminationsFormatted} />
              <InfoRow label="Last Competition Date" value={horseDetails.lastCompetitionDate} />
              <InfoRow label="Required Rest Period (Days)" value={horseDetails.requiredRestFormatted} />
            </Section>

            <Section sectionKey="performance" title="Performance Metrics" color="blue" isOpen={openSections.performance} onToggle={toggleSection}>
              <InfoRow label="Average Heart Rate (bpm)" value={horseDetails.averageHeartRateFormatted} />
              <InfoRow label="Max Heart Rate (bpm)" value={horseDetails.maxHeartRateFormatted} />
              <InfoRow label="Recovery Time 5 min (bpm)" value={horseDetails.recoveryTime5minFormatted} />
              <InfoRow label="Recovery Time 10 min (bpm)" value={horseDetails.recoveryTime10minFormatted} />
              <InfoRow label="Average Speed (km/h)" value={horseDetails.averageSpeedFormatted} />
              <InfoRow label="Max Speed (km/h)" value={horseDetails.maxSpeedFormatted} />
              <InfoRow label="Endurance Index" value={horseDetails.enduranceIndex} isStatus />
            </Section>

            <Section sectionKey="feeding" title="Feeding & Training" color="green" isOpen={openSections.feeding} onToggle={toggleSection}>
              <InfoRow label="Feed Type" value={horseDetails.feedType} />
              <InfoRow label="Last Feed Change Date" value={horseDetails.lastFeedChangeDate} />
              <InfoRow label="Training Level" value={horseDetails.trainingLevel} />
              <InfoRow label="Training Load Status" value={horseDetails.trainingLoadStatus} isStatus />
              <InfoRow label="Trainer Name" value={horseDetails.trainerName} />
              <InfoRow label="Stable Name" value={horseDetails.stableName} />
            </Section>

            <Section sectionKey="device" title="Device & Tracking (System)" color="blue" isOpen={openSections.device} onToggle={toggleSection}>
              <InfoRow label="Heart Rate Device ID" value={horseDetails.heartRateDeviceId} />
              <InfoRow label="Device Status" value={horseDetails.deviceStatus} isStatus />
              <InfoRow label="Battery Level (%)" value={horseDetails.batteryLevelFormatted} />
              <InfoRow label="eSIM Status" value={horseDetails.esimStatus} isStatus />
              <InfoRow label="Last Data Sync" value={horseDetails.lastDataSync} />
            </Section>

            <Section sectionKey="documents" title="Documents" color="purple" isOpen={openSections.documents} onToggle={toggleSection}>
              <InfoRow label="FEI Passport File" value="passport.pdf" />
              <InfoRow label="Ownership Certificate" value="ownership.pdf" />
              <InfoRow label="Vet Clearance Certificate" value="vet_clearance.pdf" />
              <InfoRow label="Competition Results" value="cei2_results.pdf" />
            </Section>

            <Section sectionKey="metadata" title="System Metadata" color="orange" isOpen={openSections.metadata} onToggle={toggleSection}>
              <InfoRow label="Profile Verified" value={horseDetails.profileVerified} isStatus />
              <InfoRow label="Verified By" value={horseDetails.verifiedBy} />
              <InfoRow label="Created At" value={horseDetails.createdAt} />
              <InfoRow label="Updated At" value={horseDetails.updatedAt} />
              <InfoRow label="Notes" value={horseDetails.notes} />
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default HorseProfileModal
