"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface Pet {
  _id: string
  name: string
  age: string
  breed: string
  healthScore: number
  activitiesToday: number
  nextMeal: string
  status: string
  weight?: string
  color?: string
  dateOfBirth?: string
  createdAt: Date
}

interface User {
  _id: string
  fullName: string
  email: string
  pets: Pet[]
}

export default function PetProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [petData, setPetData] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    dateOfBirth: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const response = await fetch("/api/pets/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser({
            _id: "user_id",
            fullName: data.user.fullName,
            email: data.user.email,
            pets: data.pets
          })
          
          // Set pet data from the first pet
          if (data.pets && data.pets.length > 0) {
            const pet = data.pets[0]
            setPetData({
              name: pet.name || "",
              breed: pet.breed || "",
              age: pet.age || "",
              weight: pet.weight || "",
              color: pet.color || "",
              dateOfBirth: pet.dateOfBirth || "",
            })
          }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user || !user.pets || user.pets.length === 0) return

    console.log("Saving pet data:", petData)
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/pets/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petData,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        // Refresh user data
        const profileResponse = await fetch("/api/pets/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (profileResponse.ok) {
          const data = await profileResponse.json()
          setUser({
            _id: "user_id",
            fullName: data.user.fullName,
            email: data.user.email,
            pets: data.pets
          })
        }
      } else {
        const errorData = await response.json()
        console.error("Failed to update pet:", errorData)
        alert(`Failed to update pet: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error updating pet:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pet profile...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !user.pets || user.pets.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg mb-4">No pet found</div>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Add Pet</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const currentPet = user.pets[0]

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold">Pet Profile</h2>
        <p className="text-white/90">Manage your pet's information and health records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pet Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{petData.name || currentPet.name}</h3>
                <p className="text-gray-600">
                  {petData.breed || currentPet.breed} • {petData.age || currentPet.age}
                </p>
              </div>
              <div className="text-7xl">🐕</div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Pet Name</label>
                  <Input
                    name="name"
                    value={petData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Breed</label>
                  <Input
                    name="breed"
                    value={petData.breed}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Age</label>
                  <Input
                    name="age"
                    value={petData.age}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Weight</label>
                  <Input
                    name="weight"
                    value={petData.weight}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Color</label>
                  <Input
                    name="color"
                    value={petData.color}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Date of Birth</label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={petData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Health & Activity */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Health & Activity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-2">Health Score</p>
                  <p className="text-3xl font-bold text-green-600">{currentPet.healthScore}%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-2">Activities Today</p>
                  <p className="text-3xl font-bold text-pink-600">{currentPet.activitiesToday}</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Edit Profile
                  </Button>
                  <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white">Update Photo</Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline" 
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Health Score</span>
                <span className="font-bold text-green-600">{currentPet.healthScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Daily Activities</span>
                <span className="font-bold text-purple-600">{currentPet.activitiesToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-bold text-pink-600">{currentPet.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">🍽️</span>
                <span className="text-gray-600">Next meal: {currentPet.nextMeal}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">❤️</span>
                <span className="text-gray-600">Health: {currentPet.healthScore}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">😊</span>
                <span className="text-gray-600">Status: {currentPet.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
