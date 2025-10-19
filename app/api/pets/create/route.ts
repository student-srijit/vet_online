import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

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

    const { petData } = await req.json()

    console.log("Creating new pet with data:", petData)

    if (!petData || !petData.name || !petData.breed || !petData.age) {
      return NextResponse.json({ 
        error: "Pet name, breed, and age are required" 
      }, { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")
    
    // Create new pet object
    const newPet = {
      _id: new ObjectId(),
      name: petData.name,
      breed: petData.breed,
      age: petData.age,
      weight: petData.weight || "",
      color: petData.color || "",
      dateOfBirth: petData.dateOfBirth || "",
      healthScore: 95, // Default health score
      activitiesToday: 0, // Will be updated by AI
      nextMeal: "08:00", // Default next meal
      status: "Happy", // Default status
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add pet to user's pets array
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $push: { pets: newPet },
        $set: { updatedAt: new Date() }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Pet created successfully:", newPet._id)

    return NextResponse.json({ 
      success: true, 
      petId: newPet._id.toString(),
      pet: newPet
    }, { status: 201 })
  } catch (error: any) {
    console.error("Pet creation error:", error)
    return NextResponse.json({ 
      error: `Failed to create pet: ${error.message}` 
    }, { status: 500 })
  }
}
