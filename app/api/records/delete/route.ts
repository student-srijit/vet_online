import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

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

    const { recordId } = await req.json()

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    const db = await getDB()
    const recordsCollection = db.collection("health_records")
    
    const result = await recordsCollection.deleteOne({
      _id: new (await import("mongodb")).ObjectId(recordId),
      userId: new (await import("mongodb")).ObjectId(userId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Record deletion error:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}
