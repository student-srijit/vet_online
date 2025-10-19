"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Loader } from "lucide-react"

interface AddPetModalProps {
  isOpen: boolean
  onClose: () => void
  onPetAdded: () => void
}

export function AddPetModal({ isOpen, onClose, onPetAdded }: AddPetModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    dateOfBirth: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.breed || !formData.age) {
      setError("Name, breed, and age are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in again")
        return
      }

      const response = await fetch("/api/pets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ petData: formData }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to add pet")
        return
      }

      // Reset form
      setFormData({
        name: "",
        breed: "",
        age: "",
        weight: "",
        color: "",
        dateOfBirth: "",
      })

      onPetAdded()
      onClose()
    } catch (err) {
      console.error("Error adding pet:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add Your Pet</h2>
              <p className="text-gray-600 text-sm">Tell us about your furry friend</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your pet's name"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed *
              </label>
              <Input
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="e.g., Labrador, Golden Retriever"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <Input
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="e.g., 2 years, 6 months"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (optional)
              </label>
              <Input
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 25 kg, 50 lbs"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color (optional)
              </label>
              <Input
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., Golden, Black, Brown"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth (optional)
              </label>
              <Input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={16} />
                    Adding Pet...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    Add Pet
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
