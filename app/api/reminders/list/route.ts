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
    const remindersCollection = db.collection("reminders")
    
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const reminders = await remindersCollection
      .find({ 
        userId: new (await import("mongodb")).ObjectId(userId),
        isActive: true,
        date: { $gte: now, $lte: nextWeek }
      })
      .sort({ date: 1 })
      .toArray()

    return NextResponse.json({ reminders }, { status: 200 })
  } catch (error) {
    console.error("Reminders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}
