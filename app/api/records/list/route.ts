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
    
    const records = await recordsCollection
      .find({ userId: new (await import("mongodb")).ObjectId(userId) })
      .sort({ date: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({ records }, { status: 200 })
  } catch (error) {
    console.error("Records fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}