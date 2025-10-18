"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { TrendingUp, AlertTriangle, CheckCircle, Calendar, Target, Award } from "lucide-react"

interface HealthInsights {
  summary: {
    title: string
    description: string
    keyPoints: string[]
  }
  trends: {
    activityLevel: { level: string; score: number; description: string }
    vaccinationCompliance: { status: string; daysSince: number; description: string }
    weightStability: { status: string; description: string }
    dentalHealth: { status: string; daysSince: number; description: string }
    overallHealth: { score: number; grade: string; description: string }
  }
  recommendations: Array<{
    priority: string
    category: string
    title: string
    description: string
    action: string
  }>
  alerts: Array<{
    type: string
    title: string
    message: string
    urgent: boolean
  }>
  milestones: Array<{
    title: string
    description: string
    icon: string
  }>
  nextSteps: string[]
}

export default function HealthInsightsPage() {
  const [insights, setInsights] = useState<HealthInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/auth/login"
        return
      }

      const response = await fetch("/api/health/insights", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights)
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAlertColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "urgent":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Analyzing health data...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!insights) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No health data available</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold">Health Insights</h2>
        <p className="text-white/90">AI-powered analysis of your pet's health journey</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{insights.summary.title}</h3>
        <p className="text-gray-600 mb-6">{insights.summary.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.summary.keyPoints.map((point, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-800">{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Health Score */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-green-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-800">Health Trends</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-2">Overall Health Score</h4>
                <div className="text-4xl font-bold text-green-600 mb-2">{insights.trends.overallHealth.score}%</div>
                <p className="text-sm text-gray-600">{insights.trends.overallHealth.grade}</p>
                <p className="text-xs text-gray-500 mt-2">{insights.trends.overallHealth.description}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-2">Activity Level</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">{insights.trends.activityLevel.level}</div>
                <p className="text-sm text-gray-600">Score: {insights.trends.activityLevel.score}</p>
                <p className="text-xs text-gray-500 mt-2">{insights.trends.activityLevel.description}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-2">Vaccination Status</h4>
                <div className="text-2xl font-bold text-purple-600 mb-2">{insights.trends.vaccinationCompliance.status}</div>
                <p className="text-sm text-gray-600">{insights.trends.vaccinationCompliance.daysSince} days since last</p>
                <p className="text-xs text-gray-500 mt-2">{insights.trends.vaccinationCompliance.description}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-2">Dental Health</h4>
                <div className="text-2xl font-bold text-orange-600 mb-2">{insights.trends.dentalHealth.status}</div>
                <p className="text-sm text-gray-600">{insights.trends.dentalHealth.daysSince} days since last</p>
                <p className="text-xs text-gray-500 mt-2">{insights.trends.dentalHealth.description}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recommendations</h3>
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm mt-1">{rec.description}</p>
                      <p className="text-xs mt-2 font-medium">Action: {rec.action}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alerts */}
          {insights.alerts.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h4 className="font-bold text-gray-800">Health Alerts</h4>
              </div>
              <div className="space-y-3">
                {insights.alerts.map((alert, index) => (
                  <div key={index} className={`border rounded-lg p-3 ${getAlertColor(alert.type)}`}>
                    <h5 className="font-semibold text-sm">{alert.title}</h5>
                    <p className="text-xs mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {insights.milestones.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-yellow-600" size={24} />
                <h4 className="font-bold text-gray-800">Achievements</h4>
              </div>
              <div className="space-y-3">
                {insights.milestones.map((milestone, index) => (
                  <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{milestone.icon}</span>
                      <div>
                        <h5 className="font-semibold text-gray-800 text-sm">{milestone.title}</h5>
                        <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-green-600" size={24} />
              <h4 className="font-bold text-gray-800">Next Steps</h4>
            </div>
            <div className="space-y-3">
              {insights.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
