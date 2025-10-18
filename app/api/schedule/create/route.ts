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

    const { 
      scheduleType, 
      time, 
      days, 
      description, 
      priority, 
      weatherDependent, 
      healthBased,
      isAIRecommended 
    } = await req.json()

    if (!scheduleType || !time) {
      return NextResponse.json({ error: "Schedule type and time are required" }, { status: 400 })
    }

    const db = await getDB()
    const schedulesCollection = db.collection("schedules")
    
    const newSchedule = {
      userId: new ObjectId(userId),
      scheduleType,
      time,
      days: days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      description: description || "",
      priority: priority || "medium",
      weatherDependent: weatherDependent || false,
      healthBased: healthBased || false,
      isAIRecommended: isAIRecommended || false,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await schedulesCollection.insertOne(newSchedule)

    return NextResponse.json({ 
      success: true, 
      scheduleId: result.insertedId,
      message: "Schedule created successfully" 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Schedule creation error:", error)
    return NextResponse.json({ error: `Failed to create schedule: ${error.message}` }, { status: 500 })
  }
}