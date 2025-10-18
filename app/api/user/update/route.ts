import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

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

    const { fullName, email } = await req.json()

    if (!fullName || !email) {
      return NextResponse.json({ error: "Full name and email are required" }, { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")
    
    // Check if email is already taken by another user
    const existingUser = await usersCollection.findOne({ 
      email, 
      _id: { $ne: new (await import("mongodb")).ObjectId(userId) }
    })
    
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Update user profile
    const result = await usersCollection.updateOne(
      { _id: new (await import("mongodb")).ObjectId(userId) },
      {
        $set: {
          fullName,
          email,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
