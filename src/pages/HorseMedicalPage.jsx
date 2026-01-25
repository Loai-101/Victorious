import React, { useState, useEffect } from 'react'
import { mockHorses } from '../data/mockData'
import { localStorageService } from '../utils/localStorageService'
import HorseSelector from '../components/horse-medical/HorseSelector'
import HorseInfoCard from '../components/horse-medical/HorseInfoCard'
import WeightTab from '../components/horse-medical/WeightTab'
import PhysicalExamTab from '../components/horse-medical/PhysicalExamTab'
import BloodTestTab from '../components/horse-medical/BloodTestTab'
import MedicalCareTab from '../components/horse-medical/MedicalCareTab'
import Toast from '../components/Toast'
import { CardSkeleton } from '../components/LoadingSkeleton'

// Initialize sample weight data for horses
const initializeSampleWeightData = () => {
  const horsesToInitialize = mockHorses.slice(0, 15) // First 15 horses
  
  horsesToInitialize.forEach((horse, index) => {
    // Create unique data for each horse based on index
    // Each horse gets different data
    const existingWeights = localStorageService.getWeights(horse.id)
    
    // Initialize if no data exists or if we want to refresh
    if (existingWeights.length === 0) {
      const baseWeight = 400 + (index * 15) // Vary base weight between 400-610 kg
      const methods = ['Scale', 'Manual']
      const recordedBy = ['Doctor', 'Staff']
      const notes = [
        'Regular checkup',
        'Pre-competition weigh-in',
        'Post-training measurement',
        'Monthly monitoring',
        'Health assessment',
        'Routine check',
        'Pre-vet visit',
        'Post-recovery measurement',
        'Seasonal monitoring',
        'Fitness evaluation'
      ]
      
      // Create 3-5 weight records per horse with dates spread over the last 6 months
      const numRecords = 3 + (index % 3) // 3-5 records
      const weights = []
      
      for (let i = 0; i < numRecords; i++) {
        const daysAgo = (numRecords - i) * 30 + (index * 7) // Spread over months
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        date.setHours(10 + (i * 2), 30 + (index * 5), 0, 0)
        
        // Weight variation: ±5-15 kg from base
        const weightVariation = (i * 2) - (index % 3) * 3
        const weight = baseWeight + weightVariation
        
        weights.push({
          id: `weight_${horse.id}_${i}_${index}_${Date.now()}`,
          weightKg: parseFloat(weight.toFixed(1)),
          dateTime: date.toISOString().slice(0, 16),
          method: methods[index % methods.length],
          recordedBy: recordedBy[i % recordedBy.length],
          notes: notes[(index + i) % notes.length],
          createdAt: date.toISOString()
        })
      }
      
      // Save all weights for this horse
      const key = `horse_medical_${horse.id}_weights`
      localStorage.setItem(key, JSON.stringify(weights))
    }
  })
}

// Initialize sample physical examination data
const initializeSamplePhysicalExamData = () => {
  const horsesToInitialize = mockHorses.slice(0, 15)
  
  horsesToInitialize.forEach((horse, index) => {
    // Create unique data for each horse based on index
    const existingVisits = localStorageService.getVisits(horse.id)
    
    if (existingVisits.length === 0) {
      const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown']
      const locations = ['Main Stable', 'Training Facility', 'Vet Clinic', 'Field Examination']
      const reasons = [
        'Routine checkup',
        'Pre-competition examination',
        'Post-training assessment',
        'Health monitoring',
        'Lameness evaluation',
        'Annual physical',
        'Pre-purchase exam',
        'Follow-up visit'
      ]
      
      const numVisits = 2 + (index % 3) // 2-4 visits
      const visits = []
      
      for (let i = 0; i < numVisits; i++) {
        const daysAgo = (numVisits - i) * 45 + (index * 10)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        date.setHours(9 + (i * 3), 15 + (index * 10), 0, 0)
        
        visits.push({
          id: `visit_${horse.id}_${i}_${index}_${Date.now()}`,
          visitDate: date.toISOString().slice(0, 16),
          doctor: doctors[index % doctors.length],
          location: locations[i % locations.length],
          reason: reasons[(index + i) % reasons.length],
          temperature: (37.5 + (index % 5) * 0.1).toFixed(1),
          pulse: (38 + (index % 10)).toString(),
          respiration: '12-16/min',
          mucousMembranes: ['Normal', 'Pale', 'Normal', 'Injected'][i % 4],
          crt: (1.5 + (index % 3) * 0.2).toFixed(1),
          hydrationStatus: ['Normal', 'Well Hydrated', 'Normal'][i % 3],
          bodyConditionScore: (5 + (index % 4)).toString(),
          attitude: ['Normal', 'Alert', 'Normal', 'Depressed'][i % 4],
          appetite: ['Normal', 'Normal', 'Decreased', 'Normal'][i % 4],
          painScore: (index % 3).toString(),
          limbs: {
            LF: { tags: index % 2 === 0 ? ['Normal'] : [], lamenessGrade: (index % 2).toString(), notes: index % 2 === 0 ? '' : 'Minor swelling observed' },
            RF: { tags: [], lamenessGrade: '0', notes: '' },
            LH: { tags: [], lamenessGrade: '0', notes: '' },
            RH: { tags: index % 3 === 0 ? ['Heat'] : [], lamenessGrade: '0', notes: '' }
          },
          skinCoatTags: ['Normal'],
          skinCoatNotes: 'Coat in good condition',
          eyesEarsNoseMouthTags: ['Normal'],
          eyesEarsNoseMouthNotes: '',
          dentalNotes: 'Teeth in good condition, no issues noted',
          gutSounds: ['Normal', 'Increased', 'Normal'][i % 3],
          colic: 'No',
          giNotes: '',
          cough: 'No',
          nasalDischarge: 'No',
          breathingEffort: 'Normal',
          respiratoryNotes: '',
          auscultationResult: 'Normal',
          cardiovascularNotes: 'Heart sounds normal, regular rhythm',
          createdAt: date.toISOString()
        })
      }
      
      const key = `horse_medical_${horse.id}_visits`
      localStorage.setItem(key, JSON.stringify(visits))
    }
  })
}

// Initialize sample blood test data
const initializeSampleBloodTestData = () => {
  const horsesToInitialize = mockHorses.slice(0, 15)
  
  horsesToInitialize.forEach((horse, index) => {
    // Create unique data for each horse based on index
    const existingTests = localStorageService.getBloodTests(horse.id)
    
    if (existingTests.length === 0) {
      const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown']
      const devices = ['VetScan HM5', 'VetScan VS2']
      
      const numTests = 1 + (index % 2) // 1-2 tests
      const tests = []
      
      for (let i = 0; i < numTests; i++) {
        const daysAgo = (numTests - i) * 60 + (index * 15)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        date.setHours(11 + i, 0, 0, 0)
        
        // Generate realistic blood test values within normal ranges
        const baseWBC = 7.5 + (index % 3) * 0.5
        const baseRBC = 8.5 + (index % 4) * 0.3
        const baseHGB = 14.5 + (index % 3) * 0.5
        
        tests.push({
          id: `test_${horse.id}_${i}_${index}_${Date.now()}`,
          testDate: date.toISOString().slice(0, 16),
          doctor: doctors[index % doctors.length],
          device: devices[index % devices.length],
          sampleId: `SAMPLE-${horse.id}-${i + 1}`,
          patientId: `PAT-${horse.id}`,
          notes: i === 0 ? 'Routine blood work' : 'Follow-up test',
          // CBC values
          WBC: baseWBC.toFixed(1),
          LYM: (baseWBC * 0.45).toFixed(1),
          MON: (baseWBC * 0.05).toFixed(1),
          NEU: (baseWBC * 0.50).toFixed(1),
          EOS: (baseWBC * 0.02).toFixed(1),
          BAS: '0.0',
          LYMp: '45',
          MONp: '5',
          NEUp: '50',
          EOSp: '2',
          BASp: '0',
          RBC: baseRBC.toFixed(1),
          HGB: baseHGB.toFixed(1),
          HCT: ((baseHGB / 3) * 10).toFixed(0),
          MCV: '45',
          MCH: '17',
          MCHC: '34',
          RDWc: '15',
          RDWs: '3.5',
          PLT: (200 + (index % 50)).toString(),
          MPV: '6.0',
          PCT: '0.3',
          PDWc: '12',
          PDWs: '4.0',
          // Chemistry values
          Na: (138 + (index % 5)).toString(),
          K: (3.8 + (index % 3) * 0.2).toFixed(1),
          tCO2: (25 + (index % 3)).toString(),
          CK: (150 + (index % 100)).toString(),
          GLU: (85 + (index % 15)).toString(),
          CA: (12.0 + (index % 3) * 0.2).toFixed(1),
          BUN: (15 + (index % 5)).toString(),
          CRE: (1.2 + (index % 3) * 0.1).toFixed(1),
          AST: (200 + (index % 80)).toString(),
          TBIL: (1.2 + (index % 3) * 0.2).toFixed(1),
          GGT: (12 + (index % 8)).toString(),
          ALB: (3.2 + (index % 3) * 0.2).toFixed(1),
          TP: (6.5 + (index % 3) * 0.2).toFixed(1),
          GLOB: (3.3 + (index % 2) * 0.2).toFixed(1),
          qcHem: '',
          qcLip: '',
          qcIct: '',
          createdAt: date.toISOString()
        })
      }
      
      const key = `horse_medical_${horse.id}_bloodtests`
      localStorage.setItem(key, JSON.stringify(tests))
    }
  })
}

// Initialize sample medical care data
const initializeSampleMedicalCareData = () => {
  const horsesToInitialize = mockHorses.slice(0, 15)
  
  horsesToInitialize.forEach((horse, index) => {
    // Create unique data for each horse based on index
    const existingCare = localStorageService.getMedicalCare(horse.id)
    
    // Check if care data exists (has any category with data)
    const hasData = Object.values(existingCare).some(category => Array.isArray(category) && category.length > 0)
    
    if (!hasData) {
      const care = {
        vaccinations: [],
        deworming: [],
        medications: [],
        allergies: [],
        injuries: [],
        surgeries: [],
        dental: [],
        farrier: [],
        imaging: []
      }
      
      // Vaccinations (2-3 records)
      const numVaccinations = 2 + (index % 2)
      for (let i = 0; i < numVaccinations; i++) {
        const daysAgo = (numVaccinations - i) * 180 + (index * 30)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        const nextDue = new Date(date)
        nextDue.setFullYear(nextDue.getFullYear() + 1)
        
        care.vaccinations.push({
          id: `vacc_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: ['Tetanus', 'Influenza', 'West Nile', 'Rabies'][(index + i) % 4],
          type: ['Tetanus', 'Influenza', 'West Nile', 'Rabies'][(index + i) % 4],
          brand: ['Zoetis', 'Merial', 'Boehringer'][i % 3],
          batchNumber: `BATCH-${horse.id}-${i + 1}`,
          administeredBy: ['Dr. Smith', 'Dr. Johnson', 'Staff'][i % 3],
          nextDueDate: nextDue.toISOString().split('T')[0],
          notes: 'Routine vaccination',
          createdAt: date.toISOString()
        })
      }
      
      // Deworming (3-4 records)
      const numDeworming = 3 + (index % 2)
      for (let i = 0; i < numDeworming; i++) {
        const daysAgo = (numDeworming - i) * 90 + (index * 15)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        const nextDue = new Date(date)
        nextDue.setMonth(nextDue.getMonth() + 3)
        
        care.deworming.push({
          id: `deworm_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: ['Ivermectin', 'Fenbendazole', 'Pyrantel', 'Moxidectin'][(index + i) % 4],
          type: ['Ivermectin', 'Fenbendazole', 'Pyrantel', 'Moxidectin'][(index + i) % 4],
          dosage: ['10ml', '15ml', '12ml', '8ml'][i % 4],
          administeredBy: ['Dr. Smith', 'Staff', 'Dr. Johnson'][i % 3],
          nextDueDate: nextDue.toISOString().split('T')[0],
          notes: 'Regular deworming schedule',
          createdAt: date.toISOString()
        })
      }
      
      // Medications (1-2 records)
      const numMedications = 1 + (index % 2)
      for (let i = 0; i < numMedications; i++) {
        const daysAgo = (numMedications - i) * 30 + (index * 5)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        care.medications.push({
          id: `med_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: ['Bute', 'Banamine', 'Antibiotic', 'Supplements'][(index + i) % 4],
          type: ['Anti-inflammatory', 'Pain Relief', 'Antibiotic', 'Supplements'][(index + i) % 4],
          dosage: ['2 tablets', '10ml', '500mg', 'As directed'][i % 4],
          administeredBy: ['Dr. Smith', 'Staff'][i % 2],
          notes: 'Prescribed treatment',
          createdAt: date.toISOString()
        })
      }
      
      // Dental (1-2 records)
      const numDental = 1 + (index % 2)
      for (let i = 0; i < numDental; i++) {
        const daysAgo = (numDental - i) * 180 + (index * 30)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        care.dental.push({
          id: `dental_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: 'Dental Float',
          procedure: ['Floating', 'Extraction', 'Floating'][i % 3],
          veterinarian: ['Dr. Smith', 'Dr. Johnson'][i % 2],
          notes: 'Routine dental maintenance',
          createdAt: date.toISOString()
        })
      }
      
      // Farrier (4-5 records)
      const numFarrier = 4 + (index % 2)
      for (let i = 0; i < numFarrier; i++) {
        const daysAgo = (numFarrier - i) * 45 + (index * 7)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        care.farrier.push({
          id: `farrier_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: 'Hoof Care',
          procedure: ['Trim', 'Shoe', 'Reset', 'Trim'][i % 4],
          administeredBy: ['John Farrier', 'Mike Hoofcare', 'Tom Shoe'][i % 3],
          notes: 'Regular hoof maintenance',
          createdAt: date.toISOString()
        })
      }
      
      // Allergies (0-2 records - not all horses have allergies)
      if (index % 3 === 0) {
        const numAllergies = 1 + (index % 2)
        for (let i = 0; i < numAllergies; i++) {
          const daysAgo = (numAllergies - i) * 365 + (index * 60)
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          
          care.allergies.push({
            id: `allergy_${horse.id}_${i}_${index}_${Date.now()}`,
            date: date.toISOString().split('T')[0],
            name: ['Hay Allergy', 'Dust Allergy', 'Pollen Allergy', 'Feed Allergy'][(index + i) % 4],
            severity: ['Mild', 'Moderate', 'Mild', 'Severe'][i % 4],
            notes: ['Mild reaction to hay dust', 'Seasonal allergy to pollen', 'Dust sensitivity noted', 'Feed ingredient sensitivity'][i % 4],
            createdAt: date.toISOString()
          })
        }
      }
      
      // Injuries / Conditions (1-3 records)
      const numInjuries = 1 + (index % 3)
      for (let i = 0; i < numInjuries; i++) {
        const daysAgo = (numInjuries - i) * 120 + (index * 20)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        const conditions = [
          { name: 'Tendon Strain', location: 'Left Foreleg', severity: 'Mild' },
          { name: 'Hoof Abscess', location: 'Right Hind', severity: 'Moderate' },
          { name: 'Skin Abrasion', location: 'Shoulder', severity: 'Mild' },
          { name: 'Joint Inflammation', location: 'Knee', severity: 'Moderate' },
          { name: 'Muscle Soreness', location: 'Back', severity: 'Mild' },
          { name: 'Cuts', location: 'Face', severity: 'Mild' }
        ]
        const condition = conditions[(index + i) % conditions.length]
        
        care.injuries.push({
          id: `injury_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: condition.name,
          condition: condition.name,
          location: condition.location,
          severity: condition.severity,
          veterinarian: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'][i % 3],
          notes: `Treatment administered. ${condition.severity} ${condition.name} on ${condition.location}.`,
          createdAt: date.toISOString()
        })
      }
      
      // Surgeries / Procedures (0-2 records - not all horses have surgeries)
      if (index % 4 < 2) {
        const numSurgeries = 1 + (index % 2)
        for (let i = 0; i < numSurgeries; i++) {
          const daysAgo = (numSurgeries - i) * 730 + (index * 90) // Spread over 2+ years
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          
          const procedures = [
            { name: 'Castration', outcome: 'Successful, full recovery' },
            { name: 'Chip Removal', outcome: 'Successful, no complications' },
            { name: 'Tendon Repair', outcome: 'Successful, rehabilitation ongoing' },
            { name: 'Dental Extraction', outcome: 'Successful, healing well' },
            { name: 'Lump Removal', outcome: 'Successful, biopsy negative' }
          ]
          const procedure = procedures[(index + i) % procedures.length]
          
          care.surgeries.push({
            id: `surgery_${horse.id}_${i}_${index}_${Date.now()}`,
            date: date.toISOString().split('T')[0],
            name: procedure.name,
            procedure: procedure.name,
            veterinarian: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'][i % 3],
            outcome: procedure.outcome,
            notes: `Procedure performed under general anesthesia. ${procedure.outcome}.`,
            createdAt: date.toISOString()
          })
        }
      }
      
      // Imaging / Diagnostics (1-3 records)
      const numImaging = 1 + (index % 3)
      for (let i = 0; i < numImaging; i++) {
        const daysAgo = (numImaging - i) * 180 + (index * 30)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        const imagingTypes = [
          { type: 'X-Ray', location: 'Left Foreleg', attachment: `xray_lf_${horse.id}_${i + 1}.pdf` },
          { type: 'Ultrasound', location: 'Tendon', attachment: `ultrasound_tendon_${horse.id}_${i + 1}.pdf` },
          { type: 'X-Ray', location: 'Hoof', attachment: `xray_hoof_${horse.id}_${i + 1}.pdf` },
          { type: 'MRI', location: 'Knee Joint', attachment: `mri_knee_${horse.id}_${i + 1}.pdf` },
          { type: 'X-Ray', location: 'Back', attachment: `xray_back_${horse.id}_${i + 1}.pdf` },
          { type: 'Ultrasound', location: 'Abdomen', attachment: `ultrasound_abdomen_${horse.id}_${i + 1}.pdf` }
        ]
        const imaging = imagingTypes[(index + i) % imagingTypes.length]
        
        care.imaging.push({
          id: `imaging_${horse.id}_${i}_${index}_${Date.now()}`,
          date: date.toISOString().split('T')[0],
          name: imaging.type,
          type: imaging.type,
          location: imaging.location,
          veterinarian: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'][i % 3],
          attachment: imaging.attachment,
          notes: `${imaging.type} performed on ${imaging.location}. Results reviewed.`,
          createdAt: date.toISOString()
        })
      }
      
      // Save all care data
      const key = `horse_medical_${horse.id}_care`
      localStorage.setItem(key, JSON.stringify(care))
    }
  })
}

const HorseMedicalPage = () => {
  const [selectedHorse, setSelectedHorse] = useState(null)
  const [activeTab, setActiveTab] = useState('weight')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Initialize sample data on mount for all 15 horses
    // This ensures every horse has data when selected
    initializeSampleWeightData()
    initializeSamplePhysicalExamData()
    initializeSampleBloodTestData()
    initializeSampleMedicalCareData()
    
    // Auto-select first horse on mount
    if (mockHorses.length > 0 && !selectedHorse) {
      setSelectedHorse(mockHorses[0])
    }
  }, [])

  const handleSelectHorse = (horse) => {
    setLoading(true)
    setTimeout(() => {
      setSelectedHorse(horse)
      setLoading(false)
    }, 300) // Simulate loading
  }

  const handleToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const tabs = [
    { key: 'weight', label: 'Weight' },
    { key: 'physical', label: 'Physical Examination' },
    { key: 'bloodtest', label: 'Blood Test' },
    { key: 'care', label: 'Medical Care History' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Horse Medical Profile</h1>
      </div>

      {/* Horse Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Horse
        </label>
        <HorseSelector
          horses={mockHorses}
          selectedHorse={selectedHorse}
          onSelectHorse={handleSelectHorse}
        />
      </div>

      {/* Horse Info Card */}
      {selectedHorse && !loading && <HorseInfoCard horse={selectedHorse} />}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          <CardSkeleton />
        </div>
      )}

      {/* Tabs */}
      {selectedHorse && !loading && (
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex gap-2 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6" key={`${selectedHorse.id}-${activeTab}`}>
            {activeTab === 'weight' && (
              <WeightTab horseId={selectedHorse.id} onToast={handleToast} />
            )}
            {activeTab === 'physical' && (
              <PhysicalExamTab horseId={selectedHorse.id} onToast={handleToast} />
            )}
            {activeTab === 'bloodtest' && (
              <BloodTestTab horseId={selectedHorse.id} onToast={handleToast} />
            )}
            {activeTab === 'care' && (
              <MedicalCareTab horseId={selectedHorse.id} onToast={handleToast} />
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default HorseMedicalPage
