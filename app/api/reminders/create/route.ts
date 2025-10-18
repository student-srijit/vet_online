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

    const { type, date, description, reminderTime, isRecurring, recurringInterval } = await req.json()

    if (!type || !date || !description) {
      return NextResponse.json({ error: "Type, date, and description are required" }, { status: 400 })
    }

    const db = await getDB()
    const remindersCollection = db.collection("reminders")
    
    const reminder = {
      userId: new (await import("mongodb")).ObjectId(userId),
      type,
      date: new Date(date),
      description,
      reminderTime: reminderTime || "09:00", // Default to 9 AM
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || "monthly", // daily, weekly, monthly, yearly
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await remindersCollection.insertOne(reminder)

    return NextResponse.json({ 
      success: true, 
      reminderId: result.insertedId.toString() 
    }, { status: 201 })
  } catch (error) {
    console.error("Reminder creation error:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}
