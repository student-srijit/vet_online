"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Plus, TrendingUp, Bell, Brain, Calendar, AlertCircle, Trash2, Zap, BarChart3, Target, Sparkles, Trophy } from "lucide-react"
import { PrescriptionDownload } from "@/components/prescription-download"

interface HealthRecord {
  _id: string
  type: string
  date: string
  description: string
  vet?: string
  status: string
  notes?: string
  nextDueDate?: string
}

interface HealthAnalytics {
  healthScore: number
  weightTrend: { status: string; detail: string }
  activityLevel: { status: string; detail: string }
  vaccinationStatus: { status: string; detail: string }
  upcomingCheckups: Array<{ type: string; date: string; description: string }>
  recommendations: string[]
}

interface Reminder {
  _id: string
  type: string
  date: string
  description: string
  reminderTime: string
}

interface User {
  _id: string
  fullName: string
  pets: Array<{
    name: string
    breed: string
    age: string
    weight?: string
  }>
}

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [analytics, setAnalytics] = useState<HealthAnalytics | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [breedAnalysis, setBreedAnalysis] = useState<any>(null)
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [healthPredictions, setHealthPredictions] = useState<any>(null)
  const [predicting, setPredicting] = useState(false)
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null)
  const [analyzingCompetitors, setAnalyzingCompetitors] = useState(false)
  const [formData, setFormData] = useState({
    type: "Vaccination",
    date: "",
    description: "",
    vet: "",
    status: "Completed",
    notes: "",
    nextDueDate: "",
  })
  const [reminderData, setReminderData] = useState({
    type: "Checkup",
    date: "",
    description: "",
    reminderTime: "09:00",
    isRecurring: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/auth/login"
        return
      }

      // Fetch user data
      const userResponse = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
        
            // Trigger breed analysis if we have pet data (optional, won't break if fails)
            if (userData.user.pets && userData.user.pets.length > 0) {
              try {
                await analyzeBreed(userData.user.pets[0], token)
              } catch (error) {
                console.log("Breed analysis skipped - API not configured")
              }
            }
      }

      // Fetch health records
      const recordsResponse = await fetch("/api/records/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        setRecords(recordsData.records)
      }

      // Fetch health analytics
      const analyticsResponse = await fetch("/api/health/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.analytics)
      }

      // Fetch reminders
      const remindersResponse = await fetch("/api/reminders/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (remindersResponse.ok) {
        const remindersData = await remindersResponse.json()
        setReminders(remindersData.reminders)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeBreed = async (pet: any, token: string) => {
    try {
      const response = await fetch("/api/ai/breed-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          healthRecords: records,
        }),
      })
      
      if (response.ok) {
        const analysisData = await response.json()
        setBreedAnalysis(analysisData.analysis)
      } else {
        // If API fails, set a fallback analysis
        setBreedAnalysis({
          breedInfo: {
            commonHealthIssues: ["Regular health monitoring recommended"],
            lifespan: "Varies by breed",
            size: "Varies by breed", 
            energyLevel: "Varies by breed"
          },
          recommendations: {
            vaccinations: ["Annual vaccinations recommended"],
            preventiveCare: ["Regular vet checkups", "Dental care"],
            monitoring: ["Monitor weight and activity"]
          }
        })
      }
    } catch (error) {
      console.log("Breed analysis not available - using fallback")
      // Set fallback analysis instead of failing
      setBreedAnalysis({
        breedInfo: {
          commonHealthIssues: ["Regular health monitoring recommended"],
          lifespan: "Varies by breed",
          size: "Varies by breed", 
          energyLevel: "Varies by breed"
        },
        recommendations: {
          vaccinations: ["Annual vaccinations recommended"],
          preventiveCare: ["Regular vet checkups", "Dental care"],
          monitoring: ["Monitor weight and activity"]
        }
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReminderInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setReminderData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }

  const handleAddRecord = async () => {
    if (!formData.date || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/records/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Health record added successfully!")
        setFormData({ type: "Vaccination", date: "", description: "", vet: "", status: "Completed", notes: "", nextDueDate: "" })
        setShowForm(false)
        fetchData() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Failed to add record: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error adding record:", error)
      alert("An error occurred while adding the record")
    } finally {
      setSaving(false)
    }
  }

  const handleAddReminder = async () => {
    if (!reminderData.date || !reminderData.description) {
      alert("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reminders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reminderData),
      })

      if (response.ok) {
        alert("Reminder created successfully!")
        setReminderData({ type: "Checkup", date: "", description: "", reminderTime: "09:00", isRecurring: false })
        setShowReminderForm(false)
        fetchData() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Failed to create reminder: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      alert("An error occurred while creating the reminder")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/records/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recordId }),
      })

      if (response.ok) {
        alert("Record deleted successfully!")
        fetchData() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Failed to delete record: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error deleting record:", error)
      alert("An error occurred while deleting the record")
    } finally {
      setSaving(false)
    }
  }

  const handleAdvancedAnalysis = async () => {
    setAnalyzing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/advanced-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAdvancedAnalysis(data.analysis)
        alert("Advanced AI analysis completed! Check the insights below.")
      } else {
        const errorData = await response.json()
        alert(`Analysis failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error performing analysis:", error)
      alert("An error occurred during analysis")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleHealthPrediction = async () => {
    setPredicting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/health-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHealthPredictions(data.predictions)
        alert("Health predictions generated! Check the insights below.")
      } else {
        const errorData = await response.json()
        alert(`Prediction failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error generating predictions:", error)
      alert("An error occurred during prediction")
    } finally {
      setPredicting(false)
    }
  }

  const handleCompetitorAnalysis = async () => {
    setAnalyzingCompetitors(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/competitor-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCompetitorAnalysis(data.analysis)
        alert("Competitor analysis completed! See why we're winning below.")
      } else {
        const errorData = await response.json()
        alert(`Analysis failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error analyzing competitors:", error)
      alert("An error occurred during competitor analysis")
    } finally {
      setAnalyzingCompetitors(false)
    }
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "Vaccination":
        return "💉"
      case "Weight Check":
        return "⚖️"
      case "Dental Cleaning":
        return "🦷"
      case "Surgery":
        return "🏥"
      case "Checkup":
        return "🩺"
      default:
        return "📋"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "upcoming":
        return "bg-yellow-100 text-yellow-700"
      case "pending":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading health records...</div>
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
            <h2 className="text-3xl font-bold">Health Records</h2>
            <p className="text-white/90">Track your pet's health journey with AI insights</p>
            <p className="text-white/80 text-sm mt-2">
              💡 For the most accurate AI health analysis, please provide detailed health records including vaccinations, 
              weight checks, dental cleanings, and vet visits. Our AI works best with comprehensive data to give you 
              the perfect health insights for your beloved pet.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAdvancedAnalysis}
              disabled={analyzing || records.length === 0}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              title={records.length === 0 ? "Add health records first for AI analysis" : "Run comprehensive AI analysis"}
            >
              {analyzing ? (
                <>
                  <Brain className="animate-spin mr-2" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2" size={20} />
                  AI Analysis
                </>
              )}
            </Button>
            <Button
              onClick={handleHealthPrediction}
              disabled={predicting || records.length === 0}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              title={records.length === 0 ? "Add health records first for predictions" : "Predict future health trends"}
            >
              {predicting ? (
                <>
                  <Sparkles className="animate-pulse mr-2" size={20} />
                  Predicting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" size={20} />
                  Predict Health
                </>
              )}
            </Button>
            <Button
              onClick={handleCompetitorAnalysis}
              disabled={analyzingCompetitors}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {analyzingCompetitors ? (
                <>
                  <Trophy className="animate-bounce mr-2" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Trophy className="mr-2" size={20} />
                  Why We Win
                </>
              )}
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard/health-insights'}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <BarChart3 className="mr-2" size={20} />
              Deep Insights
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Records List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Records</h3>

            {records.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Health Records Yet</h4>
                <p className="text-gray-500 mb-4">Start tracking your pet's health by adding your first record</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  <Plus size={20} className="mr-2" />
                  Add First Record
                </Button>
              </div>
            ) : (
                  <div className="space-y-4 mb-8">
                    {records.map((record) => (
                      <div key={record._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">{getRecordIcon(record.type)}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800">{record.type}</h4>
                              <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                              {record.vet && (
                                <p className="text-xs text-gray-500 mt-2">Vet: {record.vet}</p>
                              )}
                              {record.notes && (
                                <p className="text-xs text-gray-500 mt-1">Notes: {record.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                            <PrescriptionDownload
                              recordId={record._id}
                              recordType={record.type}
                              recordDescription={record.description}
                            />
                            <Button
                              onClick={() => handleDeleteRecord(record._id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={saving}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            )}

            {/* Add Record Form */}
            {showForm ? (
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <h4 className="font-bold text-gray-800 mb-4">Add Health Record</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Record Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Vaccination</option>
                      <option>Weight Check</option>
                      <option>Dental Cleaning</option>
                      <option>Surgery</option>
                      <option>Checkup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Date</label>
                    <Input
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Description</label>
                    <Input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="What was done..."
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Veterinarian (Optional)</label>
                    <Input
                      name="vet"
                      value={formData.vet}
                      onChange={handleInputChange}
                      placeholder="Vet name..."
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Completed</option>
                      <option>Upcoming</option>
                      <option>Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Next Due Date (Optional)</label>
                    <Input
                      name="nextDueDate"
                      type="date"
                      value={formData.nextDueDate}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleAddRecord} 
                      disabled={saving}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      {saving ? "Adding..." : "Add Record"}
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
                Add Health Record
              </Button>
            )}
          </div>
        </div>

            {/* Health Analytics & AI Insights */}
            <div className="space-y-4">
              {/* Competitor Analysis */}
              {competitorAnalysis && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="text-yellow-600" size={24} />
                    <h4 className="font-bold text-gray-800">Why We're Winning</h4>
                  </div>
                  <div className="space-y-4">
                    {competitorAnalysis.ourAdvantages && competitorAnalysis.ourAdvantages.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Our Competitive Advantages</h5>
                        <div className="space-y-2">
                          {competitorAnalysis.ourAdvantages.slice(0, 2).map((advantage: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{advantage.feature}</span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                  {advantage.impact}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{advantage.advantage}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {competitorAnalysis.uniqueFeatures && competitorAnalysis.uniqueFeatures.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Unique Features</h5>
                        <div className="space-y-2">
                          {competitorAnalysis.uniqueFeatures.slice(0, 2).map((feature: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-gray-800">{feature.feature}</div>
                              <p className="text-gray-600 mt-1">{feature.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {competitorAnalysis.innovationScore && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Innovation Score</h5>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-yellow-600">{competitorAnalysis.innovationScore.overallScore}%</span>
                            <span className="text-sm">{competitorAnalysis.innovationScore.industryComparison}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Health Predictions */}
              {healthPredictions && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-blue-600" size={24} />
                    <h4 className="font-bold text-gray-800">Health Predictions</h4>
                  </div>
                  <div className="space-y-4">
                    {healthPredictions.shortTermPredictions && healthPredictions.shortTermPredictions.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Short-term Predictions</h5>
                        <div className="space-y-2">
                          {healthPredictions.shortTermPredictions.slice(0, 2).map((prediction: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{prediction.type}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  prediction.confidence === 'High' ? 'bg-green-100 text-green-700' :
                                  prediction.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {prediction.confidence}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{prediction.prediction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {healthPredictions.riskFactors && healthPredictions.riskFactors.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Risk Factors</h5>
                        <div className="space-y-2">
                          {healthPredictions.riskFactors.slice(0, 2).map((risk: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{risk.factor}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  risk.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                                  risk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {risk.riskLevel}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{risk.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {healthPredictions.wellnessForecast && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Wellness Forecast</h5>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{healthPredictions.wellnessForecast.forecast}</p>
                          <p className="mt-1">Confidence: {healthPredictions.wellnessForecast.confidence}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Advanced AI Analysis Results */}
              {advancedAnalysis && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-purple-600" size={24} />
                    <h4 className="font-bold text-gray-800">Advanced AI Analysis</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Overall Health Score</h5>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-purple-600">{advancedAnalysis.overallScore}%</div>
                        <div className="text-sm text-gray-600">
                          {advancedAnalysis.overallScore >= 90 ? "Excellent" : 
                           advancedAnalysis.overallScore >= 75 ? "Good" : 
                           advancedAnalysis.overallScore >= 60 ? "Fair" : "Needs Attention"}
                        </div>
                      </div>
                    </div>
                    
                    {advancedAnalysis.riskAssessment && advancedAnalysis.riskAssessment.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Risk Assessment</h5>
                        <div className="space-y-2">
                          {advancedAnalysis.riskAssessment.slice(0, 2).map((risk: any, index: number) => (
                            <div key={index} className="text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                risk.level === 'High' ? 'bg-red-100 text-red-700' :
                                risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {risk.level}
                              </span>
                              <span className="ml-2 text-gray-600">{risk.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {advancedAnalysis.predictiveInsights && advancedAnalysis.predictiveInsights.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Predictive Insights</h5>
                        <div className="space-y-2">
                          {advancedAnalysis.predictiveInsights.slice(0, 2).map((insight: any, index: number) => (
                            <div key={index} className="text-sm text-gray-600">
                              <strong>{insight.type}:</strong> {insight.prediction}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Breed Analysis */}
              {breedAnalysis && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-purple-600" size={24} />
                <h4 className="font-bold text-gray-800">AI Breed Insights</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <h5 className="font-semibold text-gray-700 text-sm">Health Considerations</h5>
                  <p className="text-xs text-gray-600">
                    {breedAnalysis.breedInfo?.commonHealthIssues?.join(", ") || "General monitoring recommended"}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-700 text-sm">Recommendations</h5>
                  <p className="text-xs text-gray-600">
                    {breedAnalysis.recommendations?.preventiveCare?.join(", ") || "Regular vet checkups"}
                  </p>
                </div>
              </div>
            </div>
          )}

              {/* Health Analytics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-green-600" size={24} />
                  <h4 className="font-bold text-gray-800">Health Analytics</h4>
                </div>

                {records.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📊</div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">Add Health Records for AI Analysis</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Add at least one health record to get comprehensive AI health analysis and insights
                    </p>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                      <p className="text-blue-800 text-sm font-medium mb-2">💡 What to include:</p>
                      <ul className="text-blue-700 text-xs space-y-1 text-left">
                        <li>• Vaccination records</li>
                        <li>• Weight check results</li>
                        <li>• Dental cleaning visits</li>
                        <li>• Regular checkups</li>
                        <li>• Any health concerns</li>
                      </ul>
                    </div>
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-2">Health Score</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.healthScore}%</p>
                      <p className="text-xs text-gray-500 mt-1">Overall health status</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-2">Weight Trend</p>
                      <p className="text-2xl font-bold text-cyan-600">{analytics.weightTrend.status}</p>
                      <p className="text-xs text-gray-500 mt-1">{analytics.weightTrend.detail}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-2">Vaccination Status</p>
                      <p className="text-2xl font-bold text-pink-600">{analytics.vaccinationStatus.status}</p>
                      <p className="text-xs text-gray-500 mt-1">{analytics.vaccinationStatus.detail}</p>
                    </div>

                    {analytics.recommendations.length > 0 && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-2">Recommendations</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {analytics.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Loading analytics...</p>
                  </div>
                )}
              </div>

          {/* Upcoming Reminders */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-orange-600" size={24} />
              <h4 className="font-bold text-gray-800">Upcoming Reminders</h4>
            </div>
            
            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.slice(0, 2).map((reminder) => (
                  <div key={reminder._id} className="bg-white rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">{reminder.type}</p>
                    <p className="text-xs text-gray-600">{reminder.description}</p>
                    <p className="text-xs text-orange-600 font-medium">
                      {new Date(reminder.date).toLocaleDateString()} at {reminder.reminderTime}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">No upcoming reminders</p>
                <Button
                  onClick={() => setShowReminderForm(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                >
                  <Calendar size={16} className="mr-2" />
                  Schedule Reminder
                </Button>
              </div>
            )}
          </div>

          {/* Reminder Form */}
          {showReminderForm && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-orange-200">
              <h4 className="font-bold text-gray-800 mb-4">Schedule Reminder</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Type</label>
                  <select
                    name="type"
                    value={reminderData.type}
                    onChange={handleReminderInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Checkup</option>
                    <option>Vaccination</option>
                    <option>Dental Cleaning</option>
                    <option>Weight Check</option>
                    <option>Medication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Date</label>
                  <Input
                    name="date"
                    type="date"
                    value={reminderData.date}
                    onChange={handleReminderInputChange}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Time</label>
                  <Input
                    name="reminderTime"
                    type="time"
                    value={reminderData.reminderTime}
                    onChange={handleReminderInputChange}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Description</label>
                  <Input
                    name="description"
                    value={reminderData.description}
                    onChange={handleReminderInputChange}
                    placeholder="What to remind about..."
                    className="bg-white"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddReminder} 
                    disabled={saving}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {saving ? "Creating..." : "Create Reminder"}
                  </Button>
                  <Button onClick={() => setShowReminderForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
