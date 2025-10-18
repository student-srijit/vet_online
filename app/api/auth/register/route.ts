import { getDB } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, confirmPassword, petName, petAge, petBreed, petWeight, petColor, petDateOfBirth } = await req.json()

    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    
    // Create pet object if pet information is provided
    const pets = []
    if (petName && petAge && petBreed) {
      pets.push({
        _id: new (await import("mongodb")).ObjectId(),
        name: petName,
        age: petAge,
        breed: petBreed,
        weight: petWeight || "",
        color: petColor || "",
        dateOfBirth: petDateOfBirth || "",
        healthScore: 92, // Default health score
        activitiesToday: 5, // Default activities
        nextMeal: "2:30 PM", // Default next meal
        status: "Happy",
        createdAt: new Date()
      })
    }

    const result = await usersCollection.insertOne({
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      pets,
    })

    const token = generateToken(result.insertedId.toString())

    return NextResponse.json(
      {
        success: true,
        token,
        userId: result.insertedId.toString(),
        user: { fullName, email },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
