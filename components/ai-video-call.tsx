"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ClientTimestamp } from "@/components/client-timestamp"
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Volume2, VolumeX, Settings, MessageSquare, Camera, Zap } from "lucide-react"

interface AIVideoCallProps {
  onClose: () => void
}

export function AIVideoCall({ onClose }: AIVideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [userMessage, setUserMessage] = useState("")
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'user' | 'ai', message: string, timestamp: Date}>>([])
  const [isListening, setIsListening] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [petSymptoms, setPetSymptoms] = useState<string[]>([])
  const [currentPet, setCurrentPet] = useState<any>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setUserMessage(finalTranscript)
          handleUserInput(finalTranscript)
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    // Get user's pet data
    fetchPetData()

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel()
      }
    }
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

  const startCall = async () => {
    setIsCallActive(true)
    
    // Start camera with improved audio settings
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true // Prevent audio feedback
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }

    // AI Welcome Message - Dynamic based on pet data
    const welcomeMessage = currentPet 
      ? `Hello! I'm Dr. AI, your virtual veterinary assistant. I'm here to help with your pet's health concerns. I can see you have ${currentPet.name}, a ${currentPet.breed} who is ${currentPet.age} years old${currentPet.weight ? ` and weighs ${currentPet.weight}` : ''}. What health concerns would you like to discuss today?`
      : `Hello! I'm Dr. AI, your virtual veterinary assistant. I'm here to help with your pet's health concerns. Please tell me about your pet and what health questions you have today.`
    
    speakAI(welcomeMessage)
    setConversationHistory(prev => [...prev, {
      type: 'ai',
      message: welcomeMessage,
      timestamp: new Date()
    }])
  }

  const endCall = () => {
    setIsCallActive(false)
    setIsSpeaking(false)
    setIsListening(false)
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (synthesisRef.current) {
      speechSynthesis.cancel()
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (videoRef.current) {
      videoRef.current.style.display = isVideoOn ? 'none' : 'block'
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false)
      recognitionRef.current.stop()
    }
  }

  const speakAI = (text: string) => {
    // Cancel any ongoing speech
    if (synthesisRef.current) {
      speechSynthesis.cancel()
    }

    // Stop any ongoing speech recognition to prevent echo
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 0.8

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    synthesisRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const handleUserInput = async (message: string) => {
    if (!message.trim()) return

    // Add user message to conversation
    setConversationHistory(prev => [...prev, {
      type: 'user',
      message: message,
      timestamp: new Date()
    }])

    // Analyze symptoms
    const symptoms = extractSymptoms(message)
    setPetSymptoms(prev => [...prev, ...symptoms])

    // Generate AI response
    const aiResponse = await generateAIResponse(message, symptoms)
    
    // Add AI response to conversation
    setConversationHistory(prev => [...prev, {
      type: 'ai',
      message: aiResponse,
      timestamp: new Date()
    }])

    // Speak AI response
    speakAI(aiResponse)

    // Generate suggestions
    const suggestions = generateSuggestions(symptoms, message)
    setAiSuggestions(suggestions)

    // Check for emergency
    if (isEmergency(message, symptoms)) {
      setEmergencyMode(true)
    }
  }

  const extractSymptoms = (message: string): string[] => {
    const symptoms: string[] = []
    const lowerMessage = message.toLowerCase()
    
    const symptomKeywords = {
      'vomiting': ['vomit', 'throwing up', 'sick', 'nausea'],
      'diarrhea': ['diarrhea', 'loose stool', 'runny poop'],
      'lethargy': ['tired', 'lethargic', 'weak', 'not moving'],
      'loss of appetite': ['not eating', 'won\'t eat', 'refusing food'],
      'coughing': ['cough', 'coughing', 'hacking'],
      'limping': ['limp', 'limping', 'favoring leg'],
      'breathing problems': ['breathing', 'panting', 'shortness of breath'],
      'skin issues': ['rash', 'itchy', 'red skin', 'hot spots'],
      'eye problems': ['eye', 'eyes', 'discharge', 'cloudy'],
      'ear problems': ['ear', 'ears', 'shaking head', 'scratching ear']
    }

    Object.entries(symptomKeywords).forEach(([symptom, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        symptoms.push(symptom)
      }
    })

    return symptoms
  }

  const generateAIResponse = async (message: string, symptoms: string[]): Promise<string> => {
    try {
      // Call the actual vet chat API for dynamic responses
      const token = localStorage.getItem("token")
      const petInfo = currentPet 
        ? `${currentPet.name}, ${currentPet.breed}, ${currentPet.age} years old${currentPet.weight ? `, ${currentPet.weight} weight` : ''}`
        : "Pet information not available"

      const response = await fetch("/api/ai/vet-chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petInfo,
          message,
          isEmergency: symptoms.some(s => ['breathing problems', 'unconscious', 'severe bleeding', 'seizure'].includes(s))
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.response || "I'm here to help with your pet's health concerns. Could you please provide more details?"
      } else {
        throw new Error("API call failed")
      }
    } catch (error) {
      console.error("Error calling vet chat API:", error)
      
      // Fallback to dynamic response based on symptoms and pet data
      let response = ""

      if (symptoms.length > 0) {
        response = `I understand you're concerned about ${symptoms.join(', ')}. `
        
        if (symptoms.includes('vomiting') || symptoms.includes('diarrhea')) {
          response += "These symptoms could indicate several conditions. I recommend monitoring your pet's hydration and contacting your vet if symptoms persist for more than 24 hours. "
        }
        
        if (symptoms.includes('lethargy') || symptoms.includes('loss of appetite')) {
          response += "Lethargy and loss of appetite are concerning symptoms that require prompt veterinary attention. "
        }
        
        if (symptoms.includes('breathing problems')) {
          response += "Breathing difficulties are serious and require immediate veterinary care. "
        }
      } else {
        response = "Thank you for sharing that information. "
      }

      response += `Based on what you've told me about ${currentPet?.name || 'your pet'}, I have some recommendations. Would you like me to provide specific care instructions or would you prefer to schedule an emergency consultation?`

      return response
    }
  }

  const generateSuggestions = (symptoms: string[], message: string): string[] => {
    const suggestions: string[] = []
    
    if (symptoms.includes('vomiting') || symptoms.includes('diarrhea')) {
      suggestions.push("Withhold food for 12-24 hours", "Provide small amounts of water", "Monitor for dehydration")
    }
    
    if (symptoms.includes('lethargy')) {
      suggestions.push("Check temperature", "Monitor breathing", "Ensure comfortable resting area")
    }
    
    if (symptoms.includes('breathing problems')) {
      suggestions.push("Keep pet calm and quiet", "Ensure good ventilation", "Contact emergency vet immediately")
    }
    
    if (symptoms.length === 0) {
      suggestions.push("Schedule routine checkup", "Update vaccinations", "Dental health assessment")
    }

    return suggestions
  }

  const isEmergency = (message: string, symptoms: string[]): boolean => {
    const emergencyKeywords = ['emergency', 'urgent', 'critical', 'dying', 'unconscious', 'bleeding', 'seizure']
    const emergencySymptoms = ['breathing problems', 'unconscious', 'severe bleeding', 'seizure']
    
    return emergencyKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
           emergencySymptoms.some(symptom => symptoms.includes(symptom))
  }

  const handleEmergencyCall = () => {
    // Simulate emergency vet call
    const emergencyMessage = "EMERGENCY ALERT: I'm connecting you with the nearest emergency veterinary clinic. Please stay on the line while I transfer your call. Your pet's condition has been flagged as urgent."
    speakAI(emergencyMessage)
    setConversationHistory(prev => [...prev, {
      type: 'ai',
      message: emergencyMessage,
      timestamp: new Date()
    }])
  }

  if (!isCallActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Video Consultation</h2>
              <p className="text-gray-600 mb-6">
                Get instant AI-powered veterinary advice with our advanced video consultation system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🤖 AI Features</h3>
                <ul className="text-blue-700 text-sm space-y-2">
                  <li>• Real-time symptom analysis</li>
                  <li>• Voice-to-voice conversation</li>
                  <li>• Instant health recommendations</li>
                  <li>• Emergency detection</li>
                  <li>• 24/7 availability</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🏥 What I Can Help With</h3>
                <ul className="text-green-700 text-sm space-y-2">
                  <li>• Symptom assessment</li>
                  <li>• First aid guidance</li>
                  <li>• Emergency triage</li>
                  <li>• Care instructions</li>
                  <li>• Vet referral recommendations</li>
                </ul>
              </div>
            </div>

            {currentPet && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 mb-8">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">🐾 Your Pet Profile</h3>
                <div className="grid grid-cols-2 gap-4 text-purple-700 text-sm">
                  <div><strong>Name:</strong> {currentPet.name}</div>
                  <div><strong>Breed:</strong> {currentPet.breed}</div>
                  <div><strong>Age:</strong> {currentPet.age}</div>
                  <div><strong>Weight:</strong> {currentPet.weight || 'Not specified'}</div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={startCall}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                <Video className="mr-2" size={20} />
                Start AI Video Call
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="px-8 py-3 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Zap className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Dr. AI - Virtual Vet Assistant</h3>
            <p className="text-sm text-gray-300">AI Video Consultation Active</p>
          </div>
        </div>
        <Button
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff size={20} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 bg-gray-800 relative">
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          
          {/* AI Avatar Overlay */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-semibold">Dr. AI</h4>
                <p className="text-sm text-gray-300">
                  {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready to help"}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Alert */}
          {emergencyMode && (
            <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Phone size={16} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">EMERGENCY DETECTED</h4>
                <p className="text-sm">Your pet's condition requires immediate attention</p>
              </div>
              <Button
                onClick={handleEmergencyCall}
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                Call Emergency Vet
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              <Button
                onClick={toggleVideo}
                variant={isVideoOn ? "default" : "destructive"}
                size="sm"
              >
                {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
              </Button>
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "default" : "outline"}
                size="sm"
                className="flex-1"
              >
                {isListening ? "Stop Listening" : "Start Voice Input"}
              </Button>
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 p-4 flex flex-col">
            <h4 className="font-semibold text-gray-800 mb-3">Conversation</h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: '400px' }}>
              {conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-blue-100 text-blue-800 ml-4' 
                      : 'bg-gray-100 text-gray-800 mr-4'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.message}</p>
                  <ClientTimestamp 
                    timestamp={msg.timestamp} 
                    className="text-xs opacity-70 mt-1" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms Detected */}
          {petSymptoms.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Symptoms Detected</h4>
              <div className="flex flex-wrap gap-2">
                {petSymptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
