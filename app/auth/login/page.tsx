"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
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
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl">
              🐾
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Welcome Back!</h2>
          <p className="text-center text-white/80 mb-8">Sign in to your pet care account</p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Enter your password"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link href="#" className="text-pink-300 hover:text-pink-200 text-sm font-semibold">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-pink-teal text-white font-semibold py-3 rounded-xl mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-white/80 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-pink-300 hover:text-pink-200 font-semibold">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
