import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../utils/localStorageService'
import TagMultiSelect from './TagMultiSelect'

const PhysicalExamTab = ({ horseId, onToast }) => {
  const [activeSubTab, setActiveSubTab] = useState('general')
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [visits, setVisits] = useState([])
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().slice(0, 16),
    doctor: 'Dr. Smith',
    location: '',
    reason: '',
    temperature: '',
    pulse: '',
    respiration: '',
    mucousMembranes: 'Normal',
    crt: '',
    hydrationStatus: 'Normal',
    bodyConditionScore: '',
    // General
    attitude: 'Normal',
    appetite: 'Normal',
    painScore: '',
    // Limbs
    limbs: {
      LF: { tags: [], lamenessGrade: '', notes: '' },
      RF: { tags: [], lamenessGrade: '', notes: '' },
      LH: { tags: [], lamenessGrade: '', notes: '' },
      RH: { tags: [], lamenessGrade: '', notes: '' }
    },
    // Skin & Coat
    skinCoatTags: [],
    skinCoatNotes: '',
    // Eyes / Ears / Nose / Mouth
    eyesEarsNoseMouthTags: [],
    eyesEarsNoseMouthNotes: '',
    // Dental
    dentalNotes: '',
    // Gastrointestinal
    gutSounds: 'Normal',
    colic: 'No',
    giNotes: '',
    // Respiratory
    cough: 'No',
    nasalDischarge: 'No',
    breathingEffort: 'Normal',
    respiratoryNotes: '',
    // Cardiovascular
    auscultationResult: 'Normal',
    cardiovascularNotes: ''
  })

  const limbTags = ['Swelling', 'Heat', 'Pain', 'Wound', 'Digital Pulse ↑', 'Hoof Issue', 'Tendon', 'Joint']

  useEffect(() => {
    // Load visits when horseId changes
    const loadedVisits = localStorageService.getVisits(horseId)
    // Sort by date (newest first)
    loadedVisits.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
    setVisits(loadedVisits)
  }, [horseId, refreshKey])

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorageService.saveVisit(horseId, formData)
    setRefreshKey(prev => prev + 1)
    onToast('Physical examination record saved successfully', 'success')
    setShowModal(false)
    // Reset form
    setFormData({
      visitDate: new Date().toISOString().slice(0, 16),
      doctor: 'Dr. Smith',
      location: '',
      reason: '',
      temperature: '',
      pulse: '',
      respiration: '',
      mucousMembranes: 'Normal',
      crt: '',
      hydrationStatus: 'Normal',
      bodyConditionScore: '',
      attitude: 'Normal',
      appetite: 'Normal',
      painScore: '',
      limbs: {
        LF: { tags: [], lamenessGrade: '', notes: '' },
        RF: { tags: [], lamenessGrade: '', notes: '' },
        LH: { tags: [], lamenessGrade: '', notes: '' },
        RH: { tags: [], lamenessGrade: '', notes: '' }
      },
      skinCoatTags: [],
      skinCoatNotes: '',
      eyesEarsNoseMouthTags: [],
      eyesEarsNoseMouthNotes: '',
      dentalNotes: '',
      gutSounds: 'Normal',
      colic: 'No',
      giNotes: '',
      cough: 'No',
      nasalDischarge: 'No',
      breathingEffort: 'Normal',
      respiratoryNotes: '',
      auscultationResult: 'Normal',
      cardiovascularNotes: ''
    })
  }

  const updateLimbData = (limb, field, value) => {
    setFormData({
      ...formData,
      limbs: {
        ...formData.limbs,
        [limb]: {
          ...formData.limbs[limb],
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          New Physical Examination
        </button>
      </div>

      {/* Previous Visits */}
      {visits.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Previous Visits</h3>
          {visits.map((visit) => (
            <div key={visit.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-lg">
                    {new Date(visit.visitDate).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Doctor: {visit.doctor} | Location: {visit.location || 'N/A'}
                  </div>
                  {visit.reason && (
                    <div className="text-sm text-gray-700 mt-1">
                      Reason: {visit.reason}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {visit.temperature && (
                  <div>
                    <span className="text-gray-500">Temperature:</span> {visit.temperature}°C
                  </div>
                )}
                {visit.pulse && (
                  <div>
                    <span className="text-gray-500">Pulse:</span> {visit.pulse} bpm
                  </div>
                )}
                {visit.respiration && (
                  <div>
                    <span className="text-gray-500">Respiration:</span> {visit.respiration}
                  </div>
                )}
                {visit.bodyConditionScore && (
                  <div>
                    <span className="text-gray-500">BCS:</span> {visit.bodyConditionScore}/9
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Visit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">New Physical Examination</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Visit Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor *
                  </label>
                  <select
                    required
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Johnson">Dr. Johnson</option>
                    <option value="Dr. Williams">Dr. Williams</option>
                    <option value="Dr. Brown">Dr. Brown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason / Complaint
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Respiration</label>
                    <input
                      type="text"
                      value={formData.respiration}
                      onChange={(e) => setFormData({ ...formData, respiration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mucous Membranes</label>
                    <select
                      value={formData.mucousMembranes}
                      onChange={(e) => setFormData({ ...formData, mucousMembranes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Pale">Pale</option>
                      <option value="Injected">Injected</option>
                      <option value="Cyanotic">Cyanotic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CRT (seconds)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.crt}
                      onChange={(e) => setFormData({ ...formData, crt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hydration Status</label>
                    <select
                      value={formData.hydrationStatus}
                      onChange={(e) => setFormData({ ...formData, hydrationStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Dehydrated">Dehydrated</option>
                      <option value="Well Hydrated">Well Hydrated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Condition Score (1-9)</label>
                    <input
                      type="number"
                      min="1"
                      max="9"
                      value={formData.bodyConditionScore}
                      onChange={(e) => setFormData({ ...formData, bodyConditionScore: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="border-t pt-4">
                <div className="flex gap-2 mb-4 border-b">
                  {['general', 'limbs', 'skin', 'eyes', 'dental', 'gi', 'respiratory', 'cardiovascular'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeSubTab === tab
                          ? 'border-red-600 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* General Tab */}
                {activeSubTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attitude</label>
                        <select
                          value={formData.attitude}
                          onChange={(e) => setFormData({ ...formData, attitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Depressed">Depressed</option>
                          <option value="Alert">Alert</option>
                          <option value="Aggressive">Aggressive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Appetite</label>
                        <select
                          value={formData.appetite}
                          onChange={(e) => setFormData({ ...formData, appetite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Decreased">Decreased</option>
                          <option value="Increased">Increased</option>
                          <option value="Anorexic">Anorexic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pain Score (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.painScore}
                          onChange={(e) => setFormData({ ...formData, painScore: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Limbs Tab */}
                {activeSubTab === 'limbs' && (
                  <div className="space-y-6">
                    {['LF', 'RF', 'LH', 'RH'].map((limb) => (
                      <div key={limb} className="border rounded-lg p-4">
                        <h5 className="font-semibold mb-3">{limb} (Left/Right Front/Hind)</h5>
                        <TagMultiSelect
                          options={limbTags}
                          selected={formData.limbs[limb].tags}
                          onChange={(tags) => updateLimbData(limb, 'tags', tags)}
                          label="Tags"
                        />
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lameness Grade (0-5)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={formData.limbs[limb].lamenessGrade}
                            onChange={(e) => updateLimbData(limb, 'lamenessGrade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea
                            value={formData.limbs[limb].notes}
                            onChange={(e) => updateLimbData(limb, 'notes', e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skin & Coat Tab */}
                {activeSubTab === 'skin' && (
                  <div className="space-y-4">
                    <TagMultiSelect
                      options={['Normal', 'Dry', 'Dull', 'Alopecia', 'Lesions', 'Parasites']}
                      selected={formData.skinCoatTags}
                      onChange={(tags) => setFormData({ ...formData, skinCoatTags: tags })}
                      label="Skin & Coat Tags"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.skinCoatNotes}
                        onChange={(e) => setFormData({ ...formData, skinCoatNotes: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}

                {/* Eyes / Ears / Nose / Mouth Tab */}
                {activeSubTab === 'eyes' && (
                  <div className="space-y-4">
                    <TagMultiSelect
                      options={['Normal', 'Discharge', 'Swelling', 'Redness', 'Cloudiness', 'Ulceration']}
                      selected={formData.eyesEarsNoseMouthTags}
                      onChange={(tags) => setFormData({ ...formData, eyesEarsNoseMouthTags: tags })}
                      label="Eyes / Ears / Nose / Mouth Tags"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.eyesEarsNoseMouthNotes}
                        onChange={(e) => setFormData({ ...formData, eyesEarsNoseMouthNotes: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}

                {/* Dental Tab */}
                {activeSubTab === 'dental' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dental Quick Check Notes</label>
                    <textarea
                      value={formData.dentalNotes}
                      onChange={(e) => setFormData({ ...formData, dentalNotes: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                {/* Gastrointestinal Tab */}
                {activeSubTab === 'gi' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gut Sounds</label>
                        <select
                          value={formData.gutSounds}
                          onChange={(e) => setFormData({ ...formData, gutSounds: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Increased">Increased</option>
                          <option value="Decreased">Decreased</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Colic</label>
                        <select
                          value={formData.colic}
                          onChange={(e) => setFormData({ ...formData, colic: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.giNotes}
                        onChange={(e) => setFormData({ ...formData, giNotes: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}

                {/* Respiratory Tab */}
                {activeSubTab === 'respiratory' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cough</label>
                        <select
                          value={formData.cough}
                          onChange={(e) => setFormData({ ...formData, cough: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nasal Discharge</label>
                        <select
                          value={formData.nasalDischarge}
                          onChange={(e) => setFormData({ ...formData, nasalDischarge: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Breathing Effort</label>
                        <select
                          value={formData.breathingEffort}
                          onChange={(e) => setFormData({ ...formData, breathingEffort: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Labored">Labored</option>
                          <option value="Shallow">Shallow</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.respiratoryNotes}
                        onChange={(e) => setFormData({ ...formData, respiratoryNotes: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}

                {/* Cardiovascular Tab */}
                {activeSubTab === 'cardiovascular' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auscultation Result</label>
                      <select
                        value={formData.auscultationResult}
                        onChange={(e) => setFormData({ ...formData, auscultationResult: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Arrhythmia">Arrhythmia</option>
                        <option value="Murmur">Murmur</option>
                        <option value="Abnormal">Abnormal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.cardiovascularNotes}
                        onChange={(e) => setFormData({ ...formData, cardiovascularNotes: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Save Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhysicalExamTab
