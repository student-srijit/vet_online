"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { NotificationBell } from "./notification-bell"
import { Settings } from "lucide-react"
import Link from "next/link"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-48">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">{currentDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard/settings" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 min-h-screen">{children}</div>
      </div>
    </div>
  )
}
