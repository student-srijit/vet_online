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
    const usersCollection = db.collection("users")
    
    // Get user with pets
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { pets: 1, fullName: 1, email: 1 } }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      pets: user.pets || [],
      user: {
        fullName: user.fullName,
        email: user.email
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error("Get pets error:", error)
    return NextResponse.json({ 
      error: `Failed to get pets: ${error.message}` 
    }, { status: 500 })
  }
}
