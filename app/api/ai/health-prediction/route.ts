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

    // AI Health Prediction Analysis
    const predictions = await generateHealthPredictions(records, pet)

    return NextResponse.json({ predictions }, { status: 200 })
  } catch (error) {
    console.error("Health prediction error:", error)
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 })
  }
}

async function generateHealthPredictions(records: any[], pet: any) {
  const now = new Date()
  
  // Comprehensive health prediction analysis
  const predictions = {
    shortTermPredictions: generateShortTermPredictions(records, pet),
    longTermPredictions: generateLongTermPredictions(records, pet),
    riskFactors: identifyRiskFactors(records, pet),
    preventiveMeasures: suggestPreventiveMeasures(records, pet),
    healthTrends: analyzeHealthTrends(records, pet),
    emergencyAlerts: generateEmergencyAlerts(records, pet),
    wellnessForecast: generateWellnessForecast(records, pet),
    longevityFactors: analyzeLongevityFactors(records, pet)
  }

  return predictions
}

function generateShortTermPredictions(records: any[], pet: any) {
  const predictions = []
  const now = new Date()
  
  // Vaccination predictions
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length > 0) {
    const lastVaccination = vaccinationRecords[0]
    const daysSince = Math.floor((now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24))
    const daysUntilDue = 365 - daysSince
    
    if (daysUntilDue <= 30) {
      predictions.push({
        type: "Vaccination",
        timeframe: "Next 30 days",
        prediction: "Vaccination due soon",
        confidence: "High",
        action: "Schedule vaccination appointment"
      })
    }
  }

  // Weight monitoring predictions
  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length > 0) {
    const lastWeight = weightRecords[0]
    const daysSince = Math.floor((now.getTime() - lastWeight.date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince > 60) {
      predictions.push({
        type: "Weight Monitoring",
        timeframe: "Next 2 weeks",
        prediction: "Weight check recommended",
        confidence: "Medium",
        action: "Schedule weight monitoring"
      })
    }
  }

  // Dental care predictions
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length > 0) {
    const lastDental = dentalRecords[0]
    const daysSince = Math.floor((now.getTime() - lastDental.date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince > 150) {
      predictions.push({
        type: "Dental Care",
        timeframe: "Next 30 days",
        prediction: "Dental cleaning recommended",
        confidence: "Medium",
        action: "Schedule dental examination"
      })
    }
  }

  return predictions
}

function generateLongTermPredictions(records: any[], pet: any) {
  const predictions = []
  
  // Health trajectory prediction
  const healthScore = calculateHealthScore(records)
  const trend = analyzeHealthTrend(records)
  
  predictions.push({
    type: "Health Trajectory",
    timeframe: "Next 6 months",
    prediction: trend === "improving" ? "Health likely to improve" : 
                trend === "declining" ? "Health may decline" : 
                "Health likely to remain stable",
    confidence: "Medium",
    factors: ["Current health score", "Record frequency", "Preventive care"]
  })

  // Age-related predictions
  if (pet.age) {
    const ageNum = parseInt(pet.age)
    if (ageNum > 7) {
      predictions.push({
        type: "Senior Care",
        timeframe: "Next year",
        prediction: "Increased monitoring needed for senior pet",
        confidence: "High",
        action: "Implement senior pet care protocol"
      })
    }
  }

  return predictions
}

function identifyRiskFactors(records: any[], pet: any) {
  const riskFactors = []
  
  // Vaccination risks
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length === 0) {
    riskFactors.push({
      factor: "Unvaccinated",
      riskLevel: "High",
      impact: "Susceptible to preventable diseases",
      mitigation: "Schedule vaccination consultation"
    })
  }

  // Weight monitoring risks
  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length === 0) {
    riskFactors.push({
      factor: "No weight monitoring",
      riskLevel: "Medium",
      impact: "Unable to detect weight-related health issues",
      mitigation: "Start regular weight tracking"
    })
  }

  // Dental health risks
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length === 0) {
    riskFactors.push({
      factor: "Poor dental hygiene",
      riskLevel: "Medium",
      impact: "Risk of dental disease and related health issues",
      mitigation: "Schedule dental examination"
    })
  }

  return riskFactors
}

function suggestPreventiveMeasures(records: any[], pet: any) {
  const measures = []
  
  // Preventive care suggestions
  measures.push({
    category: "Routine Care",
    measure: "Annual comprehensive health checkup",
    priority: "High",
    timeframe: "Next 3 months",
    benefit: "Early detection of health issues"
  })

  measures.push({
    category: "Preventive Medicine",
    measure: "Regular vaccination schedule",
    priority: "High",
    timeframe: "Ongoing",
    benefit: "Protection against preventable diseases"
  })

  measures.push({
    category: "Monitoring",
    measure: "Monthly weight tracking",
    priority: "Medium",
    timeframe: "Ongoing",
    benefit: "Early detection of weight-related issues"
  })

  return measures
}

function analyzeHealthTrends(records: any[], pet: any) {
  const trends = {
    overallTrend: "Stable",
    vaccinationTrend: analyzeVaccinationTrend(records),
    weightTrend: analyzeWeightTrend(records),
    activityTrend: analyzeActivityTrend(records),
    dentalTrend: analyzeDentalTrend(records)
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

function analyzeDentalTrend(records: any[]) {
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length === 0) return "No Data"
  if (dentalRecords.length >= 2) return "Well Maintained"
  return "Needs Attention"
}

function generateEmergencyAlerts(records: any[], pet: any) {
  const alerts = []
  const now = new Date()
  
  // Check for critical health issues
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length > 0) {
    const lastVaccination = vaccinationRecords[0]
    const daysSince = Math.floor((now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 400) {
      alerts.push({
        type: "Critical",
        message: "Vaccination significantly overdue - immediate attention required",
        urgency: "High",
        action: "Schedule vaccination immediately"
      })
    }
  }

  return alerts
}

function generateWellnessForecast(records: any[], pet: any) {
  const healthScore = calculateHealthScore(records)
  const trend = analyzeHealthTrend(records)
  
  let forecast = "Stable"
  if (trend === "improving" && healthScore > 80) {
    forecast = "Excellent - Health improving"
  } else if (trend === "declining" || healthScore < 60) {
    forecast = "Concerning - Needs attention"
  } else if (healthScore > 75) {
    forecast = "Good - Maintaining health"
  }

  return {
    forecast,
    confidence: healthScore > 75 ? "High" : "Medium",
    factors: ["Health monitoring", "Preventive care", "Veterinary visits"]
  }
}

function analyzeLongevityFactors(records: any[], pet: any) {
  const factors = {
    positiveFactors: [],
    negativeFactors: [],
    overallAssessment: "Average"
  }

  // Positive factors
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length >= 2) {
    factors.positiveFactors.push("Good vaccination history")
  }

  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length >= 3) {
    factors.positiveFactors.push("Regular weight monitoring")
  }

  // Negative factors
  if (vaccinationRecords.length === 0) {
    factors.negativeFactors.push("No vaccination records")
  }

  if (weightRecords.length === 0) {
    factors.negativeFactors.push("No weight monitoring")
  }

  // Overall assessment
  const healthScore = calculateHealthScore(records)
  if (healthScore >= 85 && factors.negativeFactors.length === 0) {
    factors.overallAssessment = "Excellent - Above average longevity expected"
  } else if (healthScore >= 70 && factors.negativeFactors.length <= 1) {
    factors.overallAssessment = "Good - Average to above average longevity"
  } else if (healthScore < 60 || factors.negativeFactors.length > 2) {
    factors.overallAssessment = "Below average - Needs immediate attention"
  }

  return factors
}

function calculateHealthScore(records: any[]) {
  let score = 100
  const now = new Date()
  
  // Vaccination analysis
  const vaccinationRecords = records.filter(r => r.type === "Vaccination")
  if (vaccinationRecords.length === 0) score -= 30
  else {
    const lastVaccination = vaccinationRecords[0]
    const daysSince = Math.floor((now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 400) score -= 25
    else if (daysSince > 365) score -= 15
  }

  // Weight monitoring
  const weightRecords = records.filter(r => r.type === "Weight Check")
  if (weightRecords.length === 0) score -= 20
  else if (weightRecords.length < 3) score -= 10

  // Dental care
  const dentalRecords = records.filter(r => r.type === "Dental Cleaning")
  if (dentalRecords.length === 0) score -= 15

  // Activity level
  const recentRecords = records.filter(r => r.date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
  if (recentRecords.length === 0) score -= 20
  else if (recentRecords.length < 2) score -= 10

  return Math.max(0, Math.min(100, score))
}

function analyzeHealthTrend(records: any[]) {
  if (records.length < 3) return "insufficient data"
  
  const now = new Date()
  const recentRecords = records.filter(r => r.date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
  const olderRecords = records.filter(r => r.date < new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
  
  if (recentRecords.length > olderRecords.length) return "improving"
  if (recentRecords.length < olderRecords.length) return "declining"
  return "stable"
}
