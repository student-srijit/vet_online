"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in by checking for token in localStorage
    const token = localStorage.getItem("token")

    if (token) {
      // If logged in, redirect to dashboard
      router.push("/dashboard")
    } else {
      // If not logged in, redirect to login
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-teal-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">AutoPaws</h1>
        <p className="text-xl text-white/80">One Stop Pet Feeding Solution</p>
        <p className="text-white/60 mt-4">Redirecting...</p>
      </div>
    </div>
  )
}
