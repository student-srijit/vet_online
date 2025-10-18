import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest) {
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
      scheduleId, 
      scheduleType, 
      time, 
      days, 
      description, 
      priority, 
      weatherDependent, 
      healthBased,
      completed 
    } = await req.json()

    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 })
    }

    const db = await getDB()
    const schedulesCollection = db.collection("schedules")
    
    const updateData: any = {
      updatedAt: new Date()
    }

    if (scheduleType !== undefined) updateData.scheduleType = scheduleType
    if (time !== undefined) updateData.time = time
    if (days !== undefined) updateData.days = days
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (weatherDependent !== undefined) updateData.weatherDependent = weatherDependent
    if (healthBased !== undefined) updateData.healthBased = healthBased
    if (completed !== undefined) updateData.completed = completed

    const result = await schedulesCollection.updateOne(
      { 
        _id: new ObjectId(scheduleId),
        userId: new ObjectId(userId)
      },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Schedule not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Schedule updated successfully" 
    }, { status: 200 })
  } catch (error: any) {
    console.error("Schedule update error:", error)
    return NextResponse.json({ error: `Failed to update schedule: ${error.message}` }, { status: 500 })
  }
}
