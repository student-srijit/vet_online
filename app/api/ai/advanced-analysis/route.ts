import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDB()
    const recordsCollection = db.collection("health_records")
    const usersCollection = db.collection("users")
    
    // Get user and pet data
    const user = await usersCollection.findOne(
      { _id: new (await import("mongodb")).ObjectId(userId) },
      { projection: { pets: 1 } }
    )

    if (!user || !user.pets || user.pets.length === 0) {
      return NextResponse.json({ error: "No pet found" }, { status: 404 })
    }

    const pet = user.pets[0]

    // Get all health records
    const records = await recordsCollection
      .find({ userId: new (await import("mongodb")).ObjectId(userId) })
      .sort({ date: -1 })
      .toArray()

    // Advanced AI Analysis
    const analysis = await performAdvancedAnalysis(records, pet)

    return NextResponse.json({ analysis }, { status: 200 })
  } catch (error) {
    console.error("Advanced analysis error:", error)
    return NextResponse.json({ error: "Failed to perform analysis" }, { status: 500 })
  }
}

async function performAdvancedAnalysis(records: any[], pet: any) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  // Comprehensive health analysis using ALL available data
  const healthAnalysis = {
    overallScore: calculateAdvancedHealthScore(records, pet),
    riskAssessment: assessHealthRisks(records, pet),
    trendAnalysis: analyzeHealthTrends(records),
    predictiveInsights: generatePredictiveInsights(records, pet),
    personalizedRecommendations: generatePersonalizedRecommendations(records, pet),
    emergencyAlerts: generateEmergencyAlerts(records, pet),
    wellnessScore: calculateWellnessScore(records, pet),
    longevityPrediction: predictLongevity(records, pet),
    breedSpecificAnalysis: analyzeBreedSpecificHealth(records, pet),
    ageBasedAnalysis: analyzeAgeBasedHealth(records, pet),
    weightAnalysis: analyzeWeightPatterns(records, pet),
    vaccinationAnalysis: analyzeVaccinationHistory(records, pet),
    dentalAnalysis: analyzeDentalHealth(records, pet),
    activityAnalysis: analyzeActivityPatterns(records, pet),
    vetVisitAnalysis: analyzeVetVisitPatterns(records, pet),
    medicationAnalysis: analyzeMedicationHistory(records, pet),
    seasonalAnalysis: analyzeSeasonalHealthPatterns(records, pet),
    comprehensiveInsights: generateComprehensiveInsights(records, pet)
  }

  return healthAnalysis
}

function calculateAdvancedHealthScore(records: any[], pet: any) {
  let score = 100
  const now = new Date()
  const weights = {
    vaccination: 25,
    weight: 20,
    dental: 15,
    activity: 15,
    checkups: 15,
    emergency: 10
  }

  // Vaccination analysis
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length === 0) score -= weights.vaccination
  else {
    const lastVaccination = vaccinationRecords[0]
    const daysSince = Math.floor((now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 400) score -= weights.vaccination
    else if (daysSince > 365) score -= weights.vaccination * 0.5
  }

  // Weight analysis
  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length === 0) score -= weights.weight
  else if (weightRecords.length < 3) score -= weights.weight * 0.5

  // Dental analysis
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length === 0) score -= weights.dental
  else {
    const lastDental = dentalRecords[0]
    const daysSince = Math.floor((now.getTime() - lastDental.date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 400) score -= weights.dental
  }

  // Activity analysis
  const recentRecords = records.filter(r => r.date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
  if (recentRecords.length === 0) score -= weights.activity
  else if (recentRecords.length < 2) score -= weights.activity * 0.5

  // Checkup analysis
  const checkupRecords = records.filter(r => r.type === "Checkup")
  if (checkupRecords.length === 0) score -= weights.checkups

  return Math.max(0, Math.min(100, Math.round(score)))
}

function assessHealthRisks(records: any[], pet: any) {
  const risks = []
  
  // Vaccination risks
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length === 0) {
    risks.push({
      category: "Vaccination",
      level: "High",
      description: "No vaccination records found",
      recommendation: "Schedule immediate vaccination consultation"
    })
  }

  // Weight monitoring risks
  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length === 0) {
    risks.push({
      category: "Weight Management",
      level: "Medium",
      description: "No weight monitoring records",
      recommendation: "Start regular weight tracking"
    })
  }

  // Dental health risks
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length === 0) {
    risks.push({
      category: "Dental Health",
      level: "Medium",
      description: "No dental care records",
      recommendation: "Schedule dental examination"
    })
  }

  return risks
}

function analyzeHealthTrends(records: any[]) {
  const trends = {
    vaccinationTrend: analyzeVaccinationTrend(records),
    weightTrend: analyzeWeightTrend(records),
    activityTrend: analyzeActivityTrend(records),
    overallTrend: "Stable"
  }

  return trends
}

function analyzeVaccinationTrend(records: any[]) {
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length === 0) return "No Data"
  if (vaccinationRecords.length >= 3) return "Excellent"
  if (vaccinationRecords.length >= 2) return "Good"
  return "Needs Improvement"
}

function analyzeWeightTrend(records: any[]) {
  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length === 0) return "No Data"
  if (weightRecords.length >= 5) return "Well Monitored"
  if (weightRecords.length >= 2) return "Adequate"
  return "Insufficient Data"
}

function analyzeActivityTrend(records: any[]) {
  const now = new Date()
  const recentRecords = records.filter(r => r.date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
  if (recentRecords.length >= 5) return "Very Active"
  if (recentRecords.length >= 3) return "Active"
  if (recentRecords.length >= 1) return "Moderate"
  return "Low Activity"
}

function generatePredictiveInsights(records: any[], pet: any) {
  const insights = []
  
  // Predict next vaccination need
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length > 0) {
    const lastVaccination = vaccinationRecords[0]
    const nextDue = new Date(lastVaccination.date.getTime() + 365 * 24 * 60 * 60 * 1000)
    insights.push({
      type: "Vaccination",
      prediction: `Next vaccination due around ${nextDue.toLocaleDateString()}`,
      confidence: "High"
    })
  }

  // Predict dental care needs
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length > 0) {
    const lastDental = dentalRecords[0]
    const nextDue = new Date(lastDental.date.getTime() + 180 * 24 * 60 * 60 * 1000)
    insights.push({
      type: "Dental Care",
      prediction: `Next dental cleaning recommended around ${nextDue.toLocaleDateString()}`,
      confidence: "Medium"
    })
  }

  return insights
}

function generatePersonalizedRecommendations(records: any[], pet: any) {
  const recommendations = []
  
  // Breed-specific recommendations
  if (pet.breed) {
    recommendations.push({
      category: "Breed-Specific Care",
      priority: "High",
      recommendation: `Based on ${pet.breed} breed characteristics, consider breed-specific health monitoring`,
      action: "Research breed-specific health needs"
    })
  }

  // Age-based recommendations
  if (pet.age) {
    const ageNum = parseInt(pet.age)
    if (ageNum > 7) {
      recommendations.push({
        category: "Senior Care",
        priority: "High",
        recommendation: "Senior pet care protocols recommended",
        action: "Schedule senior health assessment"
      })
    }
  }

  return recommendations
}

function generateEmergencyAlerts(records: any[], pet: any) {
  const alerts = []
  const now = new Date()
  
  // Check for overdue vaccinations
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length > 0) {
    const lastVaccination = vaccinationRecords[0]
    const daysSince = Math.floor((now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 400) {
      alerts.push({
        type: "Emergency",
        message: "Vaccination is significantly overdue",
        urgency: "High"
      })
    }
  }

  return alerts
}

function calculateWellnessScore(records: any[], pet: any) {
  let wellnessScore = 0
  
  // Mental wellness indicators
  const checkupRecords = records.filter(r => r.type === "Checkup")
  wellnessScore += checkupRecords.length * 10
  
  // Physical wellness indicators
  const weightRecords = records.filter(r => r.type === "Weight Check")
  wellnessScore += weightRecords.length * 5
  
  // Preventive care indicators
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  wellnessScore += vaccinationRecords.length * 15
  
  return Math.min(100, wellnessScore)
}

function predictLongevity(records: any[], pet: any) {
  const healthScore = calculateAdvancedHealthScore(records, pet)
  const wellnessScore = calculateWellnessScore(records, pet)
  
  const averageScore = (healthScore + wellnessScore) / 2
  
  let longevityPrediction = "Average"
  if (averageScore >= 90) longevityPrediction = "Excellent - Above Average"
  else if (averageScore >= 75) longevityPrediction = "Good - Average to Above Average"
  else if (averageScore >= 60) longevityPrediction = "Fair - Average"
  else longevityPrediction = "Below Average - Needs Attention"
  
  return {
    prediction: longevityPrediction,
    confidence: averageScore >= 75 ? "High" : "Medium",
    factors: ["Health monitoring", "Preventive care", "Veterinary visits"]
  }
}

// New comprehensive analysis functions
function analyzeBreedSpecificHealth(records: any[], pet: any) {
  const analysis = {
    breedCharacteristics: {},
    breedSpecificRisks: [],
    breedRecommendations: [],
    breedHealthScore: 0
  }

  if (pet.breed) {
    const breed = pet.breed.toLowerCase()
    
    if (breed.includes('labrador') || breed.includes('retriever')) {
      analysis.breedSpecificRisks.push("Hip dysplasia risk", "Obesity tendency", "Joint issues")
      analysis.breedRecommendations.push("Regular joint monitoring", "Weight management", "Low-impact exercise")
    } else if (breed.includes('german shepherd')) {
      analysis.breedSpecificRisks.push("Hip dysplasia", "Bloat risk", "Degenerative myelopathy")
      analysis.breedRecommendations.push("Hip screening", "Feeding management", "Neurological monitoring")
    } else if (breed.includes('bulldog') || breed.includes('pug')) {
      analysis.breedSpecificRisks.push("Breathing issues", "Skin problems", "Heat sensitivity")
      analysis.breedRecommendations.push("Temperature monitoring", "Skin care", "Exercise moderation")
    } else {
      analysis.breedSpecificRisks.push("General breed monitoring recommended")
      analysis.breedRecommendations.push("Regular health checkups", "Breed-specific research")
    }

    let breedScore = 100
    const relevantRecords = records.filter(r => 
      r.notes && r.notes.toLowerCase().includes(breed.split(' ')[0])
    )
    breedScore -= (analysis.breedSpecificRisks.length * 10)
    breedScore += (relevantRecords.length * 5)
    analysis.breedHealthScore = Math.max(0, Math.min(100, breedScore))
  }

  return analysis
}

function analyzeAgeBasedHealth(records: any[], pet: any) {
  const analysis = {
    ageCategory: "Adult",
    ageSpecificRisks: [],
    ageRecommendations: [],
    ageHealthScore: 0
  }

  if (pet.age) {
    const ageNum = parseInt(pet.age)
    
    if (ageNum <= 1) {
      analysis.ageCategory = "Puppy"
      analysis.ageSpecificRisks.push("Parasite susceptibility", "Vaccination needs", "Growth monitoring")
      analysis.ageRecommendations.push("Frequent vet visits", "Puppy vaccinations", "Growth tracking")
    } else if (ageNum <= 7) {
      analysis.ageCategory = "Adult"
      analysis.ageSpecificRisks.push("Weight management", "Dental care", "Preventive care")
      analysis.ageRecommendations.push("Annual checkups", "Dental cleaning", "Weight monitoring")
    } else {
      analysis.ageCategory = "Senior"
      analysis.ageSpecificRisks.push("Arthritis risk", "Cognitive decline", "Organ function")
      analysis.ageRecommendations.push("Bi-annual checkups", "Joint supplements", "Cognitive monitoring")
    }

    let ageScore = 100
    const ageAppropriateRecords = records.filter(r => {
      const recordAge = new Date().getFullYear() - new Date(r.date).getFullYear()
      return Math.abs(recordAge - ageNum) <= 2
    })
    ageScore += (ageAppropriateRecords.length * 3)
    analysis.ageHealthScore = Math.max(0, Math.min(100, ageScore))
  }

  return analysis
}

function analyzeWeightPatterns(records: any[], pet: any) {
  const analysis = {
    currentWeight: pet.weight || "Unknown",
    weightTrend: "Stable",
    weightRecords: [],
    weightRecommendations: [],
    weightHealthScore: 0
  }

  const weightRecords = records.filter(r => r.type === "Weight Check")
  analysis.weightRecords = weightRecords

  if (weightRecords.length >= 2) {
    const weights = weightRecords.map(r => {
      const weightMatch = r.description.match(/(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?)/i)
      return weightMatch ? parseFloat(weightMatch[1]) : null
    }).filter(w => w !== null)

    if (weights.length >= 2) {
      const trend = weights[0] - weights[weights.length - 1]
      if (trend > 2) {
        analysis.weightTrend = "Increasing"
        analysis.weightRecommendations.push("Weight management needed", "Diet review", "Exercise increase")
      } else if (trend < -2) {
        analysis.weightTrend = "Decreasing"
        analysis.weightRecommendations.push("Weight loss concern", "Appetite monitoring", "Health check")
      } else {
        analysis.weightTrend = "Stable"
        analysis.weightRecommendations.push("Maintain current weight", "Continue monitoring")
      }
    }
  } else {
    analysis.weightRecommendations.push("Start regular weight tracking", "Baseline weight needed")
  }

  analysis.weightHealthScore = weightRecords.length >= 3 ? 85 : weightRecords.length >= 1 ? 60 : 30
  return analysis
}

function analyzeVaccinationHistory(records: any[], pet: any) {
  const analysis = {
    vaccinationRecords: [],
    lastVaccination: null,
    nextDue: null,
    vaccinationStatus: "Unknown",
    vaccinationScore: 0,
    recommendations: []
  }

  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  analysis.vaccinationRecords = vaccinationRecords

  if (vaccinationRecords.length > 0) {
    analysis.lastVaccination = vaccinationRecords[0]
    const lastDate = new Date(vaccinationRecords[0].date)
    const nextDue = new Date(lastDate.getTime() + 365 * 24 * 60 * 60 * 1000)
    analysis.nextDue = nextDue

    const daysSince = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince < 365) {
      analysis.vaccinationStatus = "Up to Date"
      analysis.vaccinationScore = 100
    } else if (daysSince < 400) {
      analysis.vaccinationStatus = "Due Soon"
      analysis.vaccinationScore = 70
      analysis.recommendations.push("Schedule vaccination appointment")
    } else {
      analysis.vaccinationStatus = "Overdue"
      analysis.vaccinationScore = 30
      analysis.recommendations.push("Urgent: Schedule vaccination immediately")
    }
  } else {
    analysis.vaccinationStatus = "No Records"
    analysis.vaccinationScore = 0
    analysis.recommendations.push("Schedule initial vaccination consultation")
  }

  return analysis
}

function analyzeDentalHealth(records: any[], pet: any) {
  const analysis = {
    dentalRecords: [],
    lastCleaning: null,
    nextDue: null,
    dentalStatus: "Unknown",
    dentalScore: 0,
    recommendations: []
  }

  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  analysis.dentalRecords = dentalRecords

  if (dentalRecords.length > 0) {
    analysis.lastCleaning = dentalRecords[0]
    const lastDate = new Date(dentalRecords[0].date)
    const nextDue = new Date(lastDate.getTime() + 180 * 24 * 60 * 60 * 1000)
    analysis.nextDue = nextDue

    const daysSince = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince < 180) {
      analysis.dentalStatus = "Good"
      analysis.dentalScore = 90
    } else if (daysSince < 365) {
      analysis.dentalStatus = "Needs Attention"
      analysis.dentalScore = 60
      analysis.recommendations.push("Schedule dental cleaning")
    } else {
      analysis.dentalStatus = "Poor"
      analysis.dentalScore = 30
      analysis.recommendations.push("Urgent: Dental examination needed")
    }
  } else {
    analysis.dentalStatus = "No Records"
    analysis.dentalScore = 20
    analysis.recommendations.push("Schedule dental examination", "Start dental care routine")
  }

  return analysis
}

function analyzeActivityPatterns(records: any[], pet: any) {
  const analysis = {
    activityRecords: [],
    activityLevel: "Unknown",
    activityScore: 0,
    recommendations: []
  }

  const now = new Date()
  const recentRecords = records.filter(r => 
    new Date(r.date) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  )
  analysis.activityRecords = recentRecords

  if (recentRecords.length >= 5) {
    analysis.activityLevel = "Very Active"
    analysis.activityScore = 95
    analysis.recommendations.push("Maintain current activity level")
  } else if (recentRecords.length >= 3) {
    analysis.activityLevel = "Active"
    analysis.activityScore = 75
    analysis.recommendations.push("Good activity level")
  } else if (recentRecords.length >= 1) {
    analysis.activityLevel = "Moderate"
    analysis.activityScore = 50
    analysis.recommendations.push("Increase activity monitoring")
  } else {
    analysis.activityLevel = "Low"
    analysis.activityScore = 25
    analysis.recommendations.push("Increase activity", "More frequent checkups")
  }

  return analysis
}

function analyzeVetVisitPatterns(records: any[], pet: any) {
  const analysis = {
    totalVisits: records.length,
    recentVisits: 0,
    visitFrequency: "Unknown",
    vetScore: 0,
    recommendations: []
  }

  const now = new Date()
  const recentVisits = records.filter(r => 
    new Date(r.date) >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  )
  analysis.recentVisits = recentVisits.length

  if (recentVisits.length >= 3) {
    analysis.visitFrequency = "Excellent"
    analysis.vetScore = 95
  } else if (recentVisits.length >= 1) {
    analysis.visitFrequency = "Good"
    analysis.vetScore = 70
  } else {
    analysis.visitFrequency = "Needs Improvement"
    analysis.vetScore = 30
    analysis.recommendations.push("Schedule regular vet visits")
  }

  return analysis
}

function analyzeMedicationHistory(records: any[], pet: any) {
  const analysis = {
    medicationRecords: [],
    currentMedications: [],
    medicationScore: 0,
    recommendations: []
  }

  const medicationRecords = records.filter(r => 
    r.type === "Medication" || r.notes?.toLowerCase().includes("medication")
  )
  analysis.medicationRecords = medicationRecords

  if (medicationRecords.length > 0) {
    analysis.medicationScore = 80
    analysis.recommendations.push("Continue medication monitoring")
  } else {
    analysis.medicationScore = 100
    analysis.recommendations.push("No medications needed - good health")
  }

  return analysis
}

function analyzeSeasonalHealthPatterns(records: any[], pet: any) {
  const analysis = {
    seasonalPatterns: {},
    seasonalRecommendations: [],
    seasonalScore: 0
  }

  const seasonalData = {
    spring: 0, summer: 0, fall: 0, winter: 0
  }

  records.forEach(record => {
    const month = new Date(record.date).getMonth()
    if (month >= 2 && month <= 4) seasonalData.spring++
    else if (month >= 5 && month <= 7) seasonalData.summer++
    else if (month >= 8 && month <= 10) seasonalData.fall++
    else seasonalData.winter++
  })

  analysis.seasonalPatterns = seasonalData
  analysis.seasonalScore = Object.values(seasonalData).reduce((a, b) => a + b, 0) * 10
  analysis.seasonalRecommendations.push("Monitor seasonal health patterns")

  return analysis
}

function generateComprehensiveInsights(records: any[], pet: any) {
  const insights = {
    overallHealthTrend: "Stable",
    keyFindings: [],
    priorityActions: [],
    longTermOutlook: "Good",
    comprehensiveScore: 0
  }

  const healthScore = calculateAdvancedHealthScore(records, pet)
  const vaccinationScore = analyzeVaccinationHistory(records, pet).vaccinationScore
  const dentalScore = analyzeDentalHealth(records, pet).dentalScore
  const activityScore = analyzeActivityPatterns(records, pet).activityScore

  insights.comprehensiveScore = Math.round((healthScore + vaccinationScore + dentalScore + activityScore) / 4)

  if (healthScore >= 80) {
    insights.keyFindings.push("Excellent overall health")
  } else if (healthScore >= 60) {
    insights.keyFindings.push("Good health with room for improvement")
  } else {
    insights.keyFindings.push("Health needs attention")
  }

  if (vaccinationScore < 70) {
    insights.priorityActions.push("Schedule vaccination")
  }
  if (dentalScore < 70) {
    insights.priorityActions.push("Dental care needed")
  }
  if (activityScore < 70) {
    insights.priorityActions.push("Increase activity monitoring")
  }

  if (insights.comprehensiveScore >= 85) {
    insights.longTermOutlook = "Excellent - Continue current care"
  } else if (insights.comprehensiveScore >= 70) {
    insights.longTermOutlook = "Good - Minor improvements needed"
  } else {
    insights.longTermOutlook = "Needs attention - Health monitoring required"
  }

  return insights
}
