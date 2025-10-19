"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Brain, Activity, Clock, Heart } from "lucide-react"

interface ActivityLoggerProps {
  isOpen: boolean
  onClose: () => void
  petInfo?: string
}

interface Activity {
  type: string
  duration: string
  intensity: string
  notes: string
  timestamp: Date
}

export function SmartActivityLogger({ isOpen, onClose, petInfo }: ActivityLoggerProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentActivity, setCurrentActivity] = useState({
    type: "",
    duration: "",
    intensity: "moderate",
    notes: ""
  })
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const activityTypes = [
    "Walk", "Run", "Play", "Swimming", "Training", "Grooming", 
    "Feeding", "Rest", "Socialization", "Mental Stimulation"
  ]

  const intensityLevels = [
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "moderate", label: "Moderate", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-red-500" }
  ]

  const addActivity = () => {
    if (!currentActivity.type || !currentActivity.duration) return

    const newActivity: Activity = {
      ...currentActivity,
      timestamp: new Date()
    }

    setActivities(prev => [...prev, newActivity])
    setCurrentActivity({
      type: "",
      duration: "",
      intensity: "moderate",
      notes: ""
    })
  }

  const generateAISuggestions = async () => {
    if (!petInfo) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/activity-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petInfo,
          recentActivities: activities.slice(-5), // Last 5 activities
          currentTime: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveActivities = async () => {
    if (activities.length === 0) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/activities/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activities,
          petInfo
        }),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Error saving activities:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-500" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Smart Activity Logger</h2>
                <p className="text-gray-600 text-sm">Track your pet's activities with AI insights</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="text-purple-500" size={18} />
                <h3 className="font-semibold text-gray-800">AI Activity Suggestions</h3>
              </div>
              <Button
                onClick={generateAISuggestions}
                disabled={loading}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {loading ? "Generating..." : "Get Suggestions"}
              </Button>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 text-sm text-gray-700">
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Activity Form */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Add New Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  value={currentActivity.type}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select activity...</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <Input
                  value={currentActivity.duration}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 30 minutes"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity
                </label>
                <div className="flex gap-2">
                  {intensityLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setCurrentActivity(prev => ({ ...prev, intensity: level.value }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        currentActivity.intensity === level.value ? level.color : 'bg-gray-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <Input
                  value={currentActivity.notes}
                  onChange={(e) => setCurrentActivity(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={addActivity}
              disabled={!currentActivity.type || !currentActivity.duration}
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2" size={16} />
              Add Activity
            </Button>
          </div>

          {/* Activities List */}
          {activities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Today's Activities</h3>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          intensityLevels.find(l => l.value === activity.intensity)?.color || 'bg-gray-300'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-800">{activity.type}</h4>
                          <p className="text-sm text-gray-600">
                            {activity.duration} • {activity.intensity} intensity
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                        {activity.notes && (
                          <p className="text-xs text-gray-400 mt-1">{activity.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={saveActivities}
              disabled={activities.length === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white"
            >
              Save Activities
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
