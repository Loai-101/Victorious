import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { mockHorses, mockRiders, mockTrainers } from '../data/mockData'
import UpgradeModal from '../components/UpgradeModal'

const TrainingSchedule = () => {
  const { t } = useTranslation()
  const { user } = useApp()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [selectedHorseId, setSelectedHorseId] = useState(mockHorses[0]?.id || 1)
  
  // Generate mock previous training sessions
  const generatePreviousTrainings = () => {
    return Array.from({ length: 20 }, (_, i) => {
      const horse = mockHorses[i % mockHorses.length]
      const rider = mockRiders[i % mockRiders.length]
      const trainer = mockTrainers[i % mockTrainers.length]
      const date = new Date()
      date.setDate(date.getDate() - (i + 1))
      
      return {
        id: `TR-2026-${String(i + 1).padStart(3, '0')}`,
        date: date.toISOString().split('T')[0],
        horseName: horse.name,
        horseId: horse.id,
        riderName: rider.name,
        trainerName: trainer.name,
        trainingType: ['Endurance', 'Dressage', 'Jumping', 'Eventing', 'Racing'][i % 5],
        trainingCategory: ['Walk', 'Trot', 'Canter', 'Endurance', 'Recovery', 'Interval'][i % 6],
        distance: (10 + (i % 30)).toFixed(1),
        duration: 60 + (i % 120),
        status: ['Planned', 'Active', 'Completed'][i % 3],
        performanceScore: 70 + (i % 30)
      }
    })
  }
  
  const previousTrainings = generatePreviousTrainings()
  
  // Mock training session data
  const [trainingSession, setTrainingSession] = useState({
    trainingId: 'TR-2026-001',
    date: '2026-01-20',
    startTime: '08:00',
    endTime: '10:30',
    sessionDuration: 150,
    trainingStatus: 'Active',
    horseId: mockHorses[0]?.id || 1,
    riderId: mockRiders[0]?.id || 1,
    trainerId: mockTrainers[0]?.id || 1,
    trainingType: 'Endurance',
    trainingCategory: 'Endurance',
    exerciseType: 'Hills',
    terrainType: 'Mixed',
    trainingIntensity: 'High',
    plannedDistance: 25,
    actualDistance: 24.8,
    plannedDuration: 150,
    actualDuration: 148,
    plannedSpeed: 10,
    averageSpeed: 10.1,
    maxSpeed: 28.5,
    averageHeartRate: 135,
    maxHeartRate: 168,
    heartRateZonesTime: 'Zone 3: 45min, Zone 4: 60min, Zone 5: 15min',
    recoveryHR5min: 64,
    recoveryHR10min: 58,
    startCoordinates: [26.0667, 50.5577],
    endCoordinates: [26.0750, 50.5650],
    elevationGain: 120,
    idleTime: 5,
    hrDeviceId: 'HR-ESP32-0001',
    deviceBatteryLevel: 85,
    esimStatus: 'Active',
    dataUsage: 45.2,
    lastSyncTime: '2026-01-20 10:30:15',
    trainingGoalAchieved: 'Yes',
    performanceScore: 92,
    efficiencyIndex: 88,
    abnormalAlertsTriggered: 0,
    feedTypeDuringTraining: 'Premium Hay',
    hydrationStatus: 'Good',
    postTrainingFeedPlan: 'Grain Mix + Supplements',
    requiredRestPeriod: 2,
    highHRAlert: false,
    overSpeedAlert: false,
    noRecoveryAlert: false,
    manualStopTriggered: false,
    trainerNotes: 'Excellent performance. Horse maintained consistent pace throughout.',
    riderNotes: 'Good control and pacing. Minor adjustments needed on hills.',
    vetNotes: 'Horse in excellent condition. No concerns.',
    attachments: []
  })

  const selectedHorse = mockHorses.find(h => h.id === selectedHorseId) || mockHorses[0]
  const selectedRider = mockRiders.find(r => r.id === trainingSession.riderId)
  const selectedTrainer = mockTrainers.find(t => t.id === trainingSession.trainerId)
  
  // Section navigation
  const sections = [
    'Training Session Overview',
    'Horse Selection',
    'Rider & Trainer',
    'Distance & Time',
    'Heart Rate Metrics',
    'GPS & Movement',
    'Device & Connectivity',
    'Performance Evaluation',
    'Feeding & Recovery',
    'Alerts & Safety',
    'Notes & Attachments',
    'Reports & Actions'
  ]
  
  const nextSection = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1)
    }
  }
  
  const prevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1)
    }
  }

  const handleChange = (field, value) => {
    if (user?.subscription === 'free') {
      setShowUpgradeModal(true)
      return
    }
    // Convert Yes/No to boolean for alert fields
    if (['highHRAlert', 'overSpeedAlert', 'noRecoveryAlert', 'manualStopTriggered'].includes(field)) {
      setTrainingSession(prev => ({ ...prev, [field]: value === 'Yes' }))
    } else {
      setTrainingSession(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = () => {
    if (user?.subscription === 'free') {
      setShowUpgradeModal(true)
      return
    }
    alert('Training session saved successfully!')
  }

  const SectionCard = ({ title, children, sectionIndex, color = 'red' }) => (
    <div id={`section-${sectionIndex}`} className="bg-white rounded-lg shadow border-l-4 border-red-600 p-6 scroll-mt-24">
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )

  const FieldRow = ({ label, fieldName, value, editable = false, type = 'text', options = [] }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="md:col-span-2">
        {editable && user?.subscription !== 'free' ? (
          type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          )
        ) : (
          <span className="text-sm text-gray-900 font-medium">{value || 'N/A'}</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Training Session Overview</h1>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={user?.subscription === 'free'}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Session
          </button>
          <button
            className="px-6 py-2 bg-white border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Previous Trainings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Previous Training Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance (km)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (min)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previousTrainings.map((training) => (
                <tr key={training.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{training.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.horseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.riderName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.trainerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.trainingType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.trainingCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.distance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{training.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      training.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      training.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {training.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{training.performanceScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Training Session Modal Button */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Training Session</h2>
        <button
          onClick={() => setShowTrainingModal(true)}
          className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-lg font-semibold"
        >
          Training Session Overview
        </button>
      </div>

      {/* Training Session Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold">Training Session Overview</h2>
              <button
                onClick={() => {
                  setShowTrainingModal(false)
                  setActiveSection(0)
                }}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Section Navigation */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Navigate to Section:</h3>
                <span className="text-xs text-gray-500">Page {activeSection + 1} of {sections.length}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeSection === index
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>

            {/* Horse Selection Dropdown */}
            <div className="bg-white border-b border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Horse (from 250 horses)
              </label>
              <select
                value={selectedHorseId}
                onChange={(e) => {
                  setSelectedHorseId(parseInt(e.target.value))
                  setTrainingSession(prev => ({ ...prev, horseId: parseInt(e.target.value) }))
                }}
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {mockHorses.map(horse => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name} (ID: {horse.id}) - {horse.breed} - {horse.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Content - Show one section at a time */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Training Session Overview - Page 0 */}
              {activeSection === 0 && (
                <SectionCard title="Training Session Overview" sectionIndex={0}>
        <FieldRow label="Training ID" fieldName="trainingId" value={trainingSession.trainingId} />
        <FieldRow label="Date" fieldName="date" value={trainingSession.date} editable type="date" />
        <FieldRow label="Start Time" fieldName="startTime" value={trainingSession.startTime} editable type="time" />
        <FieldRow label="End Time" fieldName="endTime" value={trainingSession.endTime} editable type="time" />
        <FieldRow label="Session Duration (min)" fieldName="sessionDuration" value={trainingSession.sessionDuration} editable type="number" />
        <FieldRow 
          label="Training Status" 
          fieldName="trainingStatus"
          value={trainingSession.trainingStatus} 
          editable 
          type="select"
          options={['Planned', 'Active', 'Completed']}
        />
                </SectionCard>
              )}

              {/* Horse Selection - Page 1 */}
              {activeSection === 1 && (
                <SectionCard title="Horse Selection" sectionIndex={1}>
        <FieldRow 
          label="Horse Name" 
          value={selectedHorse?.name || 'N/A'} 
        />
        <FieldRow 
          label="FEI Horse ID" 
          value={selectedHorse?.profile?.feiHorseId || String(10000000 + (selectedHorse?.id || 1))} 
        />
        <FieldRow 
          label="Horse Profile Link" 
          value={`/dashboard/horses/${selectedHorse?.id}`} 
        />
        <FieldRow 
          label="Current CEI Star Level" 
          value={`${selectedHorse?.stars || 2}★`} 
        />
                </SectionCard>
              )}

              {/* Rider & Trainer - Page 2 */}
              {activeSection === 2 && (
                <SectionCard title="Rider & Trainer" sectionIndex={2}>
        <FieldRow 
          label="Rider Name" 
          value={selectedRider?.name || 'N/A'} 
        />
        <FieldRow 
          label="Rider FEI ID" 
          value={selectedRider?.fei_id || 'N/A'} 
        />
        <FieldRow 
          label="Rider Qualification Level" 
          value={`${selectedRider?.star_level || 2}★`} 
        />
        <FieldRow 
          label="Trainer Name" 
          value={selectedTrainer?.name || 'N/A'} 
        />
        <FieldRow 
          label="Trainer FEI ID" 
          value={selectedTrainer?.id || 'N/A'} 
        />
        <FieldRow 
          label="Training Type" 
          fieldName="trainingType"
          value={trainingSession.trainingType} 
          editable 
          type="select"
          options={['Endurance', 'Dressage', 'Jumping', 'Eventing', 'Racing']}
        />
        <FieldRow 
          label="Training Category" 
          fieldName="trainingCategory"
          value={trainingSession.trainingCategory} 
          editable 
          type="select"
          options={['Walk', 'Trot', 'Canter', 'Endurance', 'Recovery', 'Interval']}
        />
        <FieldRow 
          label="Exercise Type" 
          fieldName="exerciseType"
          value={trainingSession.exerciseType} 
          editable 
          type="select"
          options={['Flat', 'Hills', 'Sand', 'Track']}
        />
        <FieldRow 
          label="Terrain Type" 
          fieldName="terrainType"
          value={trainingSession.terrainType} 
          editable 
          type="select"
          options={['Flat', 'Hills', 'Mixed']}
        />
        <FieldRow 
          label="Training Intensity" 
          fieldName="trainingIntensity"
          value={trainingSession.trainingIntensity} 
          editable 
          type="select"
          options={['Low', 'Medium', 'High']}
        />
                </SectionCard>
              )}

              {/* Distance & Time - Page 3 */}
              {activeSection === 3 && (
                <SectionCard title="Distance & Time" sectionIndex={3}>
        <FieldRow label="Planned Distance (km)" fieldName="plannedDistance" value={trainingSession.plannedDistance} editable type="number" />
        <FieldRow label="Actual Distance (km)" fieldName="actualDistance" value={trainingSession.actualDistance} />
        <FieldRow label="Planned Duration (min)" fieldName="plannedDuration" value={trainingSession.plannedDuration} editable type="number" />
        <FieldRow label="Actual Duration (min)" fieldName="actualDuration" value={trainingSession.actualDuration} />
        <FieldRow label="Planned Speed (km/h)" fieldName="plannedSpeed" value={trainingSession.plannedSpeed} editable type="number" />
        <FieldRow label="Average Speed (km/h)" fieldName="averageSpeed" value={trainingSession.averageSpeed} />
        <FieldRow label="Max Speed (km/h)" fieldName="maxSpeed" value={trainingSession.maxSpeed} />
                </SectionCard>
              )}

              {/* Heart Rate Metrics - Page 4 */}
              {activeSection === 4 && (
                <SectionCard title="Heart Rate Metrics" sectionIndex={4}>
        <FieldRow label="Average Heart Rate (bpm)" fieldName="averageHeartRate" value={trainingSession.averageHeartRate} />
        <FieldRow label="Max Heart Rate (bpm)" fieldName="maxHeartRate" value={trainingSession.maxHeartRate} />
        <FieldRow label="Heart Rate Zones Time" fieldName="heartRateZonesTime" value={trainingSession.heartRateZonesTime} editable />
        <FieldRow label="Recovery HR (5 min)" fieldName="recoveryHR5min" value={`${trainingSession.recoveryHR5min} bpm`} />
        <FieldRow label="Recovery HR (10 min)" fieldName="recoveryHR10min" value={`${trainingSession.recoveryHR10min} bpm`} />
                </SectionCard>
              )}

              {/* GPS & Movement - Page 5 */}
              {activeSection === 5 && (
                <SectionCard title="GPS & Movement" sectionIndex={5}>
        <FieldRow label="Route Map" value="View on Map" />
        <FieldRow label="Start Coordinates" value={`${trainingSession.startCoordinates[0]}, ${trainingSession.startCoordinates[1]}`} />
        <FieldRow label="End Coordinates" value={`${trainingSession.endCoordinates[0]}, ${trainingSession.endCoordinates[1]}`} />
        <FieldRow label="Elevation Gain (m)" value={trainingSession.elevationGain} />
        <FieldRow label="Idle Time (min)" value={trainingSession.idleTime} />
                </SectionCard>
              )}

              {/* Device & Connectivity - Page 6 */}
              {activeSection === 6 && (
                <SectionCard title="Device & Connectivity" sectionIndex={6}>
        <FieldRow label="HR Device ID" value={trainingSession.hrDeviceId} />
        <FieldRow label="Device Battery Level (%)" value={`${trainingSession.deviceBatteryLevel}%`} />
        <FieldRow label="eSIM Status" value={trainingSession.esimStatus} />
        <FieldRow label="Data Usage (MB)" value={trainingSession.dataUsage} />
        <FieldRow label="Last Sync Time" value={trainingSession.lastSyncTime} />
                </SectionCard>
              )}

              {/* Performance Evaluation - Page 7 */}
              {activeSection === 7 && (
                <SectionCard title="Performance Evaluation" sectionIndex={7}>
        <FieldRow 
          label="Training Goal Achieved" 
          fieldName="trainingGoalAchieved"
          value={trainingSession.trainingGoalAchieved} 
          editable 
          type="select"
          options={['Yes', 'No']}
        />
        <FieldRow label="Performance Score" fieldName="performanceScore" value={trainingSession.performanceScore} />
        <FieldRow label="Efficiency Index" fieldName="efficiencyIndex" value={trainingSession.efficiencyIndex} />
        <FieldRow label="Abnormal Alerts Triggered" fieldName="abnormalAlertsTriggered" value={trainingSession.abnormalAlertsTriggered} />
                </SectionCard>
              )}

              {/* Feeding & Recovery - Page 8 */}
              {activeSection === 8 && (
                <SectionCard title="Feeding & Recovery" sectionIndex={8}>
        <FieldRow 
          label="Feed Type During Training" 
          fieldName="feedTypeDuringTraining"
          value={trainingSession.feedTypeDuringTraining} 
          editable 
          type="select"
          options={['Premium Hay', 'Grain Mix', 'Alfalfa', 'Oats', 'Barley']}
        />
        <FieldRow 
          label="Hydration Status" 
          fieldName="hydrationStatus"
          value={trainingSession.hydrationStatus} 
          editable 
          type="select"
          options={['Good', 'Adequate', 'Low', 'Critical']}
        />
        <FieldRow label="Post-Training Feed Plan" fieldName="postTrainingFeedPlan" value={trainingSession.postTrainingFeedPlan} editable />
        <FieldRow label="Required Rest Period (days)" fieldName="requiredRestPeriod" value={trainingSession.requiredRestPeriod} editable type="number" />
                </SectionCard>
              )}

              {/* Alerts & Safety - Page 9 */}
              {activeSection === 9 && (
                <SectionCard title="Alerts & Safety" sectionIndex={9}>
        <FieldRow 
          label="High HR Alert" 
          fieldName="highHRAlert"
          value={trainingSession.highHRAlert ? 'Yes' : 'No'} 
          editable 
          type="select"
          options={['Yes', 'No']}
        />
        <FieldRow 
          label="Over-Speed Alert" 
          fieldName="overSpeedAlert"
          value={trainingSession.overSpeedAlert ? 'Yes' : 'No'} 
          editable 
          type="select"
          options={['Yes', 'No']}
        />
        <FieldRow 
          label="No Recovery Alert" 
          fieldName="noRecoveryAlert"
          value={trainingSession.noRecoveryAlert ? 'Yes' : 'No'} 
          editable 
          type="select"
          options={['Yes', 'No']}
        />
        <FieldRow 
          label="Manual Stop Triggered" 
          fieldName="manualStopTriggered"
          value={trainingSession.manualStopTriggered ? 'Yes' : 'No'} 
          editable 
          type="select"
          options={['Yes', 'No']}
        />
                </SectionCard>
              )}

              {/* Notes & Attachments - Page 10 */}
              {activeSection === 10 && (
                <SectionCard title="Notes & Attachments" sectionIndex={10}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trainer Notes</label>
            <textarea
              value={trainingSession.trainerNotes}
              onChange={(e) => handleChange('trainerNotes', e.target.value)}
              disabled={user?.subscription === 'free'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rider Notes</label>
            <textarea
              value={trainingSession.riderNotes}
              onChange={(e) => handleChange('riderNotes', e.target.value)}
              disabled={user?.subscription === 'free'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vet Notes</label>
            <textarea
              value={trainingSession.vetNotes}
              onChange={(e) => handleChange('vetNotes', e.target.value)}
              disabled={user?.subscription === 'free'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Images / PDFs)</label>
          <input
            type="file"
            multiple
            disabled={user?.subscription === 'free'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
          />
        </div>
                </SectionCard>
              )}

              {/* Reports & Actions - Page 11 */}
              {activeSection === 11 && (
                <SectionCard title="Reports & Actions" sectionIndex={11}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                      Generate Training Report (PDF)
                    </button>
                    <button
                      className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 font-medium"
                    >
                      Export Data
                    </button>
                    <button
                      className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 font-medium"
                    >
                      Share Session Link
                    </button>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Modal Footer with Navigation */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={prevSection}
                  disabled={activeSection === 0}
                  className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextSection}
                  disabled={activeSection === sections.length - 1}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next →
                </button>
              </div>
              <div className="flex gap-3">
                <span className="text-sm text-gray-600 self-center">
                  Page {activeSection + 1} of {sections.length}
                </span>
                <button
                  onClick={() => {
                    setShowTrainingModal(false)
                    setActiveSection(0)
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={user?.subscription === 'free'}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  Save Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user?.subscription}
      />
    </div>
  )
}

export default TrainingSchedule
