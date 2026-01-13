import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { mockHorses } from '../data/mockData'

const DEFAULT_TRAINER_IMAGE = 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg'

// Move getStatusBadge outside component
const getStatusBadge = (status) => {
  const statusStr = String(status || '')
  const statusLower = statusStr.toLowerCase()
  if (statusLower.includes('active') || statusLower.includes('valid') || statusLower === 'yes' || statusLower === 'compliant') {
    return 'bg-green-100 text-green-800'
  }
  if (statusLower.includes('inactive') || statusLower.includes('pending')) {
    return 'bg-yellow-100 text-yellow-800'
  }
  return 'bg-gray-100 text-gray-800'
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

const TrainerProfileModal = ({ isOpen, onClose, trainer }) => {
  const [trainerImage, setTrainerImage] = useState(DEFAULT_TRAINER_IMAGE)
  const [openSections, setOpenSections] = useState({
    identification: false,
    professional: false,
    certification: false,
    stable: false,
    horses: false,
    competition: false,
    training: false,
    veterinary: false,
    contact: false,
    documents: false,
    metadata: false
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isOpen && trainer) {
      setTrainerImage(trainer.profileImage || DEFAULT_TRAINER_IMAGE)
      setOpenSections({
        identification: false,
        professional: false,
        certification: false,
        stable: false,
        horses: false,
        competition: false,
        training: false,
        veterinary: false,
        contact: false,
        documents: false,
        metadata: false
      })
    }
  }, [isOpen, trainer])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTrainerImage(reader.result)
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

  // Memoize Section component BEFORE early return
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

  // Get horses assigned to this trainer (based on FEI IDs or trainer name)
  const assignedHorses = useMemo(() => {
    if (!trainer) return []
    
    let matchedHorses = []
    
    // First try to match by FEI IDs
    if (trainer.horseFeiIds && trainer.horseFeiIds.length > 0) {
      matchedHorses = mockHorses.filter(horse => {
        const horseFeiId = horse.profile?.feiHorseId || String(10000000 + horse.id)
        return trainer.horseFeiIds.includes(horseFeiId)
      })
    }
    
    // If no matches by FEI ID, try matching by trainer name
    if (matchedHorses.length === 0) {
      matchedHorses = mockHorses.filter(horse => 
        horse.profile?.trainerName === trainer.name
      )
    }
    
    // If still no matches, assign horses based on trainer ID (deterministic assignment)
    if (matchedHorses.length === 0) {
      const startIndex = (trainer.id - 1) * (trainer.totalActiveHorses || 10)
      const endIndex = startIndex + (trainer.totalActiveHorses || 10)
      matchedHorses = mockHorses.slice(startIndex, endIndex)
    }
    
    // Return up to the total active horses count
    return matchedHorses.slice(0, trainer.totalActiveHorses || 10)
  }, [trainer])

  if (!isOpen || !trainer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden">
              <img
                src={trainerImage || DEFAULT_TRAINER_IMAGE}
                alt={trainer.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{trainer.name}</h2>
              <p className="text-red-100 text-sm mt-1">Trainer Profile Information</p>
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
          {/* Trainer Image Upload Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-4 border-red-200 overflow-hidden bg-gradient-to-br from-red-100 to-red-100 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer relative"
              >
                <img
                  src={trainerImage || DEFAULT_TRAINER_IMAGE}
                  alt={trainer.name}
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
              {trainerImage && (
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
            <Section sectionKey="identification" title="Trainer Identification" color="blue" isOpen={openSections.identification} onToggle={toggleSection}>
              <InfoRow label="Trainer FEI ID" value={trainer.feiId} />
              <InfoRow label="Full Name" value={trainer.name} />
              <InfoRow label="Gender" value={trainer.gender} />
              <InfoRow label="Date of Birth" value={trainer.dateOfBirth} />
              <InfoRow label="Nationality" value={trainer.nationality} />
              <InfoRow label="Profile Photo" value="trainer_photo.jpg" />
            </Section>

            <Section sectionKey="professional" title="Professional Role" color="green" isOpen={openSections.professional} onToggle={toggleSection}>
              <InfoRow label="Discipline" value={trainer.discipline} />
              <InfoRow label="Trainer Type" value={trainer.trainerType} />
              <InfoRow label="Status" value={trainer.status} isStatus />
              <InfoRow label="Years of Experience" value={`${trainer.yearsOfExperience} years`} />
              <InfoRow label="Specialization" value={trainer.specialization} />
              <InfoRow label="Languages Spoken" value={trainer.languagesSpoken} />
            </Section>

            <Section sectionKey="certification" title="Certification & Licensing" color="purple" isOpen={openSections.certification} onToggle={toggleSection}>
              <InfoRow label="FEI Certification Level" value={trainer.feiCertificationLevel} />
              <InfoRow label="Certification Number" value={trainer.certificationNumber} />
              <InfoRow label="Certification Valid From" value={trainer.certificationValidFrom} />
              <InfoRow label="Certification Valid To" value={trainer.certificationValidTo} />
              <InfoRow label="National Federation License" value={trainer.nationalFederationLicense} isStatus />
            </Section>

            <Section sectionKey="stable" title="Stable & Associations" color="orange" isOpen={openSections.stable} onToggle={toggleSection}>
              <InfoRow label="Stable Name" value={trainer.stableName} />
              <InfoRow label="Stable Country" value={trainer.stableCountry} />
              <InfoRow label="Club / Team Name" value={trainer.clubTeamName} />
              <InfoRow label="National Federation" value={trainer.nationalFederation} />
              
              {/* Horses Table in Stable Section */}
              {assignedHorses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Horses Under This Trainer</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Breed</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignedHorses.map((horse) => (
                          <tr key={horse.id} className="hover:bg-red-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">#{horse.id}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-600">{horse.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{horse.breed}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                horse.status === 'active' ? 'bg-green-100 text-green-800' :
                                horse.status === 'training' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {horse.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Section>

            <Section sectionKey="horses" title="Horses Under Training" color="blue" isOpen={openSections.horses} onToggle={toggleSection}>
              <InfoRow label="Total Active Horses" value={trainer.totalActiveHorses} />
              <InfoRow label="FEI Horses Count" value={trainer.feiHorsesCount} />
              <InfoRow label="Horse FEI IDs" value={trainer.horseFeiIds?.join(', ') || 'N/A'} />
              <InfoRow label="Assigned Riders" value={trainer.assignedRiders} />
              
              {/* Horses Table - Always visible in this section */}
              {assignedHorses.length > 0 ? (
                <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Breed</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">FEI ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignedHorses.map((horse) => (
                        <tr key={horse.id} className="hover:bg-red-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">#{horse.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600">{horse.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{horse.breed}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{horse.age} years</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              horse.status === 'active' ? 'bg-green-100 text-green-800' :
                              horse.status === 'training' ? 'bg-orange-100 text-orange-800' :
                              horse.status === 'resting' ? 'bg-blue-100 text-blue-800' :
                              horse.status === 'racing' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {horse.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {horse.profile?.feiHorseId || String(10000000 + horse.id)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{horse.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  No horses assigned to this trainer
                </div>
              )}
            </Section>

            <Section sectionKey="competition" title="Competition Experience" color="green" isOpen={openSections.competition} onToggle={toggleSection}>
              <InfoRow label="FEI Events Trained" value={trainer.feiEventsTrained} />
              <InfoRow label="CEI Levels Coached" value={trainer.ceiLevelsCoached} />
              <InfoRow label="Max Distance Trained (km)" value={`${trainer.maxDistanceTrained} km`} />
              <InfoRow label="Successful Completions" value={trainer.successfulCompletions} />
              <InfoRow label="Eliminations" value={trainer.eliminations} />
            </Section>

            <Section sectionKey="training" title="Training & Performance" color="purple" isOpen={openSections.training} onToggle={toggleSection}>
              <InfoRow label="Training Style" value={trainer.trainingStyle} />
              <InfoRow label="Preferred Training Type" value={trainer.preferredTrainingType} />
              <InfoRow label="Average Completion Rate (%)" value={`${trainer.averageCompletionRate}%`} />
              <InfoRow label="Injury Rate (%)" value={trainer.injuryRate} />
              <InfoRow label="HR Monitoring Used" value={trainer.hrMonitoringUsed} isStatus />
              
              {/* Horses Table in Training Section */}
              {assignedHorses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Horses Under Training</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Age</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Current HR</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignedHorses.map((horse) => (
                          <tr key={horse.id} className="hover:bg-red-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-600">{horse.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{horse.age} years</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                horse.status === 'active' ? 'bg-green-100 text-green-800' :
                                horse.status === 'training' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {horse.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                              {horse.currentHr ? `${horse.currentHr} bpm` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Section>

            <Section sectionKey="veterinary" title="Veterinary & Welfare (Informative)" color="orange" isOpen={openSections.veterinary} onToggle={toggleSection}>
              <InfoRow label="Vet Collaboration" value={trainer.vetCollaboration} isStatus />
              <InfoRow label="Injury Prevention Program" value={trainer.injuryPreventionProgram} isStatus />
              <InfoRow label="Recovery Protocol Used" value={trainer.recoveryProtocolUsed} isStatus />
              <InfoRow label="Welfare Compliance Status" value={trainer.welfareComplianceStatus} isStatus />
            </Section>

            <Section sectionKey="contact" title="Contact Information" color="blue" isOpen={openSections.contact} onToggle={toggleSection}>
              <InfoRow label="Phone Number" value={trainer.phoneNumber} />
              <InfoRow label="Email Address" value={trainer.emailAddress} />
              <InfoRow label="Emergency Contact" value={trainer.emergencyContact} />
            </Section>

            <Section sectionKey="documents" title="Documents" color="green" isOpen={openSections.documents} onToggle={toggleSection}>
              <InfoRow label="FEI Trainer License" value="fei_license.pdf" />
              <InfoRow label="Certificates" value="cert_level2.pdf" />
              <InfoRow label="Insurance Document" value="insurance.pdf" />
            </Section>

            <Section sectionKey="metadata" title="System Metadata" color="purple" isOpen={openSections.metadata} onToggle={toggleSection}>
              <InfoRow label="Profile Verified" value={trainer.profileVerified} isStatus />
              <InfoRow label="Verified By" value={trainer.verifiedBy} />
              <InfoRow label="Created At" value={trainer.createdAt} />
              <InfoRow label="Updated At" value={trainer.updatedAt} />
              <InfoRow label="Notes" value={trainer.notes} />
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

export default TrainerProfileModal
