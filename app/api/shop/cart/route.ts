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

    const { productId, quantity } = await req.json()

    const db = await getDB()
    const cartCollection = db.collection("shopping_cart")

    const existingItem = await cartCollection.findOne({
      userId: new ObjectId(decoded.userId),
      productId,
    })

    if (existingItem) {
      await cartCollection.updateOne({ userId: new ObjectId(decoded.userId), productId }, { $inc: { quantity } })
    } else {
      await cartCollection.insertOne({
        userId: new ObjectId(decoded.userId),
        productId,
        quantity,
        addedAt: new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart error:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
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
    const cartCollection = db.collection("shopping_cart")

    const cartItems = await cartCollection.find({ userId: new ObjectId(decoded.userId) }).toArray()

    return NextResponse.json({
      success: true,
      items: cartItems.map((item) => ({
        id: item._id.toString(),
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}
