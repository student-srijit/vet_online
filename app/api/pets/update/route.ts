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

    const { petData } = await req.json()

    console.log("Received pet data:", petData)

    if (!petData) {
      return NextResponse.json({ error: "Pet data is required" }, { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")
    
    // Update the first pet in the user's pets array (since we only support one pet for now)
    const result = await usersCollection.updateOne(
      { 
        _id: new (await import("mongodb")).ObjectId(userId)
      },
      {
        $set: {
          "pets.0.name": petData.name,
          "pets.0.breed": petData.breed,
          "pets.0.age": petData.age,
          "pets.0.weight": petData.weight,
          "pets.0.color": petData.color,
          "pets.0.dateOfBirth": petData.dateOfBirth,
          "pets.0.updatedAt": new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Pet update error:", error)
    return NextResponse.json({ error: `Failed to update pet: ${error.message}` }, { status: 500 })
  }
}
