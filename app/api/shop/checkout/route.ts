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

    const { items, totalAmount, paymentMethod } = await req.json()

    const db = await getDB()
    const ordersCollection = db.collection("orders")

    const result = await ordersCollection.insertOne({
      userId: new ObjectId(decoded.userId),
      items,
      totalAmount,
      paymentMethod,
      status: "pending",
      createdAt: new Date(),
    })

    // Clear cart
    const cartCollection = db.collection("shopping_cart")
    await cartCollection.deleteMany({ userId: new ObjectId(decoded.userId) })

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 })
  }
}
