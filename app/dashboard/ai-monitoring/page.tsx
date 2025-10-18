"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Send, Loader } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export default function AIMonitoringPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm your Pet Health Assistant. Ask me anything about common pet diseases, symptoms, and health tips. What would you like to know?",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

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

    try {
      const response = await fetch("/api/ai/disease-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disease: input,
          petType: "dog",
        }),
      })

      const data = await response.json()

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold">AI Monitoring</h2>
        <p className="text-white/90">Smart monitoring for your pet's well-being</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col h-96">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-blue-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-blue-100 text-gray-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about pet diseases..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Health Monitoring */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Health Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-800">Overall Health</span>
                <span className="text-lg font-bold text-green-600">92%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-800">Activity Level</span>
                <span className="text-lg font-bold text-blue-600">High</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-800">Nutrition</span>
                <span className="text-lg font-bold text-purple-600">Good</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
            <h4 className="font-bold text-gray-800 mb-3">Common Questions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-gray-700 hover:text-purple-600 transition-all">
                • What are signs of allergies?
              </button>
              <button className="w-full text-left text-sm text-gray-700 hover:text-purple-600 transition-all">
                • How often should I groom?
              </button>
              <button className="w-full text-left text-sm text-gray-700 hover:text-purple-600 transition-all">
                • Best diet for my pet?
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
