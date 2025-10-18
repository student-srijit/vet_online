import { getDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

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
    const remindersCollection = db.collection("reminders")
    const notificationsCollection = db.collection("notifications")
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    // Check for reminders due today or tomorrow
    const upcomingReminders = await remindersCollection
      .find({ 
        userId: new (await import("mongodb")).ObjectId(userId),
        isActive: true,
        date: { $gte: today, $lte: tomorrow }
      })
      .sort({ date: 1 })
      .toArray()

    // Get recent notifications (last 7 days)
    const recentNotifications = await notificationsCollection
      .find({ 
        userId: new (await import("mongodb")).ObjectId(userId),
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Create notifications for upcoming reminders
    const newNotifications = []
    for (const reminder of upcomingReminders) {
      const existingNotification = recentNotifications.find(notif => 
        notif.reminderId?.toString() === reminder._id.toString()
      )
      
      if (!existingNotification) {
        const notification = {
          userId: new (await import("mongodb")).ObjectId(userId),
          type: "reminder",
          title: "Upcoming Appointment",
          message: `${reminder.type}: ${reminder.description}`,
          reminderId: reminder._id,
          isRead: false,
          createdAt: new Date()
        }
        
        await notificationsCollection.insertOne(notification)
        newNotifications.push(notification)
      }
    }

    // Get all unread notifications
    const unreadNotifications = await notificationsCollection
      .find({ 
        userId: new (await import("mongodb")).ObjectId(userId),
        isRead: false
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ 
      notifications: unreadNotifications,
      upcomingReminders,
      newNotifications: newNotifications.length
    }, { status: 200 })
  } catch (error) {
    console.error("Notifications check error:", error)
    return NextResponse.json({ error: "Failed to check notifications" }, { status: 500 })
  }
}
