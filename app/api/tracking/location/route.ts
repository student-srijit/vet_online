import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { latitude, longitude, accuracy } = await req.json()

    const db = await getDB()
    const locationsCollection = db.collection("pet_locations")

    const result = await locationsCollection.insertOne({
      userId: new ObjectId(decoded.userId),
      latitude,
      longitude,
      accuracy,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      locationId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Location tracking error:", error)
    return NextResponse.json({ error: "Failed to track location" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDB()
    const locationsCollection = db.collection("pet_locations")

    const latestLocation = await locationsCollection.findOne(
      { userId: new ObjectId(decoded.userId) },
      { sort: { timestamp: -1 } },
    )

    if (!latestLocation) {
      return NextResponse.json({
        success: true,
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 50,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      location: {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        accuracy: latestLocation.accuracy,
        timestamp: latestLocation.timestamp.toISOString(),
      },
    })
  } catch (error) {
    console.error("Location fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}
