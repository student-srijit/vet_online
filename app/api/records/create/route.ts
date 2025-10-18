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

    const { type, date, description, vet, status, notes, nextDueDate } = await req.json()

    if (!type || !date || !description) {
      return NextResponse.json({ error: "Type, date, and description are required" }, { status: 400 })
    }

    const db = await getDB()
    const recordsCollection = db.collection("health_records")
    
    const record = {
      userId: new (await import("mongodb")).ObjectId(userId),
      type,
      date: new Date(date),
      description,
      vet: vet || "",
      status: status || "Completed",
      notes: notes || "",
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await recordsCollection.insertOne(record)

    return NextResponse.json({ 
      success: true, 
      recordId: result.insertedId.toString() 
    }, { status: 201 })
  } catch (error) {
    console.error("Record creation error:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}