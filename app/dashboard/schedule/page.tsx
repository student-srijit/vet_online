"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Zap, 
  Brain, 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer,
  Activity,
  Heart,
  Utensils,
  PawPrint,
  Stethoscope,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from "lucide-react"

interface Schedule {
  id: string
  scheduleType: string
  time: string
  days: string[]
  description: string
  isAIRecommended?: boolean
  priority?: 'low' | 'medium' | 'high'
  weatherDependent?: boolean
  healthBased?: boolean
  completed?: boolean
}

interface PetData {
  name: string
  breed: string
  age: number
  weight: number
  activityLevel: string
  healthStatus: string
}

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
}

interface AIRecommendation {
  type: string
  reason: string
  optimalTime: string
  priority: 'low' | 'medium' | 'high'
  healthBenefit: string
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [petData, setPetData] = useState<PetData | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [formData, setFormData] = useState({
    scheduleType: "Feeding Time",
    time: "09:00",
    description: "",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    priority: "medium" as 'low' | 'medium' | 'high',
    weatherDependent: false,
    healthBased: false
  })
  const [loading, setLoading] = useState(true)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)

  useEffect(() => {
    fetchPetData()
    fetchSchedules()
    fetchWeatherData()
    generateAIRecommendations()
  }, [])

  const fetchPetData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user.pets && data.user.pets.length > 0) {
          const pet = data.user.pets[0]
          setPetData({
            name: pet.name,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight || 0,
            activityLevel: "moderate",
            healthStatus: "healthy"
          })
        }
      }
    } catch (error) {
      console.error("Error fetching pet data:", error)
    }
  }

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/schedule/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules || [])
      } else {
        // Generate default AI-recommended schedules
        generateDefaultSchedules()
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
      generateDefaultSchedules()
    } finally {
      setLoading(false)
    }
  }

  const generateDefaultSchedules = async () => {
    // Generate AI schedules instead of hardcoded ones
    try {
      await generateAndAddAllAISchedules()
    } catch (error) {
      console.error("Error generating default AI schedules:", error)
      // If AI fails, show empty state
      setSchedules([])
    }
  }

  const fetchWeatherData = async () => {
    // Simulate weather data - in real app, would call weather API
    setWeatherData({
      temperature: 22,
      condition: "sunny",
      humidity: 65,
      windSpeed: 8
    })
  }

  const generateAIRecommendations = async () => {
    setAiAnalyzing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/schedule-insights", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        const recommendations: AIRecommendation[] = data.schedules.map((schedule: any) => ({
          type: schedule.type,
          reason: schedule.description,
          optimalTime: schedule.time,
          priority: schedule.priority,
          healthBenefit: schedule.healthBenefit
        }))
        setAiRecommendations(recommendations)
        setAiInsights(data.analysis)
      } else {
        throw new Error("Failed to fetch AI recommendations")
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      // No fallback - keep it AI-powered
      setAiRecommendations([])
    } finally {
      setAiAnalyzing(false)
    }
  }

  const generateAndAddAllAISchedules = async () => {
    setAiAnalyzing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/schedule-insights", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAiInsights(data.analysis)
        
        // Add all AI schedules to the database
        const schedulesToAdd = data.schedules
        const addedSchedules: Schedule[] = []
        
        for (const scheduleData of schedulesToAdd) {
          const newSchedule = {
            scheduleType: scheduleData.type,
            time: scheduleData.time,
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            description: scheduleData.description,
            priority: scheduleData.priority,
            weatherDependent: scheduleData.weatherDependent || false,
            healthBased: scheduleData.healthBased || true,
            isAIRecommended: true
          }

          try {
            const createResponse = await fetch("/api/schedule/create", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(newSchedule)
            })

            if (createResponse.ok) {
              const createData = await createResponse.json()
              const addedSchedule: Schedule = {
                id: createData.scheduleId,
                scheduleType: scheduleData.type,
                time: scheduleData.time,
                days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                description: scheduleData.description,
                isAIRecommended: true,
                priority: scheduleData.priority,
                weatherDependent: scheduleData.weatherDependent || false,
                healthBased: scheduleData.healthBased || true,
                completed: false
              }
              addedSchedules.push(addedSchedule)
            }
          } catch (error) {
            console.error("Error adding individual schedule:", error)
          }
        }
        
        // Update the schedules state with all added schedules
        setSchedules(prevSchedules => [...prevSchedules, ...addedSchedules])
        
        // Clear recommendations since they're now added to schedule
        setAiRecommendations([])
        
      } else {
        throw new Error("Failed to fetch AI schedules")
      }
    } catch (error) {
      console.error("Error generating AI schedules:", error)
    } finally {
      setAiAnalyzing(false)
    }
  }

  const fetchAIInsights = async () => {
    setAiAnalyzing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/schedule-insights", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAiInsights(data.analysis)
        setShowAIInsights(true)
      } else {
        throw new Error("Failed to fetch AI insights")
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error)
      // No fallback - keep it AI-powered
      setAiInsights(null)
    } finally {
      setAiAnalyzing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
    setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddSchedule = async () => {
    if (!formData.time) return

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      scheduleType: formData.scheduleType,
      time: formData.time,
      days: formData.days,
      description: formData.description,
      priority: formData.priority,
      weatherDependent: formData.weatherDependent,
      healthBased: formData.healthBased
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/schedule/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSchedule)
      })

      if (response.ok) {
        setSchedules([...schedules, newSchedule])
        setFormData({ 
          scheduleType: "Feeding Time", 
          time: "09:00", 
          description: "",
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          priority: "medium",
          weatherDependent: false,
          healthBased: false
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error adding schedule:", error)
      // Fallback to local state
    setSchedules([...schedules, newSchedule])
      setFormData({ 
        scheduleType: "Feeding Time", 
        time: "09:00", 
        description: "",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        priority: "medium",
        weatherDependent: false,
        healthBased: false
      })
    setShowForm(false)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/schedule/delete", {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduleId: id })
      })

      if (response.ok) {
        setSchedules(schedules.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      // Fallback to local state
    setSchedules(schedules.filter((s) => s.id !== id))
    }
  }

  const handleToggleComplete = async (id: string) => {
    const schedule = schedules.find(s => s.id === id)
    if (!schedule) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/schedule/update", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleId: id,
          completed: !schedule.completed
        })
      })

      if (response.ok) {
        setSchedules(schedules.map(s => 
          s.id === id 
            ? { ...s, completed: !s.completed }
            : s
        ))
      }
    } catch (error) {
      console.error("Error updating schedule:", error)
      // Fallback to local state
      setSchedules(schedules.map(s => 
        s.id === id 
          ? { ...s, completed: !s.completed }
          : s
      ))
    }
  }

  const addAIRecommendation = async (recommendation: AIRecommendation) => {
    const newSchedule = {
      scheduleType: recommendation.type,
      time: recommendation.optimalTime,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      description: recommendation.reason,
      priority: recommendation.priority,
      weatherDependent: false,
      healthBased: true,
      isAIRecommended: true
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/schedule/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSchedule)
      })

      if (response.ok) {
        const data = await response.json()
        const addedSchedule: Schedule = {
          id: data.scheduleId,
          scheduleType: recommendation.type,
          time: recommendation.optimalTime,
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          description: recommendation.reason,
          isAIRecommended: true,
          priority: recommendation.priority,
          healthBased: true,
          completed: false
        }
        setSchedules([...schedules, addedSchedule])
        
        // Remove from recommendations
        setAiRecommendations(aiRecommendations.filter(rec => rec.type !== recommendation.type))
      }
    } catch (error) {
      console.error("Error adding AI recommendation:", error)
      // Fallback to local state
      const fallbackSchedule: Schedule = {
        id: Date.now().toString(),
        scheduleType: recommendation.type,
        time: recommendation.optimalTime,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        description: recommendation.reason,
        isAIRecommended: true,
        priority: recommendation.priority,
        healthBased: true,
        completed: false
      }
      setSchedules([...schedules, fallbackSchedule])
      setAiRecommendations(aiRecommendations.filter(rec => rec.type !== recommendation.type))
    }
  }

  const getScheduleIcon = (type: string) => {
    if (type.includes("Feeding") || type.includes("Meal")) return <Utensils size={24} />
    if (type.includes("Exercise") || type.includes("Walk") || type.includes("Play")) return <Activity size={24} />
    if (type.includes("Vet") || type.includes("Health")) return <Stethoscope size={24} />
    if (type.includes("Hydration")) return <Heart size={24} />
    if (type.includes("Mental") || type.includes("Stimulation")) return <Brain size={24} />
    if (type.includes("Joint") || type.includes("Care")) return <PawPrint size={24} />
    return <Clock size={24} />
  }

  const getScheduleColor = (schedule: Schedule) => {
    if (schedule.completed) return "border-green-500 bg-green-50"
    if (schedule.isAIRecommended) return "border-blue-500 bg-blue-50"
    if (schedule.priority === 'high') return "border-red-500 bg-red-50"
    if (schedule.priority === 'medium') return "border-yellow-500 bg-yellow-50"
    return "border-gray-500 bg-gray-50"
  }

  const getWeatherIcon = () => {
    if (!weatherData) return <Cloud size={20} />
    switch (weatherData.condition) {
      case "sunny": return <Sun size={20} className="text-yellow-500" />
      case "rainy": return <CloudRain size={20} className="text-blue-500" />
      default: return <Cloud size={20} className="text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI-powered schedule...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">AI-Powered Schedule & Activities</h2>
            <p className="text-white/90">Intelligent pet care scheduling with weather and health insights</p>
            {petData && (
              <p className="text-white/80 text-sm mt-2">
                🐾 Optimized for {petData.name} ({petData.breed}, {petData.age} years old)
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchAIInsights}
              disabled={aiAnalyzing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {aiAnalyzing ? (
                <>
                  <Brain className="animate-spin mr-2" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2" size={20} />
                  AI Insights
                </>
              )}
            </Button>
            <Button
              onClick={generateAndAddAllAISchedules}
              disabled={aiAnalyzing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {aiAnalyzing ? (
                <>
                  <Sparkles className="animate-spin mr-2" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2" size={20} />
                  AI Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Weather & Health Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3">
            {getWeatherIcon()}
            <div>
              <p className="text-sm text-gray-600">Weather</p>
              <p className="font-semibold text-gray-800">
                {weatherData ? `${weatherData.temperature}°C ${weatherData.condition}` : "Loading..."}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-3">
            <Heart className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Health Status</p>
              <p className="font-semibold text-gray-800">
                {petData ? petData.healthStatus : "Healthy"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Activity Level</p>
              <p className="font-semibold text-gray-800">
                {petData ? petData.activityLevel : "Moderate"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Schedule */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Today's AI-Optimized Schedule</h3>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Brain size={12} className="mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {schedules.filter(s => s.completed).length}/{schedules.length} Completed
                </Badge>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {schedules.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Schedules Yet</h3>
                  <p className="text-gray-600 mb-4">Let AI create the perfect schedule for your pet!</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={fetchAIInsights}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    >
                      <Brain className="mr-2" size={20} />
                      Get AI Insights
                    </Button>
                    <Button
                      onClick={generateAndAddAllAISchedules}
                      className="bg-gradient-to-r from-green-600 to-teal-600 text-white"
                    >
                      <Zap className="mr-2" size={20} />
                      Generate AI Schedules
                    </Button>
                  </div>
                </div>
              ) : (
                schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`border-l-4 rounded-lg p-4 flex items-center justify-between transition-all hover:shadow-md ${getScheduleColor(schedule)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600">
                      {getScheduleIcon(schedule.scheduleType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{schedule.scheduleType}</h4>
                        {schedule.isAIRecommended && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                            <Sparkles size={10} className="mr-1" />
                            AI
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getPriorityColor(schedule.priority || 'medium')}`}>
                          {schedule.priority || 'medium'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{schedule.time}</p>
                      <p className="text-xs text-gray-500">{schedule.description}</p>
                      <div className="flex gap-2 mt-2">
                        {schedule.weatherDependent && (
                          <Badge variant="outline" className="text-xs">
                            <Cloud size={10} className="mr-1" />
                            Weather
                          </Badge>
                        )}
                        {schedule.healthBased && (
                          <Badge variant="outline" className="text-xs">
                            <Heart size={10} className="mr-1" />
                            Health
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleComplete(schedule.id)}
                      className={`p-2 rounded-lg transition-all ${
                        schedule.completed 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle size={20} />
                    </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                </div>
                ))
              )}
            </div>

            {/* Add Schedule Form */}
            {showForm ? (
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <h4 className="font-bold text-gray-800 mb-4">Add New Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Activity Type</label>
                    <select
                      name="scheduleType"
                      value={formData.scheduleType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Feeding Time</option>
                      <option>Exercise & Play</option>
                      <option>Vet Checkup</option>
                      <option>Grooming</option>
                      <option>Mental Stimulation</option>
                      <option>Hydration Check</option>
                      <option>Joint Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Time</label>
                    <Input
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Description</label>
                    <Input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add notes..."
                      className="bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="weatherDependent"
                          checked={formData.weatherDependent}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Weather Dependent</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="healthBased"
                          checked={formData.healthBased}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Health Based</span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <Button onClick={handleAddSchedule} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                      Add Schedule
                    </Button>
                    <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add New Activity
              </Button>
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-blue-600" size={20} />
              <h4 className="font-bold text-gray-800">AI Recommendations</h4>
            </div>
            <div className="space-y-3">
              {aiRecommendations.length === 0 ? (
                <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <Brain className="text-blue-500 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600 mb-3">No AI recommendations yet</p>
                  <Button
                    onClick={generateAIRecommendations}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Zap size={12} className="mr-1" />
                    Generate Recommendations
                  </Button>
                </div>
              ) : (
                aiRecommendations.map((rec, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-blue-800 text-sm">{rec.type}</h5>
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">{rec.reason}</p>
                  <p className="text-xs text-blue-600 mb-2">💡 {rec.healthBenefit}</p>
                  <Button
                    onClick={() => addAIRecommendation(rec)}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <Plus size={12} className="mr-1" />
                    Add to Schedule
                  </Button>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                onClick={() => setFormData(prev => ({ ...prev, scheduleType: "Feeding Time", time: "07:00" })) && setShowForm(true)}
                className="w-full bg-gradient-to-r from-cyan-400 to-teal-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Utensils size={16} className="mr-2" />
                Add Meal Time
              </Button>
              <Button 
                onClick={() => setFormData(prev => ({ ...prev, scheduleType: "Exercise & Play", time: "16:00" })) && setShowForm(true)}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Activity size={16} className="mr-2" />
                Schedule Exercise
              </Button>
              <Button 
                onClick={() => setFormData(prev => ({ ...prev, scheduleType: "Vet Checkup", time: "10:00" })) && setShowForm(true)}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Stethoscope size={16} className="mr-2" />
                Vet Appointment
              </Button>
            </div>
          </div>

          {/* Smart Notifications */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-cyan-200">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-cyan-600" size={24} />
              <h4 className="font-bold text-gray-800">Smart Notifications</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered reminders based on weather, health, and behavior patterns.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Weather alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Health reminders</span>
              </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">Activity notifications</span>
            </label>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && aiInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Breed Analysis</h2>
                    <p className="text-gray-600">Comprehensive insights for {petData?.name}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAIInsights(false)}
                  variant="outline"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breed Characteristics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <PawPrint className="text-blue-600" size={20} />
                    Breed Characteristics
                  </h3>
                  <p className="text-gray-700">{aiInsights.breedCharacteristics}</p>
                </Card>

                {/* Activity Needs */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="text-green-600" size={20} />
                    Activity Needs
                  </h3>
                  <p className="text-gray-700">{aiInsights.activityNeeds}</p>
                </Card>

                {/* Health Considerations */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Heart className="text-red-600" size={20} />
                    Health Considerations
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.healthConsiderations.map((consideration: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Feeding Recommendations */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Utensils className="text-purple-600" size={20} />
                    Feeding Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.feedingRecommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Grooming Needs */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="text-pink-600" size={20} />
                    Grooming Needs
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.groomingNeeds.map((need: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{need}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Behavioral Insights */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Brain className="text-indigo-600" size={20} />
                    Behavioral Insights
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.behavioralInsights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {aiInsights.ageSpecificNeeds && aiInsights.ageSpecificNeeds.length > 0 && (
                <Card className="p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="text-orange-600" size={20} />
                    Age-Specific Needs
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.ageSpecificNeeds.map((need: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{need}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={async () => {
                    await generateAndAddAllAISchedules()
                    setShowAIInsights(false)
                  }}
                  disabled={aiAnalyzing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {aiAnalyzing ? (
                    <>
                      <Sparkles className="animate-spin mr-2" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2" size={20} />
                      Generate AI Schedules
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowAIInsights(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
