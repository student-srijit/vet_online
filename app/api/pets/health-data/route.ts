import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

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
    const usersCollection = db.collection("users")
    
    // Get user with pets
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { pets: 1 } }
    )

    if (!user || !user.pets || user.pets.length === 0) {
      return NextResponse.json({ error: "No pets found" }, { status: 404 })
    }

    const pet = user.pets[0] // Get first pet
    
    // Calculate dynamic health score based on various factors
    let healthScore = 95 // Base score
    
    // Get recent activities to calculate health score
    const activitiesCollection = db.collection("pet_activities")
    const recentActivities = await activitiesCollection.find({
      userId: userId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).toArray()

    // Calculate health score based on activities
    const activityCount = recentActivities.length
    if (activityCount < 2) {
      healthScore -= 10 // Low activity reduces health score
    } else if (activityCount > 5) {
      healthScore += 5 // High activity increases health score
    }

    // Get recent health records
    const recordsCollection = db.collection("health_records")
    const recentRecords = await recordsCollection.find({
      userId: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).toArray()

    // Adjust health score based on recent health records
    const concerningRecords = recentRecords.filter(record => 
      record.type === 'concern' || record.severity === 'high'
    )
    healthScore -= concerningRecords.length * 5

    // Ensure health score is within bounds
    healthScore = Math.max(60, Math.min(100, healthScore))

    // Calculate next meal time based on current time and pet's schedule
    const now = new Date()
    const currentHour = now.getHours()
    
    let nextMeal = "08:00" // Default
    if (currentHour < 8) {
      nextMeal = "08:00"
    } else if (currentHour < 12) {
      nextMeal = "12:00"
    } else if (currentHour < 18) {
      nextMeal = "18:00"
    } else {
      nextMeal = "08:00" // Next day
    }

    // Calculate activities today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayActivities = await activitiesCollection.find({
      userId: userId,
      timestamp: { $gte: todayStart }
    }).toArray()

    const activitiesToday = todayActivities.length

    // Determine pet status based on health and activity
    let status = "Happy"
    if (healthScore < 70) {
      status = "Needs Care"
    } else if (activitiesToday < 2) {
      status = "Bored"
    } else if (healthScore > 90 && activitiesToday > 4) {
      status = "Excited"
    }

    // Update pet data in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          "pets.0.healthScore": healthScore,
          "pets.0.nextMeal": nextMeal,
          "pets.0.activitiesToday": activitiesToday,
          "pets.0.status": status,
          "pets.0.lastHealthUpdate": new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      healthData: {
        healthScore,
        nextMeal,
        activitiesToday,
        status,
        lastUpdate: new Date()
      }
    })

  } catch (error: any) {
    console.error("Health data error:", error)
    return NextResponse.json({
      success: false,
      error: `Failed to get health data: ${error.message}`
    }, { status: 500 })
  }
}
