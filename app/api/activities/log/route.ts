import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

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

    const { activities, petInfo } = await req.json()

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json({ error: "Activities array is required" }, { status: 400 })
    }

    const db = await getDB()
    const activitiesCollection = db.collection("pet_activities")
    
    // Prepare activities for database
    const activitiesToSave = activities.map(activity => ({
      userId: userId,
      petInfo: petInfo,
      type: activity.type,
      duration: activity.duration,
      intensity: activity.intensity,
      notes: activity.notes,
      timestamp: new Date(activity.timestamp),
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    // Insert activities
    const result = await activitiesCollection.insertMany(activitiesToSave)

    // Update pet's activity count in user document
    const usersCollection = db.collection("users")
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { "pets.0.activitiesToday": activities.length },
        $set: { updatedAt: new Date() }
      }
    )

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      activities: activitiesToSave
    })

  } catch (error: any) {
    console.error("Activity logging error:", error)
    return NextResponse.json({
      success: false,
      error: `Failed to log activities: ${error.message}`
    }, { status: 500 })
  }
}
