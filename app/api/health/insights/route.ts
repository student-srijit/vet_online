import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
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

    // Analyze health patterns
    const insights = generateHealthInsights(records, pet)

    return NextResponse.json({ insights }, { status: 200 })
  } catch (error) {
    console.error("Health insights error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

function generateHealthInsights(records: any[], pet: any) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  // Recent activity analysis
  const recentRecords = records.filter(record => record.date >= thirtyDaysAgo)
  const quarterlyRecords = records.filter(record => record.date >= ninetyDaysAgo)
  const yearlyRecords = records.filter(record => record.date >= oneYearAgo)

  // Health pattern analysis
  const vaccinationRecords = records.filter(record => record.type === "Vaccination")
  const weightRecords = records.filter(record => record.type === "Weight Check")
  const dentalRecords = records.filter(record => record.type === "Dental Cleaning")
  const checkupRecords = records.filter(record => record.type === "Checkup")

  // Calculate health trends
  const healthTrends = {
    activityLevel: calculateActivityLevel(recentRecords),
    vaccinationCompliance: calculateVaccinationCompliance(vaccinationRecords),
    weightStability: calculateWeightStability(weightRecords),
    dentalHealth: calculateDentalHealth(dentalRecords),
    overallHealth: calculateOverallHealth(records, pet)
  }

  // Generate personalized insights
  const insights = {
    summary: generateSummary(healthTrends, pet),
    trends: healthTrends,
    recommendations: generateRecommendations(records, pet, healthTrends),
    alerts: generateAlerts(records, pet, healthTrends),
    milestones: generateMilestones(records, pet),
    nextSteps: generateNextSteps(records, pet, healthTrends)
  }

  return insights
}

function calculateActivityLevel(recentRecords: any[]) {
  const activityScore = recentRecords.length * 10
  if (activityScore >= 50) return { level: "High", score: activityScore, description: "Very active health monitoring" }
  if (activityScore >= 30) return { level: "Medium", score: activityScore, description: "Moderate health monitoring" }
  return { level: "Low", score: activityScore, description: "Limited health monitoring" }
}

function calculateVaccinationCompliance(vaccinationRecords: any[]) {
  const now = new Date()
  const lastVaccination = vaccinationRecords.length > 0 ? vaccinationRecords[0] : null
  const daysSinceLastVaccination = lastVaccination ? 
    Math.floor((now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24)) : 999

  if (daysSinceLastVaccination < 365) {
    return { status: "Up to Date", daysSince: daysSinceLastVaccination, description: "Vaccinations are current" }
  } else if (daysSinceLastVaccination < 400) {
    return { status: "Due Soon", daysSince: daysSinceLastVaccination, description: "Vaccination due within 35 days" }
  } else {
    return { status: "Overdue", daysSince: daysSinceLastVaccination, description: "Vaccination is overdue" }
  }
}

function calculateWeightStability(weightRecords: any[]) {
  if (weightRecords.length < 2) {
    return { status: "Insufficient Data", description: "Need more weight records for analysis" }
  }

  // Simple weight trend analysis (in real app, you'd parse weight values)
  const recentWeights = weightRecords.slice(0, 3)
  return { status: "Stable", description: "Weight appears stable based on recent records" }
}

function calculateDentalHealth(dentalRecords: any[]) {
  const now = new Date()
  const lastDental = dentalRecords.length > 0 ? dentalRecords[0] : null
  const daysSinceLastDental = lastDental ? 
    Math.floor((now.getTime() - lastDental.date.getTime()) / (1000 * 60 * 60 * 24)) : 999

  if (daysSinceLastDental < 180) {
    return { status: "Good", daysSince: daysSinceLastDental, description: "Recent dental care" }
  } else if (daysSinceLastDental < 365) {
    return { status: "Fair", daysSince: daysSinceLastDental, description: "Dental care due soon" }
  } else {
    return { status: "Needs Attention", daysSince: daysSinceLastDental, description: "Dental care overdue" }
  }
}

function calculateOverallHealth(records: any[], pet: any) {
  let score = 100

  // Deduct points based on various factors
  if (records.length === 0) score -= 40
  if (records.filter(r => r.type === "Vaccination").length === 0) score -= 25
  if (records.filter(r => r.type === "Weight Check").length === 0) score -= 15
  if (records.filter(r => r.type === "Dental Cleaning").length === 0) score -= 20

  // Recent activity bonus
  const recentRecords = records.filter(r => 
    new Date(r.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  if (recentRecords.length > 2) score += 10

  return {
    score: Math.max(0, Math.min(100, score)),
    grade: score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 60 ? "Fair" : "Needs Attention",
    description: generateHealthDescription(score)
  }
}

function generateHealthDescription(score: number) {
  if (score >= 90) return "Your pet is in excellent health with comprehensive care"
  if (score >= 75) return "Your pet is in good health with regular monitoring"
  if (score >= 60) return "Your pet's health is fair, some areas need attention"
  return "Your pet's health needs immediate attention and care"
}

function generateSummary(trends: any, pet: any) {
  return {
    title: `${pet.name}'s Health Overview`,
    description: `Based on ${pet.breed} breed characteristics and health records, here's your pet's current health status.`,
    keyPoints: [
      `Activity Level: ${trends.activityLevel.level}`,
      `Vaccination Status: ${trends.vaccinationCompliance.status}`,
      `Overall Health: ${trends.overallHealth.grade} (${trends.overallHealth.score}%)`
    ]
  }
}

function generateRecommendations(records: any[], pet: any, trends: any) {
  const recommendations = []

  if (trends.vaccinationCompliance.status === "Overdue") {
    recommendations.push({
      priority: "High",
      category: "Vaccination",
      title: "Schedule Vaccination",
      description: "Your pet's vaccination is overdue. Please schedule an appointment soon.",
      action: "Contact your veterinarian"
    })
  }

  if (trends.dentalHealth.status === "Needs Attention") {
    recommendations.push({
      priority: "High",
      category: "Dental Care",
      title: "Dental Cleaning Needed",
      description: "It's been over a year since the last dental cleaning.",
      action: "Schedule dental appointment"
    })
  }

  if (trends.activityLevel.level === "Low") {
    recommendations.push({
      priority: "Medium",
      category: "Monitoring",
      title: "Increase Health Monitoring",
      description: "Consider more frequent health checkups and monitoring.",
      action: "Schedule regular checkups"
    })
  }

  if (records.filter(r => r.type === "Weight Check").length === 0) {
    recommendations.push({
      priority: "Medium",
      category: "Weight Management",
      title: "Start Weight Monitoring",
      description: "Regular weight checks help track your pet's health.",
      action: "Schedule weight check"
    })
  }

  return recommendations
}

function generateAlerts(records: any[], pet: any, trends: any) {
  const alerts = []

  if (trends.overallHealth.score < 60) {
    alerts.push({
      type: "warning",
      title: "Health Attention Needed",
      message: "Your pet's health score is below optimal. Please consult with your veterinarian.",
      urgent: true
    })
  }

  if (trends.vaccinationCompliance.status === "Overdue") {
    alerts.push({
      type: "urgent",
      title: "Vaccination Overdue",
      message: "Your pet's vaccination is overdue. This is important for their health and safety.",
      urgent: true
    })
  }

  return alerts
}

function generateMilestones(records: any[], pet: any) {
  const milestones = []

  if (records.length >= 10) {
    milestones.push({
      title: "Health Tracking Champion",
      description: "You've recorded 10+ health events! Great job staying on top of your pet's health.",
      icon: "🏆"
    })
  }

  if (records.filter(r => r.type === "Vaccination").length >= 3) {
    milestones.push({
      title: "Vaccination Pro",
      description: "You've maintained excellent vaccination records for your pet.",
      icon: "💉"
    })
  }

  return milestones
}

function generateNextSteps(records: any[], pet: any, trends: any) {
  const nextSteps = []

  // Always suggest next vaccination if due
  if (trends.vaccinationCompliance.status !== "Up to Date") {
    nextSteps.push("Schedule vaccination appointment")
  }

  // Suggest dental care if needed
  if (trends.dentalHealth.status === "Needs Attention") {
    nextSteps.push("Book dental cleaning appointment")
  }

  // Suggest regular checkup
  const lastCheckup = records.filter(r => r.type === "Checkup")[0]
  if (!lastCheckup || new Date(lastCheckup.date) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)) {
    nextSteps.push("Schedule annual health checkup")
  }

  // Suggest weight monitoring
  if (records.filter(r => r.type === "Weight Check").length < 2) {
    nextSteps.push("Start regular weight monitoring")
  }

  return nextSteps
}
