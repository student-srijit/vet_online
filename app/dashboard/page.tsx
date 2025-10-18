"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Heart, Activity, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface Pet {
  name: string
  age: string
  breed: string
  healthScore: number
  activitiesToday: number
  nextMeal: string
  status: string
}

interface User {
  _id: string
  fullName: string
  email: string
  pets: Pet[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          window.location.href = "/auth/login"
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No user data found</div>
        </div>
      </DashboardLayout>
    )
  }

  const currentPet = user.pets[0] // Get the first pet for now
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}! 🐾</h2>
            <p className="text-white/90">Your furry friend is waiting for some love today</p>
          </div>
          <div className="text-6xl">🐕</div>
        </div>
      </div>

      {/* Date Display */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">{currentDate}</p>
      </div>

      {/* Quick Stats */}
      {currentPet && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Health Score</p>
                <p className="text-4xl font-bold text-pink-600">{currentPet.healthScore}%</p>
              </div>
              <Heart className="text-pink-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Activities Today</p>
                <p className="text-4xl font-bold text-purple-600">{currentPet.activitiesToday}</p>
              </div>
              <Activity className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Next Meal</p>
                <p className="text-4xl font-bold text-yellow-600">{currentPet.nextMeal}</p>
              </div>
              <Clock className="text-yellow-500" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Pet Card */}
      {currentPet ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{currentPet.name}</h3>
              <p className="text-gray-600">{currentPet.breed} • {currentPet.age}</p>
            </div>
            <div className="text-6xl">🐕</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Health Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${currentPet.healthScore}%` }}
                  ></div>
                </div>
                <span className="font-bold text-green-600">{currentPet.healthScore}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Next Meal</p>
              <p className="font-bold text-cyan-600">{currentPet.nextMeal}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Activities</p>
              <p className="font-bold text-pink-600">{currentPet.activitiesToday} today</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Status</p>
              <p className="font-bold text-orange-600">{currentPet.status} 😊</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">Edit Profile</Button>
            <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white">Update Photo</Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Pet Added Yet</h3>
          <p className="text-gray-600 mb-6">Add your first pet to get started with tracking!</p>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Add Pet</Button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all">
            <span className="text-3xl">📸</span>
            <span className="font-semibold">Take Photo</span>
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all">
            <span className="text-3xl">❤️</span>
            <span className="font-semibold">Log Activity</span>
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all">
            <span className="text-3xl">📅</span>
            <span className="font-semibold">Schedule</span>
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all">
            <span className="text-3xl">🛒</span>
            <span className="font-semibold">Order Food</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
