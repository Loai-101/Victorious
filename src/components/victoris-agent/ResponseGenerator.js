import { victorisAgentKnowledge } from '../../data/victorisAgentKnowledge'

export const getHorseProfile = (horseName) => {
  const horse = victorisAgentKnowledge.horses.find(
    h => h.name.toLowerCase() === horseName.toLowerCase()
  )

  if (!horse) {
    return `I'm sorry, I don't have information about a horse named "${horseName}". Please check the spelling or ask about another horse.`
  }

  const trainer = victorisAgentKnowledge.trainers.find(t => t.id === horse.trainerId)
  const rider = victorisAgentKnowledge.riders.find(r => r.id === horse.riderId)

  return `Horse Details

Name: ${horse.name}
Gender: ${horse.gender}
Breed: ${horse.breed}
Age: ${horse.age} years
Owner: ${horse.owner}
Trainer: ${trainer?.name || 'Not assigned'}
Rider: ${rider?.name || 'Not assigned'}
Country / Stable: ${horse.country} / ${horse.stable}
Discipline: ${horse.discipline}
Status: ${horse.status}

Performance & Training

Training Country: ${horse.performance.trainingCountry}
Conditioning Level: ${horse.performance.conditioningLevel}
Typical Pace: ${horse.performance.typicalPaceKmh} km/h
HR Recovery Profile: ${horse.performance.hrRecoveryNote}

Recent Results:
${horse.performance.recentResults.map(r => `• ${r}`).join('\n')}

Upcoming Plan: ${horse.performance.upcomingPlan}

Medical Overview

Fitness Status: ${horse.medical.fitnessStatus}
Last Vet Check: ${horse.medical.lastVetCheck}
Notes: ${horse.medical.notes}`
}

export const getTrainingReportByCountry = () => {
  const horsesInTraining = victorisAgentKnowledge.horses.filter(
    h => h.status === 'Training'
  )

  if (horsesInTraining.length === 0) {
    return "There are currently no horses in training status."
  }

  const groupedByCountry = {}
  horsesInTraining.forEach(horse => {
    if (!groupedByCountry[horse.country]) {
      groupedByCountry[horse.country] = []
    }
    groupedByCountry[horse.country].push(horse)
  })

  let report = "Horses in Training - Report by Country\n\n"

  victorisAgentKnowledge.countries.forEach(country => {
    const horses = groupedByCountry[country] || []
    if (horses.length > 0) {
      report += `${country}\n`
      report += "─".repeat(50) + "\n"
      horses.forEach(horse => {
        const trainer = victorisAgentKnowledge.trainers.find(t => t.id === horse.trainerId)
        const rider = victorisAgentKnowledge.riders.find(r => r.id === horse.riderId)
        report += `\nHorse Name: ${horse.name}\n`
        report += `Assigned Trainer: ${trainer?.name || 'Not assigned'}\n`
        report += `Assigned Rider: ${rider?.name || 'Not assigned'}\n`
        report += `Discipline: ${horse.discipline}\n`
        report += `Status: ${horse.status}\n`
        report += "\n"
      })
    }
  })

  return report
}

export const getTrainersReport = () => {
  let report = "Trainers Report\n\n"

  victorisAgentKnowledge.trainers.forEach(trainer => {
    const horses = victorisAgentKnowledge.horses.filter(h => trainer.horses.includes(h.id))
    const riders = victorisAgentKnowledge.riders.filter(r => trainer.riders.includes(r.id))

    report += `Trainer Name: ${trainer.name}\n`
    report += `Country: ${trainer.country}\n`
    report += `Specialization: ${trainer.specialization.join(', ')}\n`
    report += `Horses under Training: ${horses.map(h => h.name).join(', ') || 'None'}\n`
    report += `Riders working with: ${riders.map(r => r.name).join(', ') || 'None'}\n`
    report += `Notes: ${trainer.notes}\n`
    report += "\n" + "─".repeat(50) + "\n\n"
  })

  return report
}

export const getRidersReport = () => {
  let report = "Riders Report\n\n"

  victorisAgentKnowledge.riders.forEach(rider => {
    const horses = victorisAgentKnowledge.horses.filter(h => rider.horses.includes(h.id))

    report += `Rider Name: ${rider.name}\n`
    report += `Nationality / Country: ${rider.country}\n`
    report += `FEI Level: ${rider.feiLevel}\n`
    if (rider.weightKg) {
      report += `Weight: ${rider.weightKg} kg\n`
    }
    report += `Assigned Horses: ${horses.map(h => h.name).join(', ') || 'None'}\n`
    report += `Riding Style / Strengths: ${rider.strengths.join(', ')}\n`
    report += `Recent Performances:\n${rider.recentPerformances.map(p => `• ${p}`).join('\n')}\n`
    report += `Notes: ${rider.notes}\n`
    report += "\n" + "─".repeat(50) + "\n\n"
  })

  return report
}

export const getRiderProfile = (riderName) => {
  const rider = victorisAgentKnowledge.riders.find(
    r => r.name.toLowerCase().includes(riderName.toLowerCase())
  )

  if (!rider) {
    return `I'm sorry, I don't have information about a rider named "${riderName}". Please check the spelling or ask about another rider.`
  }

  const horses = victorisAgentKnowledge.horses.filter(h => rider.horses.includes(h.id))

  let profile = `Rider Profile

Rider Name: ${rider.name}
Nationality / Country: ${rider.country}
FEI Level: ${rider.feiLevel}
${rider.weightKg ? `Weight: ${rider.weightKg} kg\n` : ''}
Assigned Horses: ${horses.map(h => h.name).join(', ') || 'None'}

Riding Style / Strengths:
${rider.strengths.map(s => `• ${s}`).join('\n')}

Recent Performances:
${rider.recentPerformances.map(p => `• ${p}`).join('\n')}

Notes: ${rider.notes}`

  return profile
}

export const processMessage = (message) => {
  const lowerMessage = message.toLowerCase().trim()

  // Greeting
  if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/)) {
    return "Welcome, Sheikh Nasser bin Hamad. I am ready to assist you with all your inquiries."
  }

  // Horses in training report - check this FIRST before horse name matching
  if ((lowerMessage.includes('horses') && (lowerMessage.includes('training') || lowerMessage.includes('in training'))) ||
      lowerMessage.includes('horses in training') ||
      lowerMessage.match(/report.*horses.*training|horses.*training.*report/i)) {
    return getTrainingReportByCountry()
  }

  // Trainers report - check this BEFORE horse name matching
  if (lowerMessage.includes('trainer')) {
    // Check for specific trainer first
    const trainerMatch = lowerMessage.match(/tell me about (?:the )?trainer ([a-z\s]+)|about (?:the )?trainer ([a-z\s]+)/i)
    if (trainerMatch) {
      const trainerName = (trainerMatch[1] || trainerMatch[2])?.trim()
      if (trainerName && trainerName.length > 2) {
        const trainer = victorisAgentKnowledge.trainers.find(
          t => t.name.toLowerCase().includes(trainerName.toLowerCase())
        )
        if (trainer) {
          const horses = victorisAgentKnowledge.horses.filter(h => trainer.horses.includes(h.id))
          const riders = victorisAgentKnowledge.riders.filter(r => trainer.riders.includes(r.id))
          return `Trainer Profile

Name: ${trainer.name}
Country: ${trainer.country}
Specialization: ${trainer.specialization.join(', ')}
Horses under Training: ${horses.map(h => h.name).join(', ') || 'None'}
Riders working with: ${riders.map(r => r.name).join(', ') || 'None'}
Notes: ${trainer.notes}`
        }
      }
    }
    // If it's just "trainers" or "the trainers", return full report
    if (lowerMessage.match(/tell me about (?:the )?trainers?|about (?:the )?trainers?/i)) {
      return getTrainersReport()
    }
    return getTrainersReport()
  }

  // Riders report - check this BEFORE horse name matching
  if (lowerMessage.includes('rider')) {
    // Check for specific rider first
    const riderMatch = lowerMessage.match(/tell me about (?:the )?rider ([a-z\s]+)|about (?:the )?rider ([a-z\s]+)/i)
    if (riderMatch) {
      const riderName = (riderMatch[1] || riderMatch[2])?.trim()
      if (riderName && riderName.length > 2) {
        return getRiderProfile(riderName)
      }
    }
    // If it's just "riders" or "the riders", return full report
    if (lowerMessage.match(/tell me about (?:the )?riders?|about (?:the )?riders?/i)) {
      return getRidersReport()
    }
    return getRidersReport()
  }

  // Ask about specific horse (Everest) - check for exact match
  if (lowerMessage.includes('everest')) {
    return getHorseProfile('Everest')
  }

  // Ask about any horse - but only if it's clearly asking about a horse
  const horseMatch = lowerMessage.match(/tell me about (?:horse )?([a-z]+)|about (?:horse )?([a-z]+)/i)
  if (horseMatch) {
    const horseName = (horseMatch[1] || horseMatch[2])?.trim()
    // Only process if it's not a common word and looks like a horse name
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    if (horseName && !commonWords.includes(horseName.toLowerCase()) && horseName.length > 2) {
      // Check if it's actually a horse name
      const horse = victorisAgentKnowledge.horses.find(
        h => h.name.toLowerCase() === horseName.toLowerCase()
      )
      if (horse) {
        return getHorseProfile(horseName)
      }
    }
  }

  // Default response
  return "I'm here to help you with information about horses, trainers, and riders. You can ask me about:\n\n• Specific horses (e.g., 'Tell me about Everest')\n• Horses in training (e.g., 'Give me a report about the horses in training')\n• Trainers (e.g., 'Tell me about the trainers')\n• Riders (e.g., 'Tell me about the riders')\n\nHow can I assist you?"
}
