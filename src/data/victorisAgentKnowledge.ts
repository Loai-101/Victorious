export type Horse = {
  id: string
  name: string
  gender: string
  breed: string
  age: number
  owner: string
  trainerId: string
  riderId: string
  country: string
  stable: string
  discipline: "Endurance"
  status: "Training" | "Racing" | "Recovery"
  performance: {
    trainingCountry: string
    conditioningLevel: string
    typicalPaceKmh: number
    hrRecoveryNote: string
    recentResults: string[]
    upcomingPlan: string
  }
  medical: {
    fitnessStatus: string
    lastVetCheck: string
    notes: string
  }
}

export type Trainer = {
  id: string
  name: string
  country: string
  specialization: string[]
  horses: string[] // horseIds
  riders: string[] // riderIds
  notes: string
}

export type Rider = {
  id: string
  name: string
  country: string
  feiLevel: "1*" | "2*" | "3*"
  weightKg?: number
  horses: string[] // horseIds
  strengths: string[]
  recentPerformances: string[]
  notes: string
}

export const victorisAgentKnowledge = {
  horses: [
    {
      id: "everest",
      name: "Everest",
      gender: "Mare",
      breed: "Arabian",
      age: 8,
      owner: "Sheikh Nasser bin Hamad",
      trainerId: "trainer1",
      riderId: "rider1",
      country: "Bahrain",
      stable: "Royal Stables",
      discipline: "Endurance",
      status: "Training",
      performance: {
        trainingCountry: "Bahrain",
        conditioningLevel: "Excellent",
        typicalPaceKmh: 22,
        hrRecoveryNote: "Recovers to baseline within 5 minutes after intense training",
        recentResults: [
          "1st Place - 120km Endurance Race, Bahrain (2024)",
          "2nd Place - 100km Championship, UAE (2024)",
          "3rd Place - 80km Training Event, KSA (2024)"
        ],
        upcomingPlan: "Preparing for 160km Championship in France (March 2025)"
      },
      medical: {
        fitnessStatus: "Optimal",
        lastVetCheck: "2025-01-15",
        notes: "All vitals normal. Excellent cardiovascular health. Recommended for competition."
      }
    },
    {
      id: "thunder",
      name: "Thunder",
      gender: "Stallion",
      breed: "Thoroughbred",
      age: 6,
      owner: "Sheikh Nasser bin Hamad",
      trainerId: "trainer1",
      riderId: "rider2",
      country: "Bahrain",
      stable: "Royal Stables",
      discipline: "Endurance",
      status: "Training",
      performance: {
        trainingCountry: "Bahrain",
        conditioningLevel: "Very Good",
        typicalPaceKmh: 25,
        hrRecoveryNote: "Recovers to baseline within 6 minutes",
        recentResults: [
          "2nd Place - 100km Endurance Race, Bahrain (2024)",
          "1st Place - 80km Training Event, KSA (2024)"
        ],
        upcomingPlan: "120km Championship preparation, UAE (February 2025)"
      },
      medical: {
        fitnessStatus: "Good",
        lastVetCheck: "2025-01-10",
        notes: "Minor muscle soreness noted. Rest day recommended."
      }
    },
    {
      id: "storm",
      name: "Storm",
      gender: "Gelding",
      breed: "Arabian",
      age: 10,
      owner: "Royal Family",
      trainerId: "trainer2",
      riderId: "rider3",
      country: "Saudi Arabia",
      stable: "Desert Stables",
      discipline: "Endurance",
      status: "Racing",
      performance: {
        trainingCountry: "Saudi Arabia",
        conditioningLevel: "Excellent",
        typicalPaceKmh: 20,
        hrRecoveryNote: "Recovers to baseline within 4 minutes",
        recentResults: [
          "1st Place - 160km Championship, KSA (2024)",
          "1st Place - 120km Endurance Race, UAE (2024)"
        ],
        upcomingPlan: "160km World Championship, France (March 2025)"
      },
      medical: {
        fitnessStatus: "Optimal",
        lastVetCheck: "2025-01-20",
        notes: "Peak condition. Ready for competition."
      }
    },
    {
      id: "phoenix",
      name: "Phoenix",
      gender: "Mare",
      breed: "Arabian",
      age: 7,
      owner: "Royal Family",
      trainerId: "trainer3",
      riderId: "rider4",
      country: "UAE",
      stable: "Emirates Stables",
      discipline: "Endurance",
      status: "Training",
      performance: {
        trainingCountry: "UAE",
        conditioningLevel: "Good",
        typicalPaceKmh: 21,
        hrRecoveryNote: "Recovers to baseline within 7 minutes",
        recentResults: [
          "3rd Place - 100km Endurance Race, UAE (2024)"
        ],
        upcomingPlan: "80km Training Event, UAE (February 2025)"
      },
      medical: {
        fitnessStatus: "Good",
        lastVetCheck: "2025-01-12",
        notes: "Regular checkup completed. All systems normal."
      }
    },
    {
      id: "blaze",
      name: "Blaze",
      gender: "Stallion",
      breed: "Thoroughbred",
      age: 5,
      owner: "Royal Family",
      trainerId: "trainer4",
      riderId: "rider5",
      country: "France",
      stable: "French Stables",
      discipline: "Endurance",
      status: "Recovery",
      performance: {
        trainingCountry: "France",
        conditioningLevel: "Recovering",
        typicalPaceKmh: 18,
        hrRecoveryNote: "Extended recovery time - under monitoring",
        recentResults: [
          "2nd Place - 80km Training Event, France (2024)"
        ],
        upcomingPlan: "Gradual return to training (March 2025)"
      },
      medical: {
        fitnessStatus: "Recovering",
        lastVetCheck: "2025-01-18",
        notes: "Post-injury recovery. Light exercise only. Progressing well."
      }
    },
    {
      id: "lightning",
      name: "Lightning",
      gender: "Mare",
      breed: "Arabian",
      age: 9,
      owner: "Royal Family",
      trainerId: "trainer5",
      riderId: "rider6",
      country: "Spain",
      stable: "Spanish Stables",
      discipline: "Endurance",
      status: "Training",
      performance: {
        trainingCountry: "Spain",
        conditioningLevel: "Very Good",
        typicalPaceKmh: 23,
        hrRecoveryNote: "Recovers to baseline within 5 minutes",
        recentResults: [
          "1st Place - 100km Endurance Race, Spain (2024)",
          "2nd Place - 120km Championship, France (2024)"
        ],
        upcomingPlan: "120km Championship, Spain (February 2025)"
      },
      medical: {
        fitnessStatus: "Optimal",
        lastVetCheck: "2025-01-14",
        notes: "Excellent condition. Ready for competition."
      }
    }
  ] as Horse[],
  
  trainers: [
    {
      id: "trainer1",
      name: "Ahmed Al-Khalifa",
      country: "Bahrain",
      specialization: ["Endurance Training", "Conditioning", "Performance Optimization"],
      horses: ["everest", "thunder"],
      riders: ["rider1", "rider2"],
      notes: "20+ years experience. Specializes in Arabian horses. Excellent track record."
    },
    {
      id: "trainer2",
      name: "Mohammed Al-Saud",
      country: "Saudi Arabia",
      specialization: ["Endurance Racing", "Long Distance", "Recovery Management"],
      horses: ["storm"],
      riders: ["rider3"],
      notes: "Championship-winning trainer. Expert in long-distance endurance events."
    },
    {
      id: "trainer3",
      name: "Fatima Al-Mansoori",
      country: "UAE",
      specialization: ["Young Horse Development", "Training Programs"],
      horses: ["phoenix"],
      riders: ["rider4"],
      notes: "Specializes in developing young endurance horses. Patient and methodical approach."
    },
    {
      id: "trainer4",
      name: "Jean-Pierre Dubois",
      country: "France",
      specialization: ["Recovery Programs", "Injury Rehabilitation", "Veterinary Coordination"],
      horses: ["blaze"],
      riders: ["rider5"],
      notes: "Expert in post-injury recovery and rehabilitation programs."
    },
    {
      id: "trainer5",
      name: "Carlos Rodriguez",
      country: "Spain",
      specialization: ["Competition Preparation", "Performance Analysis"],
      horses: ["lightning"],
      riders: ["rider6"],
      notes: "Focuses on competition readiness and performance optimization."
    }
  ] as Trainer[],
  
  riders: [
    {
      id: "rider1",
      name: "Khalid Al-Khalifa",
      country: "Bahrain",
      feiLevel: "3*",
      weightKg: 68,
      horses: ["everest"],
      strengths: ["Long distance", "Pace management", "Recovery strategy"],
      recentPerformances: [
        "1st Place - 120km Endurance Race, Bahrain (2024) - Everest",
        "2nd Place - 100km Championship, UAE (2024) - Everest"
      ],
      notes: "Experienced endurance rider. Excellent partnership with Everest."
    },
    {
      id: "rider2",
      name: "Sarah Al-Dosari",
      country: "Bahrain",
      feiLevel: "2*",
      weightKg: 62,
      horses: ["thunder"],
      strengths: ["Speed control", "Technical terrain"],
      recentPerformances: [
        "2nd Place - 100km Endurance Race, Bahrain (2024) - Thunder",
        "1st Place - 80km Training Event, KSA (2024) - Thunder"
      ],
      notes: "Rising talent. Strong technical skills."
    },
    {
      id: "rider3",
      name: "Omar Al-Sabah",
      country: "Saudi Arabia",
      feiLevel: "3*",
      weightKg: 72,
      horses: ["storm"],
      strengths: ["Championship experience", "Endurance strategy", "Horse management"],
      recentPerformances: [
        "1st Place - 160km Championship, KSA (2024) - Storm",
        "1st Place - 120km Endurance Race, UAE (2024) - Storm"
      ],
      notes: "Elite rider with multiple championship wins."
    },
    {
      id: "rider4",
      name: "Aisha Al-Zaabi",
      country: "UAE",
      feiLevel: "2*",
      weightKg: 58,
      horses: ["phoenix"],
      strengths: ["Young horse development", "Patience", "Communication"],
      recentPerformances: [
        "3rd Place - 100km Endurance Race, UAE (2024) - Phoenix"
      ],
      notes: "Specializes in developing partnerships with young horses."
    },
    {
      id: "rider5",
      name: "Pierre Martin",
      country: "France",
      feiLevel: "2*",
      weightKg: 70,
      horses: ["blaze"],
      strengths: ["Recovery riding", "Gentle approach"],
      recentPerformances: [
        "2nd Place - 80km Training Event, France (2024) - Blaze"
      ],
      notes: "Experienced in working with horses in recovery."
    },
    {
      id: "rider6",
      name: "Isabella Garcia",
      country: "Spain",
      feiLevel: "3*",
      weightKg: 65,
      horses: ["lightning"],
      strengths: ["Competition experience", "Tactical racing", "Horse welfare"],
      recentPerformances: [
        "1st Place - 100km Endurance Race, Spain (2024) - Lightning",
        "2nd Place - 120km Championship, France (2024) - Lightning"
      ],
      notes: "Top-level competitor with excellent horse management skills."
    }
  ] as Rider[],
  
  countries: ["Bahrain", "Saudi Arabia", "UAE", "France", "Spain"]
}
