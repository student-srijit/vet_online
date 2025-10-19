"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Brain, X, Loader } from "lucide-react"

interface PhotoAnalyzerProps {
  isOpen: boolean
  onClose: () => void
  petInfo?: string
}

export function AIPhotoAnalyzer({ isOpen, onClose, petInfo }: PhotoAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string>("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      // Create video element to capture from camera
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      // Create a modal for camera preview
      const cameraModal = document.createElement('div')
      cameraModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      cameraModal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-bold mb-4 text-center">Take Photo</h3>
          <div class="relative">
            <video id="camera-preview" class="w-full h-64 object-cover rounded-lg" autoplay></video>
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button id="capture-btn" class="bg-white rounded-full p-3 shadow-lg">
                <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button id="close-camera" class="bg-red-500 text-white rounded-full p-3 shadow-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
      
      document.body.appendChild(cameraModal)
      
      // Set up video element
      const videoElement = cameraModal.querySelector('#camera-preview') as HTMLVideoElement
      videoElement.srcObject = stream
      
      // Handle capture
      const captureBtn = cameraModal.querySelector('#capture-btn')
      const closeBtn = cameraModal.querySelector('#close-camera')
      
      captureBtn?.addEventListener('click', () => {
        // Create canvas to capture image
        const canvas = document.createElement('canvas')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(videoElement, 0, 0)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            setSelectedFile(file)
            
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
              setPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
          }
        }, 'image/jpeg', 0.8)
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(cameraModal)
      })
      
      closeBtn?.addEventListener('click', () => {
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(cameraModal)
      })
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      // Fallback to file input
      fileInputRef.current?.click()
    }
  }

  const analyzePhoto = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('petInfo', petInfo || 'General pet analysis')

      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/photo-analysis", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis || "Analysis completed successfully!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to analyze photo")
      }
    } catch (err) {
      console.error("Error analyzing photo:", err)
      setError("An error occurred while analyzing the photo")
    } finally {
      setAnalyzing(false)
    }
  }

  const resetAnalyzer = () => {
    setSelectedFile(null)
    setPreview(null)
    setAnalysis("")
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="text-purple-500" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">AI Photo Analysis</h2>
                <p className="text-gray-600 text-sm">Upload a photo for AI-powered health insights</p>
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

          {/* Photo Upload/Capture */}
          {!preview && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">📸</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Pet Photo</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get AI-powered health insights from your pet's photo
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCameraCapture}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <Camera className="mr-2" size={16} />
                    Take Photo
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="mr-2" size={16} />
                    Upload File
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {preview && (
            <div className="mb-6">
              <div className="relative">
                <img
                  src={preview}
                  alt="Selected pet photo"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <Button
                  onClick={resetAnalyzer}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={analyzePhoto}
                  disabled={analyzing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {analyzing ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2" size={16} />
                      Analyze with AI
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetAnalyzer}
                  variant="outline"
                  disabled={analyzing}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-purple-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">AI Analysis Results</h3>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Features Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">AI Analysis Features:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Health condition detection</li>
              <li>• Behavior analysis</li>
              <li>• Breed identification</li>
              <li>• Age estimation</li>
              <li>• Nutritional recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
