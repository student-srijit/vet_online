import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { scheduleId } = await req.json()

    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 })
    }

    const db = await getDB()
    const schedulesCollection = db.collection("schedules")
    
    const result = await schedulesCollection.deleteOne({ 
      _id: new ObjectId(scheduleId),
      userId: new ObjectId(userId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Schedule not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Schedule deleted successfully" 
    }, { status: 200 })
  } catch (error: any) {
    console.error("Schedule deletion error:", error)
    return NextResponse.json({ error: `Failed to delete schedule: ${error.message}` }, { status: 500 })
  }
}
