"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { User, Lock, Bell, Shield, Trash2 } from "lucide-react"

interface User {
  _id: string
  fullName: string
  email: string
  pets: any[]
  createdAt: Date
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    mealReminders: true,
    vetAppointments: true,
    healthAlerts: true,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setFormData({
            fullName: data.user.fullName,
            email: data.user.email,
          })
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          window.location.href = "/auth/login"
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotifications((prev) => ({ ...prev, [name]: checked }))
  }

  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Profile updated successfully!")
        // Refresh user data
        const profileResponse = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (profileResponse.ok) {
          const data = await profileResponse.json()
          setUser(data.user)
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to update profile: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("An error occurred while updating your profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      })

      if (response.ok) {
        alert("Password updated successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        alert(`Failed to update password: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("An error occurred while updating your password")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    if (!confirm("This will permanently delete all your data including pet information. Are you absolutely sure?")) {
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Account deleted successfully")
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        window.location.href = "/"
      } else {
        const errorData = await response.json()
        alert(`Failed to delete account: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("An error occurred while deleting your account")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading settings...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No user data found</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="gradient-pink-teal rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-white/90">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Settings</h3>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === "profile" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User size={20} />
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === "security" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Lock size={20} />
                <span className="text-sm font-medium">Security</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === "notifications" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bell size={20} />
                <span className="text-sm font-medium">Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === "privacy" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Shield size={20} />
                <span className="text-sm font-medium">Privacy</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {activeTab === "profile" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      {saving ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Current Password</label>
                    <Input
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">New Password</label>
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Confirm New Password</label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handlePasswordUpdate}
                      disabled={saving}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      {saving ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notifications.emailNotifications}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive push notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={notifications.pushNotifications}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Meal Reminders</h4>
                      <p className="text-sm text-gray-600">Get reminded about pet meal times</p>
                    </div>
                    <input
                      type="checkbox"
                      name="mealReminders"
                      checked={notifications.mealReminders}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Vet Appointments</h4>
                      <p className="text-sm text-gray-600">Reminders for vet appointments</p>
                    </div>
                    <input
                      type="checkbox"
                      name="vetAppointments"
                      checked={notifications.vetAppointments}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Health Alerts</h4>
                      <p className="text-sm text-gray-600">Important health notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      name="healthAlerts"
                      checked={notifications.healthAlerts}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Privacy & Data</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 size={16} className="mr-2" />
                      {saving ? "Deleting..." : "Delete Account"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
