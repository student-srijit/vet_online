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
    const schedulesCollection = db.collection("schedules")
    
    const schedules = await schedulesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ time: 1 })
      .toArray()

    // Convert ObjectId to string for client
    const formattedSchedules = schedules.map(schedule => ({
      id: schedule._id.toString(),
      scheduleType: schedule.scheduleType,
      time: schedule.time,
      days: schedule.days,
      description: schedule.description,
      priority: schedule.priority,
      weatherDependent: schedule.weatherDependent,
      healthBased: schedule.healthBased,
      isAIRecommended: schedule.isAIRecommended,
      completed: schedule.completed,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    }))

    return NextResponse.json({ 
      success: true, 
      schedules: formattedSchedules 
    }, { status: 200 })
  } catch (error: any) {
    console.error("Schedule list error:", error)
    return NextResponse.json({ error: `Failed to fetch schedules: ${error.message}` }, { status: 500 })
  }
}