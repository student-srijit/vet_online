"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AIVideoCall } from "@/components/ai-video-call"
import { ClientTimestamp } from "@/components/client-timestamp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { 
  Send, 
  Loader, 
  Video, 
  Phone, 
  MessageSquare, 
  Stethoscope, 
  Heart, 
  Shield, 
  Zap, 
  Clock, 
  Star, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
  Brain,
  Activity,
  TrendingUp,
  Users,
  Award,
  Globe
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "vet" | "system"
  content: string
  timestamp: Date
  isEmergency?: boolean
}

interface Vet {
  id: string
  name: string
  specialty: string
  rating: number
  experience: string
  availability: string
  avatar: string
  isOnline: boolean
  responseTime: string
  price: string
}

interface EmergencyContact {
  id: string
  name: string
  phone: string
  address: string
  distance: string
  is24Hours: boolean
}

export default function VetSupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "vet",
      content:
        "Hello! I'm your AI Vet Assistant. I'm here to help answer questions about your pet's health. Please tell me about your pet and what concerns you have.",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [currentPet, setCurrentPet] = useState<any>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [quickActions, setQuickActions] = useState<string[]>([])
  const [healthTips, setHealthTips] = useState<string[]>([])
  const [recentConsultations, setRecentConsultations] = useState<any[]>([])

  const [availableVets] = useState<Vet[]>([
    {
      id: "1",
      name: "Dr. Sarah Smith",
      specialty: "General Veterinarian",
      rating: 4.9,
      experience: "15 years",
      availability: "Online Now",
      avatar: "👩‍⚕️",
      isOnline: true,
      responseTime: "< 5 min",
      price: "$50/session"
    },
    {
      id: "2", 
      name: "Dr. Michael Johnson",
      specialty: "Pet Nutritionist",
      rating: 4.8,
      experience: "12 years",
      availability: "Online Now",
      avatar: "👨‍⚕️",
      isOnline: true,
      responseTime: "< 3 min",
      price: "$45/session"
    },
    {
      id: "3",
      name: "Dr. Emily Chen",
      specialty: "Emergency Medicine",
      rating: 4.9,
      experience: "18 years",
      availability: "Available",
      avatar: "👩‍⚕️",
      isOnline: true,
      responseTime: "< 2 min",
      price: "$75/session"
    }
  ])

  const [emergencyContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      name: "Pet Emergency Center",
      phone: "(555) 123-4567",
      address: "123 Main St, Downtown",
      distance: "2.3 miles",
      is24Hours: true
    },
    {
      id: "2",
      name: "Animal Hospital",
      phone: "(555) 987-6543", 
      address: "456 Oak Ave, Midtown",
      distance: "4.1 miles",
      is24Hours: true
    }
  ])

  useEffect(() => {
    fetchPetData()
    generateQuickActions()
    generateHealthTips()
    fetchRecentConsultations()
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
          setCurrentPet(data.user.pets[0])
        }
      }
    } catch (error) {
      console.error("Error fetching pet data:", error)
    }
  }

  const generateQuickActions = () => {
    setQuickActions([
      "Emergency symptoms check",
      "Vaccination schedule",
      "Diet recommendations", 
      "Exercise guidelines",
      "Behavioral issues",
      "Medication questions",
      "First aid instructions",
      "Preventive care"
    ])
  }

  const generateHealthTips = () => {
    setHealthTips([
      "Regular exercise prevents obesity",
      "Dental care is crucial for overall health",
      "Annual checkups catch issues early",
      "Proper nutrition supports immune system",
      "Mental stimulation prevents boredom",
      "Grooming maintains skin health"
    ])
  }

  const fetchRecentConsultations = () => {
    setRecentConsultations([
      {
        id: "1",
        date: "2024-01-15",
        vet: "Dr. Smith",
        issue: "Vaccination schedule",
        status: "completed"
      },
      {
        id: "2", 
        date: "2024-01-10",
        vet: "Dr. Johnson",
        issue: "Diet consultation",
        status: "completed"
      }
    ])
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Check for emergency keywords
    const emergencyKeywords = ['emergency', 'urgent', 'critical', 'dying', 'unconscious', 'bleeding', 'seizure']
    const isEmergency = emergencyKeywords.some(keyword => input.toLowerCase().includes(keyword))
    
    if (isEmergency) {
      setEmergencyMode(true)
      const emergencyMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "🚨 EMERGENCY DETECTED! I'm connecting you with emergency veterinary services immediately.",
        timestamp: new Date(),
        isEmergency: true
      }
      setMessages((prev) => [...prev, emergencyMessage])
    }

    try {
      const response = await fetch("/api/ai/vet-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petInfo: currentPet ? `${currentPet.name}, ${currentPet.breed}, ${currentPet.age} years old` : "Pet information not available",
          message: input,
          isEmergency: isEmergency
        }),
      })

      const data = await response.json()

      if (data.success) {
        const vetMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "vet",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, vetMessage])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
  }

  return (
    <DashboardLayout>
      {showVideoCall && (
        <AIVideoCall onClose={() => setShowVideoCall(false)} />
      )}

      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Vet Support</h2>
            <p className="text-white/90">Get professional help for your pets</p>
            {currentPet && (
              <p className="text-white/80 text-sm mt-2">
                🐾 Currently helping: {currentPet.name} ({currentPet.breed}, {currentPet.age} years old)
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowVideoCall(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Video className="mr-2" size={20} />
              AI Video Call
            </Button>
            <Button
              onClick={() => setEmergencyMode(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30"
            >
              <AlertTriangle className="mr-2" size={20} />
              Emergency
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyMode && (
        <div className="bg-red-600 text-white p-4 rounded-2xl mb-6 flex items-center gap-4">
          <AlertTriangle size={24} />
          <div className="flex-1">
            <h3 className="font-bold">EMERGENCY MODE ACTIVATED</h3>
            <p className="text-sm">Your pet's condition has been flagged as urgent. Emergency contacts are available below.</p>
          </div>
          <Button
            onClick={() => setEmergencyMode(false)}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Chat Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">AI Vet Assistant</h4>
                <p className="text-sm text-gray-600">Always available • Instant responses</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Activity size={12} className="mr-1" />
                  Online
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" style={{ maxHeight: '400px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : msg.type === "system"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    <ClientTimestamp 
                      timestamp={msg.timestamp} 
                      className="text-xs opacity-70 mt-1" 
                    />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">AI is analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.slice(0, 4).map((action, index) => (
                  <Button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask your AI vet assistant..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Vets */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-blue-600" size={20} />
              <h4 className="font-bold text-gray-800">Available Veterinarians</h4>
            </div>
            <div className="space-y-3">
              {availableVets.map((vet) => (
                <div key={vet.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-lg">
                    {vet.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{vet.name}</p>
                      {vet.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{vet.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" />
                        <span className="text-xs text-gray-600">{vet.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">{vet.experience}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-green-600">{vet.responseTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{vet.price}</p>
                    <Button size="sm" className="mt-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Phone size={12} className="mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          {emergencyMode && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-600" size={20} />
                <h4 className="font-bold text-red-800">Emergency Contacts</h4>
              </div>
              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="bg-white border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-600">{contact.address}</p>
                        <p className="text-xs text-gray-500">{contact.distance} away</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">{contact.phone}</p>
                        {contact.is24Hours && (
                          <Badge variant="destructive" className="text-xs">24/7</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Tips */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-green-600" size={20} />
              <h4 className="font-bold text-green-800">Health Tips</h4>
            </div>
            <div className="space-y-2">
              {healthTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-purple-600" size={20} />
              <h4 className="font-bold text-gray-800">Recent Consultations</h4>
            </div>
            <div className="space-y-3">
              {recentConsultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Stethoscope size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{consultation.vet}</p>
                    <p className="text-xs text-gray-600">{consultation.issue}</p>
                    <p className="text-xs text-gray-500">{consultation.date}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {consultation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Consultation */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-cyan-200">
            <div className="flex items-center gap-2 mb-3">
              <Video className="text-cyan-600" size={20} />
              <h4 className="font-bold text-gray-800">Video Consultation</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Book a video consultation with a real veterinarian</p>
            <div className="space-y-2">
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                <Calendar className="mr-2" size={16} />
                Book Appointment
              </Button>
              <Button 
                onClick={() => setShowVideoCall(true)}
                variant="outline" 
                className="w-full border-cyan-300 text-cyan-600 hover:bg-cyan-50"
              >
                <Zap className="mr-2" size={16} />
                Try AI Video Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
