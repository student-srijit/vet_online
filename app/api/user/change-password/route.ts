import { getDB } from "@/lib/db"
import { verifyToken, comparePassword, hashPassword } from "@/lib/auth"
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

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")
    
    // Get user to verify current password
    const user = await usersCollection.findOne({ _id: new (await import("mongodb")).ObjectId(userId) })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    const result = await usersCollection.updateOne(
      { _id: new (await import("mongodb")).ObjectId(userId) },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
