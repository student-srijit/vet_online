"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, PawPrint, Calendar, FileText, Brain, MapPin, ShoppingCart, LogOut, Settings, TrendingUp } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUserInfo({
            fullName: data.user.fullName,
            email: data.user.email,
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  const menuItems = [
    { icon: Home, label: "Homepage", href: "/dashboard" },
    { icon: PawPrint, label: "Pet Profile", href: "/dashboard/pet-profile" },
    { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
    { icon: FileText, label: "Records", href: "/dashboard/records" },
    { icon: Brain, label: "AI Monitoring", href: "/dashboard/ai-monitoring" },
    { icon: TrendingUp, label: "Health Insights", href: "/dashboard/health-insights" },
    { icon: MapPin, label: "Vet Support", href: "/dashboard/vet-support" },
    { icon: ShoppingCart, label: "Shop", href: "/dashboard/shop" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/auth/login")
  }

  return (
    <div className="w-48 bg-white shadow-lg h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
            AP
          </div>
          <div>
            <h1 className="font-bold text-gray-800">AutoPaws</h1>
            <p className="text-xs text-gray-500">Pet Care</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.label === "Schedule" && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              )}
              {item.label === "Vet Support" && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-cyan-50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full flex items-center justify-center text-white">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {userInfo ? userInfo.fullName : "Loading..."}
            </p>
            <p className="text-xs text-gray-500 truncate">Pet Parent</p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}
