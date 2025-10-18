"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PetMap } from "@/components/pet-map"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { MapPin, Navigation, AlertCircle } from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
}

export default function TrackingPage() {
  const [location, setLocation] = useState<LocationData>({
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 50,
    timestamp: new Date().toISOString(),
  })

  const [isTracking, setIsTracking] = useState(false)
  const [trackingHistory, setTrackingHistory] = useState<LocationData[]>([])

  useEffect(() => {
    // Fetch initial location
    fetchLocation()
  }, [])

  const fetchLocation = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tracking/location", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setLocation(data.location)
        setTrackingHistory((prev) => [data.location, ...prev].slice(0, 10))
      }
    } catch (error) {
      console.error("Error fetching location:", error)
    }
  }

  const handleStartTracking = () => {
    setIsTracking(true)

    // Simulate GPS tracking with random location changes
    const interval = setInterval(() => {
      const newLat = location.latitude + (Math.random() - 0.5) * 0.01
      const newLng = location.longitude + (Math.random() - 0.5) * 0.01

      const newLocation: LocationData = {
        latitude: newLat,
        longitude: newLng,
        accuracy: Math.random() * 30 + 10,
        timestamp: new Date().toISOString(),
      }

      setLocation(newLocation)
      setTrackingHistory((prev) => [newLocation, ...prev].slice(0, 10))
    }, 5000)

    return () => clearInterval(interval)
  }

  const handleStopTracking = () => {
    setIsTracking(false)
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold">Pet Tracking</h2>
        <p className="text-white/90">Real-time location monitoring for your pet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Simba's Location</h3>
            <PetMap
              petLocation={{
                lat: location.latitude,
                lng: location.longitude,
                timestamp: location.timestamp,
                accuracy: location.accuracy,
              }}
              petName="Simba"
            />

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Latitude</p>
                <p className="font-bold text-blue-600">{location.latitude.toFixed(4)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Longitude</p>
                <p className="font-bold text-purple-600">{location.longitude.toFixed(4)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Accuracy</p>
                <p className="font-bold text-green-600">{location.accuracy.toFixed(1)}m</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {!isTracking ? (
                <Button
                  onClick={handleStartTracking}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center gap-2"
                >
                  <Navigation size={20} />
                  Start Tracking
                </Button>
              ) : (
                <Button
                  onClick={handleStopTracking}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center justify-center gap-2"
                >
                  <Navigation size={20} />
                  Stop Tracking
                </Button>
              )}
              <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">Refresh</Button>
            </div>
          </div>
        </div>

        {/* Tracking Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-purple-600" size={24} />
              <h4 className="font-bold text-gray-800">Tracking Status</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`font-bold ${isTracking ? "text-green-600" : "text-gray-600"}`}>
                  {isTracking ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="font-bold text-gray-800 text-sm">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Device</span>
                <span className="font-bold text-gray-800">Connected</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
              <h4 className="font-bold text-gray-800">Safe Zone</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Set a safe zone and get alerts if your pet leaves it</p>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Set Safe Zone</Button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-3">Recent Locations</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trackingHistory.map((loc, idx) => (
                <div key={idx} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                  <p className="font-semibold">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </p>
                  <p className="text-gray-500">{new Date(loc.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
