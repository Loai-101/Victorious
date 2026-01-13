// Mock data for the application

export const mockUser = {
  id: 1,
  name: 'Sheikh Nasser bin Hamad',
  email: 'john@example.com',
  role: 'stable_owner', // 'horse_owner', 'stable_manager', 'stable_owner', 'admin'
  subscription: 'pro', // 'free', 'pro', 'enterprise'
  country: 'United States',
  city: 'New York',
  status: 'approved'
}

// Generate 200 horses with different locations
const horseNames = [
  'Thunder', 'Lightning', 'Storm', 'Blaze', 'Shadow', 'Midnight', 'Sunset', 'Aurora',
  'Phoenix', 'Dragon', 'Eagle', 'Falcon', 'Comet', 'Star', 'Moon', 'Sun',
  'River', 'Ocean', 'Mountain', 'Valley', 'Forest', 'Desert', 'Wind', 'Fire',
  'Ice', 'Snow', 'Rain', 'Cloud', 'Sky', 'Earth', 'Mars', 'Jupiter',
  'Apollo', 'Zeus', 'Athena', 'Hercules', 'Achilles', 'Odysseus', 'Spartan', 'Titan',
  'King', 'Queen', 'Prince', 'Princess', 'Duke', 'Duchess', 'Knight', 'Warrior',
  'Champion', 'Victory', 'Glory', 'Honor', 'Brave', 'Bold', 'Swift', 'Fast',
  'Noble', 'Royal', 'Majestic', 'Grand', 'Elegant', 'Graceful', 'Powerful', 'Strong',
  'Wild', 'Free', 'Spirit', 'Soul', 'Heart', 'Courage', 'Hope', 'Dream',
  'Legend', 'Myth', 'Epic', 'Hero', 'Star', 'Nova', 'Galaxy', 'Cosmos',
  'Ace', 'Jack', 'King', 'Queen', 'Joker', 'Ace', 'Deuce', 'Trey',
  'Diamond', 'Club', 'Heart', 'Spade', 'Lucky', 'Fortune', 'Chance', 'Destiny',
  'Arrow', 'Bow', 'Sword', 'Shield', 'Armor', 'Helmet', 'Crown', 'Scepter',
  'Ruby', 'Emerald', 'Sapphire', 'Diamond', 'Pearl', 'Opal', 'Topaz', 'Amber',
  'Crimson', 'Scarlet', 'Azure', 'Emerald', 'Golden', 'Silver', 'Bronze', 'Copper',
  'Thunderbolt', 'Lightning Strike', 'Storm Cloud', 'Blazing Fire', 'Shadow Walker', 'Midnight Rider',
  'Sunset Glory', 'Aurora Borealis', 'Phoenix Rising', 'Dragon Fire', 'Eagle Eye', 'Falcon Flight',
  'Comet Tail', 'Star Bright', 'Moon Beam', 'Sun Ray', 'River Flow', 'Ocean Wave',
  'Mountain Peak', 'Valley Deep', 'Forest Green', 'Desert Storm', 'Wind Rider', 'Fire Storm',
  'Ice Queen', 'Snow White', 'Rain Drop', 'Cloud Nine', 'Sky High', 'Earth Shaker'
]

const breeds = ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Paint', 'Appaloosa', 'Mustang', 'Friesian', 'Andalusian', 'Clydesdale', 'Percheron']
const feedTypesList = ['Premium Hay', 'Grain Mix', 'Alfalfa', 'Oats', 'Barley']
const genders = ['Stallion', 'Mare', 'Gelding']
const colors = ['Grey', 'Bay', 'Chestnut', 'Black', 'Palomino', 'Roan', 'Pinto', 'Dun']
const trainingLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
const enduranceIndexes = ['Excellent', 'Good', 'Average', 'Fair']
const disciplines = ['Endurance', 'Dressage', 'Jumping', 'Eventing', 'Racing']
const trainerNames = ['Ali Hussein Salman', 'Mohammed Al-Rashid', 'Fatima Al-Zahra', 'Ahmed Bin Khalid', 'Sarah Al-Mansoori']
const actualTrainerNames = ['Ali Hussein Salman', 'Mohammed Al-Rashid', 'Fatima Al-Zahra', 'Ahmed Bin Khalid', 'Sarah Al-Mansoori']
const stableNames = ['A1 Stable', 'Elite Stables', 'Victory Ranch', 'Royal Equestrian', 'Champion Stables']

// Country locations (latitude, longitude)
const countryLocations = {
  'Bahrain': [26.0667, 50.5577], // Manama
  'UAE': [24.4539, 54.3773], // Abu Dhabi
  'France': [48.8566, 2.3522], // Paris
  'Saudi Arabia': [24.7136, 46.6753], // Riyadh
  'Kuwait': [29.3759, 47.9774], // Kuwait City
  'Oman': [23.5859, 58.4059], // Muscat
  'Qatar': [25.2854, 51.5310], // Doha
  'Jordan': [31.9539, 35.9106], // Amman
  'Egypt': [30.0444, 31.2357], // Cairo
  'Turkey': [41.0082, 28.9784] // Istanbul
}

// Generate location based on country - deterministic based on index
const generateLocation = (country, index) => {
  const baseLocation = countryLocations[country] || [40.7128, -74.0060]
  // Use index to create consistent variation (0.01 to 0.19 range)
  const variation = ((index % 20) / 100) - 0.1
  return [
    baseLocation[0] + variation,
    baseLocation[1] + variation
  ]
}

// Assign countries to horses: 120 Bahrain, 60 UAE, 70 France = 250 total
// Remaining horses (if any) go to other countries
const assignCountry = (index) => {
  if (index < 120) return 'Bahrain' // First 120 horses
  if (index < 180) return 'UAE' // Next 60 horses (120 + 60 = 180)
  if (index < 250) return 'France' // Next 70 horses (180 + 70 = 250)
  // If more than 250, assign to other countries
  const otherCountries = Object.keys(countryLocations).filter(c => !['Bahrain', 'UAE', 'France'].includes(c))
  return otherCountries[index % otherCountries.length]
}

export const mockHorses = Array.from({ length: 250 }, (_, i) => {
  const country = assignCountry(i)
  const [lat, lng] = generateLocation(country, i)
  
  // Deterministic star rating based on index (70% 2-3 stars, 30% 1 star)
  const starRating = (i % 10) < 7 ? ((i % 2) === 0 ? 2 : 3) : 1
  
  // Deterministic age based on index (3-17 years)
  const age = 3 + (i % 15)
  const birthYear = new Date().getFullYear() - age
  const birthMonth = (i % 12) + 1
  const birthDay = (i % 28) + 1
  const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
  
  const feiHorseId = String(10000000 + i + 1)
  // Deterministic passport number
  const passportNum1 = (i * 7) % 100
  const passportChar1 = String.fromCharCode(65 + ((i * 3) % 26))
  const passportChar2 = String.fromCharCode(65 + ((i * 5) % 26))
  const passportNum2 = (i * 11) % 100
  const feiPassportNumber = `${passportNum1}${passportChar1}${passportChar2}${passportNum2}`
  const uelnNumber = `05600${String(i + 1).padStart(9, '0')}`
  
  // Deterministic values based on index
  const totalFeiRides = (i % 50) + 1
  const successRate = 0.7 + ((i % 20) / 100) // 0.7 to 0.89
  const successfulCompletions = Math.floor(totalFeiRides * successRate)
  const eliminations = totalFeiRides - successfulCompletions
  
  const maxSpeed = 20 + ((i % 15) * 0.8) // 20 to ~31.2
  const avgSpeed = maxSpeed * (0.6 + ((i % 20) / 100)) // 60-80% of max
  
  // Deterministic dates based on index
  const lastCompetitionDaysAgo = i % 60
  const lastCompetitionDate = new Date(Date.now() - lastCompetitionDaysAgo * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  
  const lastVetInspectionDaysAgo = i % 90
  const lastVetInspectionDate = new Date(Date.now() - lastVetInspectionDaysAgo * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  
  const registrationStart = new Date(2024, 0, 1)
  const registrationEnd = new Date(2025, 11, 31)
  
  const createdAtDaysAgo = i % 365
  const createdAt = new Date(Date.now() - createdAtDaysAgo * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  
  // Deterministic selections based on index
  const breedIndex = i % breeds.length
  const feedTypeIndex = i % feedTypesList.length
  const statusIndex = i % 5
  const vetStatusIndex = i % 3
  const healthStatusIndex = i % 3
  const lamenessIndex = i % 3
  const influenzaIndex = i % 3
  const medicalNotesIndex = i % 4
  const disciplineIndex = i % disciplines.length
  const enduranceIndex = i % enduranceIndexes.length
  const trainingLevelIndex = i % trainingLevels.length
  const trainingLoadIndex = i % 4
  const trainerIndex = i % trainerNames.length
  const stableIndex = i % stableNames.length
  const verifiedIndex = i % 2
  const notesIndex = i % 5
  
  // Deterministic live data values
  const currentHr = 120 + (i % 60)
  const maxHr = 160 + (i % 40)
  const avgHr = 110 + (i % 50)
  const speed = 10 + ((i % 30) * 0.9)
  const distance = (i % 50) * 0.8
  const recoveryTime = 2.5 + ((i % 10) * 0.1)
  const battery = 20 + (i % 80)
  const esimData = 30 + (i % 70)
  const distanceCovered = (i % 1000) * 0.8
  
  // Feed change date (deterministic)
  const feedChangeDaysAgo = i % 30
  const feedChangeDate = new Date(Date.now() - feedChangeDaysAgo * 24 * 60 * 60 * 1000)
  
  // Last data sync (deterministic)
  const lastDataSyncMinutesAgo = i % 1440
  const lastDataSync = new Date(Date.now() - lastDataSyncMinutesAgo * 60 * 1000)
    .toISOString().replace('T', ' ').substring(0, 16)
  
  return {
    id: i + 1,
    name: horseNames[i % horseNames.length] + (i >= horseNames.length ? ` ${Math.floor(i / horseNames.length) + 1}` : ''),
    age: age,
    breed: breeds[breedIndex],
    profileImage: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg',
    stars: starRating,
    feedType: feedTypesList[feedTypeIndex],
    feedChangeDate: feedChangeDate,
    pastRaces: totalFeiRides,
    distanceCovered: Math.floor(distanceCovered),
    country: country,
    location: { lat, lng },
    currentHr: currentHr,
    maxHr: maxHr,
    avgHr: avgHr,
    speed: Number(speed.toFixed(1)),
    distance: Number(distance.toFixed(1)),
    recoveryTime: recoveryTime,
    battery: battery,
    esimData: esimData,
    status: ['active', 'resting', 'training', 'racing', 'No connection'][statusIndex],
    // Detailed profile data
    profile: {
      feiHorseId: feiHorseId,
      feiPassportNumber: feiPassportNumber,
      uelnNumber: uelnNumber,
      dateOfBirth: dateOfBirth,
      gender: genders[i % genders.length],
      color: colors[i % colors.length],
      countryOfBirth: country,
      ownerName: 'Victorious Team',
      ownerFeiId: '10270512',
      nationalFederation: 'Bahrain (BRN)',
      registrationStatus: 'Active',
      registrationValidFrom: registrationStart.toISOString().split('T')[0],
      registrationValidTo: registrationEnd.toISOString().split('T')[0],
      lastVetInspectionDate: lastVetInspectionDate,
      veterinaryStatus: ['Fit', 'Under Observation', 'Recovering'][vetStatusIndex],
      heartHealthStatus: ['Normal', 'Good', 'Excellent'][healthStatusIndex],
      lamenessStatus: ['Clear', 'Minor', 'Monitoring'][lamenessIndex],
      medicationControlStatus: 'Clear',
      antiDopingStatus: 'Clear',
      influenzaVaccination: ['Valid', 'Expiring Soon', 'Valid'][influenzaIndex],
      medicalNotes: ['No issues', 'Regular checkups', 'Excellent health', 'Minor monitoring required'][medicalNotesIndex],
      discipline: disciplines[disciplineIndex],
      ceiStarLevel: starRating,
      maxDistanceCompleted: 50 + (i % 200),
      totalFeiRides: totalFeiRides,
      successfulCompletions: successfulCompletions,
      eliminations: eliminations,
      lastCompetitionDate: lastCompetitionDate,
      requiredRestPeriod: 7 + (i % 14),
      recoveryTime5min: 50 + (i % 30),
      recoveryTime10min: 45 + (i % 25),
      maxSpeed: maxSpeed.toFixed(1),
      enduranceIndex: enduranceIndexes[enduranceIndex],
      trainingLevel: trainingLevels[trainingLevelIndex],
      trainingLoadStatus: ['Optimal', 'High', 'Moderate', 'Low'][trainingLoadIndex],
      trainerName: trainerNames[trainerIndex],
      stableName: stableNames[stableIndex],
      heartRateDeviceId: `HR-ESP32-${String(i + 1).padStart(4, '0')}`,
      lastDataSync: lastDataSync,
      profileVerified: ['Yes', 'Pending'][verifiedIndex],
      verifiedBy: 'Admin',
      createdAt: createdAt,
      updatedAt: new Date().toISOString().split('T')[0],
      notes: ['Ready for CEI3*', 'Training well', 'Excellent performance', 'Monitor recovery', 'Top performer'][notesIndex]
    }
  }
})

// Generate 120 riders with FEI qualification data
const riderNames = [
  'Ahmed Al-Mansoori', 'Fatima Al-Zahra', 'Mohammed bin Rashid', 'Sarah Al-Khalifa',
  'Khalid Al-Saud', 'Noor Al-Dosari', 'Omar Al-Hashimi', 'Layla Al-Mazrouei',
  'Youssef Al-Ghamdi', 'Aisha Al-Mutawa', 'Hassan Al-Qasimi', 'Mariam Al-Shamsi',
  'Ibrahim Al-Nuaimi', 'Zainab Al-Falasi', 'Tariq Al-Mazrouei', 'Hala Al-Dhaheri',
  'Faisal Al-Suwaidi', 'Rania Al-Kaabi', 'Saeed Al-Mansoori', 'Dina Al-Hosani',
  'Majid Al-Rashid', 'Lina Al-Mazrouei', 'Nasser Al-Dosari', 'Sara Al-Khalifa',
  'Hamad Al-Saud', 'Nada Al-Zahra', 'Rashid Al-Hashimi', 'Mona Al-Ghamdi',
  'Sultan Al-Qasimi', 'Hanan Al-Shamsi', 'Badr Al-Nuaimi', 'Reem Al-Falasi',
  'Zayed Al-Mazrouei', 'Laila Al-Dhaheri', 'Khalifa Al-Suwaidi', 'Noor Al-Kaabi',
  'Mansoor Al-Hosani', 'Amira Al-Rashid', 'Saif Al-Mazrouei', 'Yara Al-Dosari'
]

const starLevels = [1, 2, 3]
const qualificationStatuses = ['Qualified', 'Not Qualified', 'Suspended']

export const mockRiders = Array.from({ length: 120 }, (_, i) => {
  // Deterministic values based on index
  const starLevel = starLevels[i % starLevels.length]
  
  // Better mix of qualification statuses: 70% Qualified, 20% Not Qualified, 10% Suspended
  // Use modulo 10 to create distribution: 0-6 = Qualified, 7-8 = Not Qualified, 9 = Suspended
  const statusIndex = i % 10
  let qualificationStatus
  if (statusIndex < 7) {
    qualificationStatus = 'Qualified' // 70% (0-6)
  } else if (statusIndex < 9) {
    qualificationStatus = 'Not Qualified' // 20% (7-8)
  } else {
    qualificationStatus = 'Suspended' // 10% (9)
  }
  
  // Deterministic dates based on index
  const qualificationDaysAgo = i % 730
  const qualificationDate = qualificationStatus === 'Qualified'
    ? new Date(Date.now() - qualificationDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null
  
  // 70% have expiry date (deterministic)
  const hasExpiry = (i % 10) < 7
  const expiryDaysAhead = i % 365
  const expiryDate = qualificationStatus === 'Qualified' && hasExpiry
    ? new Date(Date.now() + expiryDaysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null
  
  const minCompletedRides = starLevel === 1 ? 3 : starLevel === 2 ? 5 : 8
  const minDistanceKm = starLevel === 1 ? 40 : starLevel === 2 ? 80 : 120
  const maxAllowedSpeed = starLevel === 1 ? 20 : starLevel === 2 ? 25 : 30
  const minRestPeriodDays = starLevel === 1 ? 7 : starLevel === 2 ? 10 : 14
  
  const feiReferenceCode = `FEI-END-${String(1000000 + i + 1).padStart(7, '0')}`
  
  const createdAtDaysAgo = i % 365
  const createdAt = new Date(Date.now() - createdAtDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const updatedAt = new Date().toISOString().split('T')[0]
  
  // Deterministic rider details
  const age = 20 + (i % 20)
  const weight = 60 + (i % 30)
  const height = 160 + (i % 30)
  const experienceYears = 5 + (i % 20)
  const teamIndex = i % 4
  
  return {
    id: i + 1,
    fei_id: `FEI${String(10000000 + i + 1).padStart(8, '0')}`,
    discipline: disciplines[0], // Use 'Endurance' from existing disciplines array
    star_level: starLevel,
    qualification_status: qualificationStatus,
    qualification_date: qualificationDate,
    expiry_date: expiryDate,
    min_completed_rides: minCompletedRides,
    min_distance_km: minDistanceKm,
    max_allowed_speed: maxAllowedSpeed,
    min_rest_period_days: minRestPeriodDays,
    fei_reference_code: feiReferenceCode,
    notes: qualificationStatus === 'Qualified' 
      ? `Qualified for CEI${starLevel}* competitions`
      : qualificationStatus === 'Suspended'
      ? 'Suspended due to violation'
      : 'Pending qualification',
    created_at: createdAt,
    updated_at: updatedAt,
    // Keep old fields for backward compatibility
    name: riderNames[i % riderNames.length] + (i >= riderNames.length ? ` ${Math.floor(i / riderNames.length) + 1}` : ''),
    age: age,
    weight: weight,
    height: height,
    experience: `${experienceYears} years`,
    teamName: ['Elite Riders', 'Victorious Team', 'Champions Stable', 'Royal Riders'][teamIndex]
  }
})

export const mockTrainers = [
  {
    id: 1,
    name: 'Ali Hussein Salman',
    profileImage: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg',
    feiId: '10207821',
    gender: 'Male',
    dateOfBirth: '1985-06-18',
    nationality: 'Bahrain',
    discipline: 'Endurance',
    trainerType: 'FEI Registered',
    status: 'Active',
    yearsOfExperience: 12,
    specialization: 'Endurance Conditioning',
    languagesSpoken: 'Arabic, English',
    feiCertificationLevel: 'Level 2',
    certificationNumber: 'FEI-TR-88921',
    certificationValidFrom: '2023-01-01',
    certificationValidTo: '2026-12-31',
    nationalFederationLicense: 'Valid',
    stableName: 'A1 Stable',
    stableCountry: 'Bahrain',
    clubTeamName: 'A1 Endurance Team',
    nationalFederation: 'BRN',
    totalActiveHorses: 8,
    feiHorsesCount: 5,
    horseFeiIds: ['12345678', '87654321', '11223344', '44332211', '55667788'],
    assignedRiders: 4,
    feiEventsTrained: 18,
    ceiLevelsCoached: '1★, 2★',
    maxDistanceTrained: 120,
    successfulCompletions: 14,
    eliminations: 4,
    trainingStyle: 'Progressive Endurance',
    preferredTrainingType: 'Long Distance + Recovery',
    averageCompletionRate: 78,
    injuryRate: 'Low',
    hrMonitoringUsed: 'Yes',
    vetCollaboration: 'Yes',
    injuryPreventionProgram: 'Active',
    recoveryProtocolUsed: 'Yes',
    welfareComplianceStatus: 'Compliant',
    phoneNumber: '+973 3XXXXXXX',
    emailAddress: 'trainer@a1stable.com',
    emergencyContact: 'Stable Manager',
    profileVerified: 'Yes',
    verifiedBy: 'Admin',
    createdAt: '2025-11-20',
    updatedAt: '2026-01-15',
    notes: 'Approved for CEI2* events'
  },
  {
    id: 2,
    name: 'Mohammed Al-Rashid',
    profileImage: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg',
    feiId: '10207822',
    gender: 'Male',
    dateOfBirth: '1988-03-25',
    nationality: 'UAE',
    discipline: 'Endurance',
    trainerType: 'FEI Registered',
    status: 'Active',
    yearsOfExperience: 10,
    specialization: 'Speed Training',
    languagesSpoken: 'Arabic, English, French',
    feiCertificationLevel: 'Level 1',
    certificationNumber: 'FEI-TR-88922',
    certificationValidFrom: '2022-06-01',
    certificationValidTo: '2025-05-31',
    nationalFederationLicense: 'Valid',
    stableName: 'Elite Stables',
    stableCountry: 'UAE',
    clubTeamName: 'Elite Endurance Team',
    nationalFederation: 'UAE',
    totalActiveHorses: 12,
    feiHorsesCount: 8,
    horseFeiIds: ['22334455', '55443322', '66778899', '99887766', '11223344', '44332211', '55667788', '88776655'],
    assignedRiders: 6,
    feiEventsTrained: 25,
    ceiLevelsCoached: '1★, 2★, 3★',
    maxDistanceTrained: 160,
    successfulCompletions: 20,
    eliminations: 5,
    trainingStyle: 'Intensive Speed',
    preferredTrainingType: 'Speed + Endurance',
    averageCompletionRate: 80,
    injuryRate: 'Very Low',
    hrMonitoringUsed: 'Yes',
    vetCollaboration: 'Yes',
    injuryPreventionProgram: 'Active',
    recoveryProtocolUsed: 'Yes',
    welfareComplianceStatus: 'Compliant',
    phoneNumber: '+971 5XXXXXXX',
    emailAddress: 'mohammed@elitestables.com',
    emergencyContact: 'Stable Owner',
    profileVerified: 'Yes',
    verifiedBy: 'Admin',
    createdAt: '2022-05-15',
    updatedAt: '2026-01-10',
    notes: 'Expert in CEI3* training'
  },
  {
    id: 3,
    name: 'Fatima Al-Zahra',
    profileImage: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg',
    feiId: '10207823',
    gender: 'Female',
    dateOfBirth: '1990-09-12',
    nationality: 'Bahrain',
    discipline: 'Endurance',
    trainerType: 'FEI Registered',
    status: 'Active',
    yearsOfExperience: 8,
    specialization: 'Recovery & Rehabilitation',
    languagesSpoken: 'Arabic, English',
    feiCertificationLevel: 'Level 2',
    certificationNumber: 'FEI-TR-88923',
    certificationValidFrom: '2024-01-15',
    certificationValidTo: '2027-01-14',
    nationalFederationLicense: 'Valid',
    stableName: 'Victory Ranch',
    stableCountry: 'Bahrain',
    clubTeamName: 'Victory Endurance Team',
    nationalFederation: 'BRN',
    totalActiveHorses: 6,
    feiHorsesCount: 4,
    horseFeiIds: ['33445566', '66554433', '77889900', '00998877'],
    assignedRiders: 3,
    feiEventsTrained: 15,
    ceiLevelsCoached: '1★, 2★',
    maxDistanceTrained: 100,
    successfulCompletions: 12,
    eliminations: 3,
    trainingStyle: 'Gentle Progressive',
    preferredTrainingType: 'Recovery Focused',
    averageCompletionRate: 80,
    injuryRate: 'Very Low',
    hrMonitoringUsed: 'Yes',
    vetCollaboration: 'Yes',
    injuryPreventionProgram: 'Active',
    recoveryProtocolUsed: 'Yes',
    welfareComplianceStatus: 'Compliant',
    phoneNumber: '+973 3YYYYYYY',
    emailAddress: 'fatima@victoryranch.com',
    emergencyContact: 'Ranch Manager',
    profileVerified: 'Yes',
    verifiedBy: 'Admin',
    createdAt: '2023-12-10',
    updatedAt: '2026-01-12',
    notes: 'Specialized in horse recovery programs'
  },
  {
    id: 4,
    name: 'Ahmed Bin Khalid',
    profileImage: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg',
    feiId: '10207824',
    gender: 'Male',
    dateOfBirth: '1982-11-30',
    nationality: 'Saudi Arabia',
    discipline: 'Endurance',
    trainerType: 'FEI Registered',
    status: 'Active',
    yearsOfExperience: 15,
    specialization: 'Long Distance Endurance',
    languagesSpoken: 'Arabic, English',
    feiCertificationLevel: 'Level 3',
    certificationNumber: 'FEI-TR-88924',
    certificationValidFrom: '2021-03-01',
    certificationValidTo: '2026-02-28',
    nationalFederationLicense: 'Valid',
    stableName: 'Royal Equestrian',
    stableCountry: 'Saudi Arabia',
    clubTeamName: 'Royal Endurance Team',
    nationalFederation: 'KSA',
    totalActiveHorses: 15,
    feiHorsesCount: 10,
    horseFeiIds: ['44556677', '77665544', '88990011', '11009988', '22334455', '55443322', '66778899', '99887766', '11223344', '44332211'],
    assignedRiders: 8,
    feiEventsTrained: 35,
    ceiLevelsCoached: '1★, 2★, 3★, 4★',
    maxDistanceTrained: 200,
    successfulCompletions: 28,
    eliminations: 7,
    trainingStyle: 'Ultra Distance',
    preferredTrainingType: 'Ultra Distance + Recovery',
    averageCompletionRate: 80,
    injuryRate: 'Low',
    hrMonitoringUsed: 'Yes',
    vetCollaboration: 'Yes',
    injuryPreventionProgram: 'Active',
    recoveryProtocolUsed: 'Yes',
    welfareComplianceStatus: 'Compliant',
    phoneNumber: '+966 5ZZZZZZZ',
    emailAddress: 'ahmed@royalequestrian.com',
    emergencyContact: 'Stable Director',
    profileVerified: 'Yes',
    verifiedBy: 'Admin',
    createdAt: '2021-02-20',
    updatedAt: '2026-01-08',
    notes: 'Master trainer for CEI4* events'
  },
  {
    id: 5,
    name: 'Sarah Al-Mansoori',
    profileImage: 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg',
    feiId: '10207825',
    gender: 'Female',
    dateOfBirth: '1992-07-08',
    nationality: 'UAE',
    discipline: 'Endurance',
    trainerType: 'FEI Registered',
    status: 'Active',
    yearsOfExperience: 6,
    specialization: 'Youth Training',
    languagesSpoken: 'Arabic, English, French',
    feiCertificationLevel: 'Level 1',
    certificationNumber: 'FEI-TR-88925',
    certificationValidFrom: '2023-09-01',
    certificationValidTo: '2026-08-31',
    nationalFederationLicense: 'Valid',
    stableName: 'Champion Stables',
    stableCountry: 'UAE',
    clubTeamName: 'Champion Youth Team',
    nationalFederation: 'UAE',
    totalActiveHorses: 5,
    feiHorsesCount: 3,
    horseFeiIds: ['55667788', '88776655', '99001122'],
    assignedRiders: 2,
    feiEventsTrained: 10,
    ceiLevelsCoached: '1★',
    maxDistanceTrained: 80,
    successfulCompletions: 8,
    eliminations: 2,
    trainingStyle: 'Youth Focused',
    preferredTrainingType: 'Progressive Youth Training',
    averageCompletionRate: 80,
    injuryRate: 'Very Low',
    hrMonitoringUsed: 'Yes',
    vetCollaboration: 'Yes',
    injuryPreventionProgram: 'Active',
    recoveryProtocolUsed: 'Yes',
    welfareComplianceStatus: 'Compliant',
    phoneNumber: '+971 5AAAAAAA',
    emailAddress: 'sarah@championstables.com',
    emergencyContact: 'Youth Coordinator',
    profileVerified: 'Yes',
    verifiedBy: 'Admin',
    createdAt: '2023-08-25',
    updatedAt: '2026-01-14',
    notes: 'Specialized in training young horses and riders'
  }
]

// Generate live data for a horse - deterministic based on horse ID
export const generateLiveData = (horse) => {
  const baseLat = horse.location?.lat || 40.7128
  const baseLng = horse.location?.lng || -74.0060
  const horseId = horse.id || 1
  
  // Generate deterministic route around the horse's location
  const route = Array.from({ length: 10 }, (_, i) => {
    const variation = ((horseId * 7 + i * 3) % 100) / 10000 - 0.005
    return [
      baseLat + variation,
      baseLng + variation
    ]
  })
  
  // Use horse's existing data or deterministic defaults
  const baseHr = horse.avgHr || 135
  const baseSpeed = horse.speed || 25.5
  const baseRecovery = horse.recoveryTime || 2.5
  
  return {
    horseId: horse.id,
    horseName: horse.name,
    currentHr: horse.currentHr || 145,
    maxHr: horse.maxHr || 180,
    avgHr: horse.avgHr || 135,
    speed: horse.speed || 25.5,
    distance: horse.distance || 12.3,
    recoveryTime: horse.recoveryTime || 2.5,
    battery: horse.battery || 85,
    esimData: horse.esimData || 72,
    location: horse.location,
    heartRateHistory: Array.from({ length: 30 }, (_, i) => {
      // Create realistic heart rate pattern: warm-up, activity, recovery
      const progress = i / 29 // 0 to 1
      const horseSeed = (horseId * 7) % 100
      
      // Base pattern: gradual increase, then plateau, then gradual decrease
      let hrValue
      if (progress < 0.2) {
        // Warm-up phase: gradual increase from resting to active
        const warmupProgress = progress / 0.2
        hrValue = baseHr * 0.7 + (baseHr * 0.3 * warmupProgress)
      } else if (progress < 0.7) {
        // Active phase: maintain elevated HR with natural variation
        hrValue = baseHr * (0.95 + (horseSeed % 10) / 100)
      } else {
        // Recovery phase: gradual decrease
        const recoveryProgress = (progress - 0.7) / 0.3
        hrValue = baseHr * (0.95 - 0.25 * recoveryProgress)
      }
      
      // Add natural variation (smooth, not random jumps)
      const smoothVariation = Math.sin((i + horseSeed) * 0.5) * 8 + 
                              Math.cos((i * 2 + horseSeed) * 0.3) * 5 +
                              ((horseSeed + i * 3) % 7) - 3
      
      // Add occasional peaks (intense moments)
      const peakChance = (horseSeed + i * 5) % 20
      if (peakChance === 0 && progress > 0.2 && progress < 0.7) {
        hrValue += 15 + (horseSeed % 10)
      }
      
      // Ensure realistic bounds (horses: 30-240 bpm)
      hrValue = Math.max(30, Math.min(240, Math.round(hrValue + smoothVariation)))
      
      return {
        time: i,
        hr: hrValue
      }
    }),
    speedHistory: Array.from({ length: 30 }, (_, i) => {
      const speedVariation = ((horseId * 13 + i * 5) % 10) - 5
      const hrVariation = ((horseId * 17 + i * 3) % 20) - 10
      return {
        time: i,
        speed: baseSpeed + speedVariation,
        hr: baseHr + hrVariation
      }
    }),
    recoveryHistory: Array.from({ length: 20 }, (_, i) => {
      const variation = ((horseId * 19 + i * 11) % 5) - 2.5
      return {
        day: i + 1,
        time: baseRecovery + variation
      }
    }),
    route: route
  }
}

export const mockLiveData = generateLiveData(mockHorses[0])

export const mockTrainingSchedule = [
  { id: 1, day: 'Monday', feed: 'Premium Hay', distance: 5, duration: 60, exercise: 'Endurance' },
  { id: 2, day: 'Tuesday', feed: 'Grain Mix', distance: 3, duration: 45, exercise: 'Speed' },
  { id: 3, day: 'Wednesday', feed: 'Premium Hay', distance: 8, duration: 90, exercise: 'Endurance' },
  { id: 4, day: 'Thursday', feed: 'Grain Mix', distance: 4, duration: 50, exercise: 'Recovery' },
  { id: 5, day: 'Friday', feed: 'Premium Hay', distance: 6, duration: 70, exercise: 'Mixed' },
  { id: 6, day: 'Saturday', feed: 'Grain Mix', distance: 7, duration: 80, exercise: 'Endurance' },
  { id: 7, day: 'Sunday', feed: 'Premium Hay', distance: 2, duration: 30, exercise: 'Recovery' }
]

export const mockDeviceApprovals = [
  {
    id: 1,
    userName: 'Sheikh Nasser bin Hamad',
    email: 'john@example.com',
    country: 'United States',
    status: 'pending',
    submittedDate: '2024-01-15'
  },
  {
    id: 2,
    userName: 'Jane Smith',
    email: 'jane@example.com',
    country: 'Canada',
    status: 'pending',
    submittedDate: '2024-01-16'
  },
  {
    id: 3,
    userName: 'Ahmed Ali',
    email: 'ahmed@example.com',
    country: 'Saudi Arabia',
    status: 'approved',
    submittedDate: '2024-01-10'
  }
]

export const mockUsers = [
  { id: 1, name: 'Sheikh Nasser bin Hamad', email: 'john@example.com', role: 'stable_owner', subscription: 'pro' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'stable_manager', subscription: 'free' },
  { id: 3, name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'horse_owner', subscription: 'enterprise' }
]

export const mockBatteryMonitoring = [
  { deviceId: 'DEV001', battery: 95, lastUpdate: '2 hours ago' },
  { deviceId: 'DEV002', battery: 78, lastUpdate: '1 hour ago' },
  { deviceId: 'DEV003', battery: 45, lastUpdate: '30 minutes ago' },
  { deviceId: 'DEV004', battery: 23, lastUpdate: '15 minutes ago' }
]

export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' }
]

export const cities = {
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  'SA': ['Riyadh', 'Jeddah', 'Mecca', 'Medina'],
  'FR': ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  'GB': ['London', 'Manchester', 'Birmingham', 'Liverpool']
}

export const feedTypes = [
  'Premium Hay',
  'Grain Mix',
  'Alfalfa',
  'Oats',
  'Barley'
]
