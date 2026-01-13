import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'

const DEFAULT_RIDER_IMAGE = 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg'

// Move getStatusBadge outside component
const getStatusBadge = (status) => {
  const statusStr = String(status || '')
  const statusLower = statusStr.toLowerCase()
  // Check for "Not Qualified" first (before "Qualified")
  if (statusLower.includes('not qualified')) {
    return 'bg-orange-100 text-orange-800' // Orange for Not Qualified
  }
  if (statusLower.includes('qualified')) {
    return 'bg-green-100 text-green-800' // Green for Qualified
  }
  if (statusLower.includes('suspended')) {
    return 'bg-red-100 text-red-800' // Red for Suspended
  }
  return 'bg-yellow-100 text-yellow-800' // Default yellow
}

// Memoize InfoRow with proper comparison - defined outside component
const InfoRow = memo(({ label, value, isStatus = false }) => {
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
  return prevProps.label === nextProps.label &&
         String(prevProps.value) === String(nextProps.value) &&
         prevProps.isStatus === nextProps.isStatus
})

InfoRow.displayName = 'InfoRow'

const RiderProfileModal = ({ isOpen, onClose, rider }) => {
  const [riderImage, setRiderImage] = useState(DEFAULT_RIDER_IMAGE)
  const [openSections, setOpenSections] = useState({
    identification: false,
    qualification: false,
    requirements: false,
    metadata: false
  })
  const [fixedRiderDetails, setFixedRiderDetails] = useState(null)
  const fileInputRef = useRef(null)
  const lastRiderIdRef = useRef(null)
  const riderSnapshotRef = useRef(null)

  // Capture rider data when modal opens
  useEffect(() => {
    if (!isOpen || !rider) {
      if (!isOpen) {
        setFixedRiderDetails(null)
        lastRiderIdRef.current = null
        riderSnapshotRef.current = null
        setOpenSections({
          identification: false,
          qualification: false,
          requirements: false,
          metadata: false
        })
      }
      return
    }

    const currentRiderId = rider.id

    if (lastRiderIdRef.current === currentRiderId && fixedRiderDetails) {
      return
    }

    if (lastRiderIdRef.current !== currentRiderId) {
      riderSnapshotRef.current = JSON.parse(JSON.stringify(rider))
      setRiderImage(DEFAULT_RIDER_IMAGE)

      const snapshot = riderSnapshotRef.current
      const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString()
      }

      const riderDetails = {
        id: snapshot.id,
        feiId: snapshot.fei_id,
        name: snapshot.name,
        discipline: snapshot.discipline,
        starLevel: snapshot.star_level,
        qualificationStatus: snapshot.qualification_status,
        qualificationDate: formatDate(snapshot.qualification_date),
        expiryDate: formatDate(snapshot.expiry_date),
        minCompletedRides: snapshot.min_completed_rides,
        minDistanceKm: `${snapshot.min_distance_km} km`,
        maxAllowedSpeed: `${snapshot.max_allowed_speed} km/h`,
        minRestPeriodDays: `${snapshot.min_rest_period_days} days`,
        feiReferenceCode: snapshot.fei_reference_code,
        notes: snapshot.notes,
        createdAt: formatDate(snapshot.created_at),
        updatedAt: formatDate(snapshot.updated_at),
        // Backward compatibility fields
        age: snapshot.age,
        weight: snapshot.weight,
        height: snapshot.height,
        experience: snapshot.experience,
        teamName: snapshot.teamName
      }

      setFixedRiderDetails(riderDetails)
      lastRiderIdRef.current = currentRiderId
    }
  }, [isOpen, rider?.id, fixedRiderDetails])

  const riderDetails = useMemo(() => {
    return fixedRiderDetails
  }, [fixedRiderDetails])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setRiderImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleSection = useCallback((sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }, [])

  // Memoize Section component BEFORE early return - must be called in same order every render
  const Section = useMemo(() => {
    return memo(({ sectionKey, title, children, color = 'blue', isOpen: sectionIsOpen, onToggle }) => {
      const colorClasses = {
        blue: 'bg-red-50 hover:bg-red-100 border-red-200',
        green: 'bg-red-50 hover:bg-red-100 border-red-200',
        purple: 'bg-red-50 hover:bg-red-100 border-red-200',
        orange: 'bg-red-50 hover:bg-red-100 border-red-200'
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
      return prevProps.sectionKey === nextProps.sectionKey &&
             prevProps.title === nextProps.title &&
             prevProps.color === nextProps.color &&
             prevProps.isOpen === nextProps.isOpen &&
             prevProps.onToggle === nextProps.onToggle
    })
  }, [toggleSection])

  Section.displayName = 'Section'

  // Early return after all hooks
  if (!isOpen || !riderDetails) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden">
              <img
                src={riderImage || DEFAULT_RIDER_IMAGE}
                alt={riderDetails.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{riderDetails.name}</h2>
              <p className="text-red-100 text-sm mt-1">Rider Profile Information</p>
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
          {/* Rider Image Upload Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-4 border-red-200 overflow-hidden bg-gradient-to-br from-red-100 to-red-100 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer relative"
              >
                <img
                  src={riderImage || DEFAULT_RIDER_IMAGE}
                  alt={riderDetails.name}
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
              {riderImage && (
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
            <Section sectionKey="identification" title="Rider Identification" color="blue" isOpen={openSections.identification} onToggle={toggleSection}>
              <InfoRow label="ID" value={`#${riderDetails.id}`} />
              <InfoRow label="FEI ID" value={riderDetails.feiId} />
              <InfoRow label="Name" value={riderDetails.name} />
              <InfoRow label="Discipline" value={riderDetails.discipline} />
              <InfoRow label="Star Level" value={`${riderDetails.starLevel}★`} />
              <InfoRow label="Age" value={riderDetails.age ? `${riderDetails.age} years` : 'N/A'} />
              <InfoRow label="Weight" value={riderDetails.weight ? `${riderDetails.weight} kg` : 'N/A'} />
              <InfoRow label="Height" value={riderDetails.height ? `${riderDetails.height} cm` : 'N/A'} />
              <InfoRow label="Experience" value={riderDetails.experience || 'N/A'} />
              <InfoRow label="Team Name" value={riderDetails.teamName || 'N/A'} />
            </Section>

            <Section sectionKey="qualification" title="Qualification Information" color="green" isOpen={openSections.qualification} onToggle={toggleSection}>
              <InfoRow label="Qualification Status" value={riderDetails.qualificationStatus} isStatus />
              <InfoRow label="Qualification Date" value={riderDetails.qualificationDate} />
              <InfoRow label="Expiry Date" value={riderDetails.expiryDate} />
              <InfoRow label="FEI Reference Code" value={riderDetails.feiReferenceCode} />
            </Section>

            <Section sectionKey="requirements" title="Qualification Requirements" color="purple" isOpen={openSections.requirements} onToggle={toggleSection}>
              <InfoRow label="Minimum Completed Rides" value={riderDetails.minCompletedRides} />
              <InfoRow label="Minimum Distance (km)" value={riderDetails.minDistanceKm} />
              <InfoRow label="Maximum Allowed Speed (km/h)" value={riderDetails.maxAllowedSpeed} />
              <InfoRow label="Minimum Rest Period (days)" value={riderDetails.minRestPeriodDays} />
            </Section>

            <Section sectionKey="metadata" title="System Metadata" color="orange" isOpen={openSections.metadata} onToggle={toggleSection}>
              <InfoRow label="Notes" value={riderDetails.notes} />
              <InfoRow label="Created At" value={riderDetails.createdAt} />
              <InfoRow label="Updated At" value={riderDetails.updatedAt} />
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

export default RiderProfileModal
