"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    petName: "",
    petAge: "",
    petBreed: "",
    petWeight: "",
    petColor: "",
    petDateOfBirth: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("All fields are required")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      setStep(2)
    }
  }

  const handleRegister = async () => {
    if (!formData.petName || !formData.petAge || !formData.petBreed) {
      setError("Please fill in all required pet information")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          petName: formData.petName,
          petAge: formData.petAge,
          petBreed: formData.petBreed,
          petWeight: formData.petWeight,
          petColor: formData.petColor,
          petDateOfBirth: formData.petDateOfBirth,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.userId)
      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="glass-effect-dark rounded-3xl p-8 text-white">
          {/* Step indicators */}
          <div className="flex gap-4 mb-8">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 1 ? "bg-pink-400" : "bg-white/20"}`}
            >
              1
            </div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-pink-400" : "bg-white/20"}`}></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 2 ? "bg-pink-400" : "bg-white/20"}`}
            >
              2
            </div>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-white/80 mb-6">Join thousands of happy pet parents</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Full Name</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Password</label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Confirm Password</label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                {error && <p className="text-red-300 text-sm">{error}</p>}

                <Button
                  onClick={handleNextStep}
                  className="w-full gradient-pink-teal text-white font-semibold py-3 rounded-xl mt-6"
                >
                  Next Step →
                </Button>
              </div>

              <p className="text-center text-white/80 mt-6">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-pink-300 hover:text-pink-200 font-semibold">
                  Sign in here
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2">Almost Done!</h2>
              <p className="text-white/80 mb-6">Tell us about your furry friend</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Pet Name</label>
                  <Input
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    placeholder="Enter pet name"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Age</label>
                    <Input
                      name="petAge"
                      value={formData.petAge}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 years"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Breed</label>
                    <Input
                      name="petBreed"
                      value={formData.petBreed}
                      onChange={handleInputChange}
                      placeholder="e.g., Labrador"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Weight (optional)</label>
                    <Input
                      name="petWeight"
                      value={formData.petWeight}
                      onChange={handleInputChange}
                      placeholder="e.g., 25 kg"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Color (optional)</label>
                    <Input
                      name="petColor"
                      value={formData.petColor}
                      onChange={handleInputChange}
                      placeholder="e.g., Golden"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Date of Birth (optional)</label>
                  <Input
                    name="petDateOfBirth"
                    type="date"
                    value={formData.petDateOfBirth}
                    onChange={handleInputChange}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                {error && <p className="text-red-300 text-sm">{error}</p>}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 gradient-pink-teal text-white font-semibold"
                  >
                    {loading ? "Creating..." : "Create Account →"}
                  </Button>
                </div>
              </div>

              <p className="text-center text-white/80 mt-6">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-pink-300 hover:text-pink-200 font-semibold">
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
