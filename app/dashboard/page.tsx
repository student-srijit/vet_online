"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Heart, Activity, Clock, Camera, Calendar, ShoppingCart, Brain, MapPin, Bell, TrendingUp, Zap, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPetModal } from "@/components/add-pet-modal"
import { AIPhotoAnalyzer } from "@/components/ai-photo-analyzer"
import { SmartActivityLogger } from "@/components/smart-activity-logger"
import { useEffect, useState } from "react"

interface Pet {
  _id: string
  name: string
  age: string
  breed: string
  weight?: string
  color?: string
  dateOfBirth?: string
  healthScore: number
  activitiesToday: number
  nextMeal: string
  status: string
  createdAt: Date
  updatedAt: Date
}

interface User {
  _id: string
  fullName: string
  email: string
  pets: Pet[]
}

interface AIInsight {
  type: 'health' | 'activity' | 'nutrition' | 'behavior'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action?: string
}

interface SmartRecommendation {
  category: string
  title: string
  description: string
  icon: string
  action: () => void
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddPetModal, setShowAddPetModal] = useState(false)
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false)
  const [showActivityLogger, setShowActivityLogger] = useState(false)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([])
  const [weatherData, setWeatherData] = useState<any>(null)
  const [petMood, setPetMood] = useState<string>("Happy")
  const [dailyGoals, setDailyGoals] = useState({
    exercise: 0,
    meals: 0,
    playtime: 0,
    grooming: 0
  })
  const [healthData, setHealthData] = useState({
    healthScore: 95,
    nextMeal: "08:00",
    activitiesToday: 0,
    status: "Happy"
  })

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
          _id: "user_id", // We don't need the actual user ID for display
          fullName: data.user.fullName,
          email: data.user.email,
          pets: data.pets
        })
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

  // Get current pet from user data
  const currentPet = user?.pets?.[0] // Get the first pet for now

  useEffect(() => {
    fetchUserData()
    fetchWeatherData()
  }, [])

  useEffect(() => {
    if (currentPet) {
      fetchHealthData()
      generateAIInsights()
      generateSmartRecommendations()
      updatePetMood()
    }
  }, [currentPet])

  const handlePetAdded = () => {
    fetchUserData() // Refresh the data
  }

  // Fetch real-time health data
  const fetchHealthData = async () => {
    if (!currentPet) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/pets/health-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHealthData(data.healthData)
      }
    } catch (error) {
      console.error("Error fetching health data:", error)
    }
  }

  // AI-powered insight generation
  const generateAIInsights = async () => {
    if (!currentPet) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/health-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petInfo: `${currentPet.name}, ${currentPet.breed}, ${currentPet.age}`,
          healthScore: currentPet.healthScore,
          activities: currentPet.activitiesToday
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiInsights(data.insights || [])
      }
    } catch (error) {
      console.error("Error generating AI insights:", error)
    }
  }

  // Generate smart recommendations based on pet data and time
  const generateSmartRecommendations = () => {
    if (!currentPet) return

    const currentHour = new Date().getHours()
    const recommendations: SmartRecommendation[] = []

    // Time-based recommendations
    if (currentHour >= 6 && currentHour < 10) {
      recommendations.push({
        category: "Morning Routine",
        title: "Morning Walk",
        description: "Perfect time for a refreshing walk!",
        icon: "🚶‍♂️",
        action: () => window.location.href = "/dashboard/schedule"
      })
    }

    if (currentHour >= 12 && currentHour < 14) {
      recommendations.push({
        category: "Lunch Time",
        title: "Meal Time",
        description: "Time for your pet's lunch!",
        icon: "🍽️",
        action: () => window.location.href = "/dashboard/schedule"
      })
    }

    if (currentHour >= 17 && currentHour < 19) {
      recommendations.push({
        category: "Evening Activity",
        title: "Play Session",
        description: "Great time for some fun activities!",
        icon: "🎾",
        action: () => window.location.href = "/dashboard/schedule"
      })
    }

    // Health-based recommendations
    if (healthData.healthScore < 80) {
      recommendations.push({
        category: "Health Alert",
        title: "Health Check",
        description: "Consider a vet visit for optimal health",
        icon: "🏥",
        action: () => window.location.href = "/dashboard/vet-support"
      })
    }

    // Activity-based recommendations
    if (healthData.activitiesToday < 3) {
      recommendations.push({
        category: "Activity Boost",
        title: "More Exercise",
        description: "Your pet needs more activity today!",
        icon: "💪",
        action: () => window.location.href = "/dashboard/schedule"
      })
    }

    setSmartRecommendations(recommendations)
  }

  // Fetch weather data for outdoor activity recommendations
  const fetchWeatherData = async () => {
    try {
      // Using a free weather API (you can replace with your preferred service)
      const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo&units=metric")
      if (response.ok) {
        const data = await response.json()
        setWeatherData(data)
      }
    } catch (error) {
      console.error("Error fetching weather:", error)
    }
  }

  // Update pet mood based on various factors
  const updatePetMood = () => {
    if (!currentPet) return

    let mood = "Happy"
    if (healthData.healthScore < 70) mood = "Needs Care"
    else if (healthData.activitiesToday < 2) mood = "Bored"
    else if (healthData.healthScore > 90 && healthData.activitiesToday > 4) mood = "Excited"

    setPetMood(mood)
  }

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

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <DashboardLayout>
      {/* AI-Powered Welcome Banner */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-yellow-300" size={24} />
              <h2 className="text-3xl font-bold">Welcome back, {user.fullName}! 🐾</h2>
            </div>
            <p className="text-white/90 mb-2">Your AI-powered pet care companion is ready</p>
            {currentPet && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Pet Status: {petMood}</span>
                </div>
                {weatherData && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌤️ {weatherData.main?.temp}°C</span>
                    <span className="text-xs">Perfect for outdoor activities!</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-6xl animate-bounce">🐕</div>
        </div>
      </div>

      {/* Smart Date & Time Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Brain className="text-purple-500" size={32} />
              AI Dashboard
            </h1>
            <p className="text-gray-600">{currentDate}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last AI Update</div>
            <div className="text-sm font-medium text-purple-600">Just now</div>
            <Button
              onClick={() => {
                fetchHealthData()
                generateAIInsights()
                generateSmartRecommendations()
              }}
              size="sm"
              className="mt-2 bg-purple-500 hover:bg-purple-600 text-white"
            >
              🔄 Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {currentPet && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Health Score</p>
                <p className="text-4xl font-bold text-pink-600">{healthData.healthScore}%</p>
              </div>
              <Heart className="text-pink-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Activities Today</p>
                <p className="text-4xl font-bold text-purple-600">{healthData.activitiesToday}</p>
              </div>
              <Activity className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Next Meal</p>
                <p className="text-4xl font-bold text-yellow-600">{healthData.nextMeal}</p>
              </div>
              <Clock className="text-yellow-500" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="text-purple-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">AI Health Insights</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                insight.priority === 'high' ? 'border-red-500' : 
                insight.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-600' : 
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                {insight.action && (
                  <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    {insight.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {smartRecommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-yellow-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Smart Recommendations</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-200 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartRecommendations.map((rec, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 shadow-sm border border-yellow-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{rec.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <p className="text-xs text-gray-500">{rec.category}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                <Button 
                  onClick={rec.action}
                  size="sm" 
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Take Action
                </Button>
              </div>
            ))}
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
              {currentPet.weight && (
                <p className="text-gray-500 text-sm">Weight: {currentPet.weight}</p>
              )}
              {currentPet.color && (
                <p className="text-gray-500 text-sm">Color: {currentPet.color}</p>
              )}
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
                    style={{ width: `${healthData.healthScore}%` }}
                  ></div>
                </div>
                <span className="font-bold text-green-600">{healthData.healthScore}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Next Meal</p>
              <p className="font-bold text-cyan-600">{healthData.nextMeal}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Activities</p>
              <p className="font-bold text-pink-600">{healthData.activitiesToday} today</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Status</p>
              <p className="font-bold text-orange-600">{healthData.status} 😊</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.href = '/dashboard/pet-profile'}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Edit Profile
            </Button>
            <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white">Update Photo</Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Pet Added Yet</h3>
          <p className="text-gray-600 mb-6">Add your first pet to get started with AI-powered tracking!</p>
          <Button 
            onClick={() => setShowAddPetModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Add Pet
          </Button>
        </div>
      )}

      {/* AI-Powered Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Star className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">AI-Powered Actions</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowPhotoAnalyzer(true)}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Camera className="text-3xl" />
            <span className="font-semibold">AI Photo Analysis</span>
            <span className="text-xs opacity-90">Smart health detection</span>
          </button>
          
          <button 
            onClick={() => setShowActivityLogger(true)}
            className="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Activity className="text-3xl" />
            <span className="font-semibold">Log Activity</span>
            <span className="text-xs opacity-90">AI-powered tracking</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/schedule'}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Calendar className="text-3xl" />
            <span className="font-semibold">Smart Schedule</span>
            <span className="text-xs opacity-90">AI-optimized routine</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/shop'}
            className="bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <ShoppingCart className="text-3xl" />
            <span className="font-semibold">Smart Shopping</span>
            <span className="text-xs opacity-90">AI recommendations</span>
          </button>
        </div>
      </div>

      {/* Advanced AI Features */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-purple-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Advanced AI Features</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard/vet-support'}
            className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Heart className="text-3xl" />
            <span className="font-semibold">AI Vet Chat</span>
            <span className="text-xs opacity-90">24/7 health support</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/health-insights'}
            className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <TrendingUp className="text-3xl" />
            <span className="font-semibold">Health Analytics</span>
            <span className="text-xs opacity-90">AI predictions</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/tracking'}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl p-6 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <MapPin className="text-3xl" />
            <span className="font-semibold">Smart Tracking</span>
            <span className="text-xs opacity-90">GPS + AI insights</span>
          </button>
        </div>
      </div>

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onPetAdded={handlePetAdded}
      />

      {/* AI Photo Analyzer Modal */}
      <AIPhotoAnalyzer
        isOpen={showPhotoAnalyzer}
        onClose={() => setShowPhotoAnalyzer(false)}
        petInfo={currentPet ? `${currentPet.name}, ${currentPet.breed}, ${currentPet.age}` : undefined}
      />

      {/* Smart Activity Logger Modal */}
      <SmartActivityLogger
        isOpen={showActivityLogger}
        onClose={() => setShowActivityLogger(false)}
        petInfo={currentPet ? `${currentPet.name}, ${currentPet.breed}, ${currentPet.age}` : undefined}
      />
    </DashboardLayout>
  )
}
