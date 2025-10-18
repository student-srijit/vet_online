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

    // Get health records
    const records = await recordsCollection
      .find({ userId: new (await import("mongodb")).ObjectId(userId) })
      .sort({ date: -1 })
      .toArray()

    // Calculate analytics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Recent records (last 30 days)
    const recentRecords = records.filter(record => record.date >= thirtyDaysAgo)
    
    // Weight trend analysis
    const weightRecords = records.filter(record => record.type === "Weight Check")
    const weightTrend = weightRecords.length > 0 ? "Stable" : "No data"
    
    // Activity level based on recent records
    const activityLevel = recentRecords.length > 3 ? "High" : recentRecords.length > 1 ? "Medium" : "Low"
    
    // Vaccination status
    const vaccinationRecords = records.filter(record => record.type === "Vaccination")
    const lastVaccination = vaccinationRecords.length > 0 ? vaccinationRecords[0] : null
    const vaccinationStatus = lastVaccination ? 
      (now.getTime() - lastVaccination.date.getTime() < 365 * 24 * 60 * 60 * 1000 ? "Up to Date" : "Due") : 
      "No records"

    // Upcoming checkups
    const upcomingCheckups = records.filter(record => 
      record.nextDueDate && record.nextDueDate > now
    ).sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime())

    // Health score calculation
    let healthScore = 100
    if (vaccinationStatus === "Due") healthScore -= 20
    if (activityLevel === "Low") healthScore -= 15
    if (weightTrend === "No data") healthScore -= 10
    if (recentRecords.length === 0) healthScore -= 25

    const analytics = {
      healthScore: Math.max(0, healthScore),
      weightTrend: {
        status: weightTrend,
        detail: weightRecords.length > 0 ? 
          `Last recorded: ${new Date(weightRecords[0].date).toLocaleDateString()}` : 
          "No weight records"
      },
      activityLevel: {
        status: activityLevel,
        detail: `${recentRecords.length} activities in last 30 days`
      },
      vaccinationStatus: {
        status: vaccinationStatus,
        detail: lastVaccination ? 
          `Last: ${new Date(lastVaccination.date).toLocaleDateString()}` : 
          "No vaccination records"
      },
      upcomingCheckups: upcomingCheckups.slice(0, 3).map(checkup => ({
        type: checkup.type,
        date: checkup.nextDueDate,
        description: checkup.description
      })),
      recommendations: generateRecommendations(records, pet, healthScore)
    }

    return NextResponse.json({ analytics }, { status: 200 })
  } catch (error) {
    console.error("Health analytics error:", error)
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
}

function generateRecommendations(records: any[], pet: any, healthScore: number) {
  const recommendations = []
  
  if (healthScore < 70) {
    recommendations.push("Schedule a comprehensive health checkup")
  }
  
  const vaccinationRecords = records.filter(record => record.type === "Vaccination")
  if (vaccinationRecords.length === 0) {
    recommendations.push("Schedule initial vaccinations")
  }
  
  const weightRecords = records.filter(record => record.type === "Weight Check")
  if (weightRecords.length === 0) {
    recommendations.push("Start regular weight monitoring")
  }
  
  const dentalRecords = records.filter(record => record.type === "Dental Cleaning")
  if (dentalRecords.length === 0) {
    recommendations.push("Consider dental cleaning appointment")
  }
  
  return recommendations
}
