// LocalStorage service for horse medical data

export const localStorageService = {
  // Weight data
  getWeights: (horseId) => {
    const key = `horse_medical_${horseId}_weights`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },

  saveWeight: (horseId, weightData) => {
    const key = `horse_medical_${horseId}_weights`
    const weights = localStorageService.getWeights(horseId)
    const newWeight = {
      id: Date.now(),
      ...weightData,
      createdAt: new Date().toISOString()
    }
    weights.unshift(newWeight) // Add to beginning
    localStorage.setItem(key, JSON.stringify(weights))
    return newWeight
  },

  // Physical examination visits
  getVisits: (horseId) => {
    const key = `horse_medical_${horseId}_visits`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },

  saveVisit: (horseId, visitData) => {
    const key = `horse_medical_${horseId}_visits`
    const visits = localStorageService.getVisits(horseId)
    const newVisit = {
      id: Date.now(),
      ...visitData,
      createdAt: new Date().toISOString()
    }
    visits.unshift(newVisit) // Add to beginning
    localStorage.setItem(key, JSON.stringify(visits))
    return newVisit
  },

  // Blood tests
  getBloodTests: (horseId) => {
    const key = `horse_medical_${horseId}_bloodtests`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },

  saveBloodTest: (horseId, testData) => {
    const key = `horse_medical_${horseId}_bloodtests`
    const tests = localStorageService.getBloodTests(horseId)
    const newTest = {
      id: Date.now(),
      ...testData,
      createdAt: new Date().toISOString()
    }
    tests.unshift(newTest) // Add to beginning
    localStorage.setItem(key, JSON.stringify(tests))
    return newTest
  },

  // Medical care history
  getMedicalCare: (horseId) => {
    const key = `horse_medical_${horseId}_care`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {
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
  },

  saveMedicalCare: (horseId, category, careData) => {
    const key = `horse_medical_${horseId}_care`
    const care = localStorageService.getMedicalCare(horseId)
    const newEntry = {
      id: Date.now(),
      ...careData,
      createdAt: new Date().toISOString()
    }
    if (!care[category]) {
      care[category] = []
    }
    care[category].unshift(newEntry)
    localStorage.setItem(key, JSON.stringify(care))
    return newEntry
  },

  // Reset demo data for a horse
  resetHorseData: (horseId) => {
    const keys = [
      `horse_medical_${horseId}_weights`,
      `horse_medical_${horseId}_visits`,
      `horse_medical_${horseId}_bloodtests`,
      `horse_medical_${horseId}_care`
    ]
    keys.forEach(key => localStorage.removeItem(key))
  }
}
